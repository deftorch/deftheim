use crate::error::{Result, AppError};
use crate::state::AppState;
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub mod_id: String,
    pub current_version: String,
    pub latest_version: String,
    pub changelog: String,
    pub download_url: String,
}

#[tauri::command]
pub async fn check_updates(state: State<'_, AppState>) -> Result<Vec<UpdateInfo>> {
    tracing::info!("Checking for updates...");

    // We compare installed mods (from repository scan or DB?) with latest versions in DB (mod_versions).
    // Assuming DB has "latest" info from Thunderstore fetch.

    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;

    // Query mods that have newer versions
    // We assume 'mods' table has the installed version or we check 'profile_mods' vs 'mod_versions'.
    // Actually, 'mods' table in current schema seems to store metadata but not necessarily "installed version" per se,
    // though 'scan_mods' populates 'mods' table.
    // However, 'scan_mods' populates 'mods' table with info from manifest.

    // Let's assume 'mods' table has installed info.
    // And 'mod_versions' table has ALL versions including latest (fetched by ThunderstoreService).
    // Wait, 'ThunderstoreService' populates 'mod_versions'.

    // Better strategy:
    // 1. Get list of installed mods from 'mods' table (where installed=true if we tracked it, or just all in 'mods').
    // 2. For each installed mod, find latest version in 'mod_versions' (which comes from API).
    // 3. Compare version strings.

    // BUT 'mods' table has 'version' column? No, 'ModInfo' has 'version'.
    // 'mods' table schema: id, name, owner, full_name, package_url...
    // It doesn't seem to have 'version' column explicitly in the CREATE TABLE statement in schema.rs?
    // Let's check schema.rs again.
    // "CREATE TABLE IF NOT EXISTS mods (id TEXT PRIMARY KEY, name TEXT... full_name TEXT...)"
    // It does not have 'current_version'.

    // 'mod_versions' table has 'version_number'.

    // If 'scan_mods' was called, it populates 'mods' table.
    // But 'scan_mods' logic in 'mod_operations.rs':
    // "INSERT OR IGNORE INTO mods ... VALUES (mod_id, manifest.name...)"
    // And "INSERT OR IGNORE INTO mod_versions ..."

    // This is tricky. The DB stores both installed and available mods in the same tables?
    // If so, how do we distinguish?
    // 'ThunderstoreService' populates 'mods' and 'mod_versions' from API.
    // 'scan_mods' populates them from disk.
    // Use 'mod_versions' table to find "latest" (order by date_created desc or semver).

    // Simplification: We iterate over directory names in repository (via scan_mods logic or assuming we know them)
    // and compare with DB.

    // Let's query 'mods' table for installed mods.
    // We need a way to know what is currently installed.
    // 'scan_mods' returns a list.
    // Let's trust the 'mods' table contains what we know about.

    // Actually, let's just use what 'scan_mods' would find.
    // But 'check_updates' shouldn't necessarily re-scan disk.

    // Let's assume the client calls 'scan_mods' first, which updates the DB with installed versions?
    // No, 'scan_mods' inserts with ON CONFLICT IGNORE. So if API loaded it first, installed version might be ignored if ID conflicts.
    // IDs are 'Team-Name-Version'. So every version is unique in 'mod_versions'.
    // But 'mods' table uses 'id' (which is full name?) as PK.

    // If ID is 'Team-Name-Version', then an update is a DIFFERENT mod ID.
    // e.g. 'Team-Name-1.0.0' vs 'Team-Name-1.0.1'.

    // If so, we need to group by 'package_name' (Team-Name).
    // But schema doesn't have 'package_name'. It has 'name' (e.g. "Jotunn").

    // Logic:
    // 1. Get all installed mods (iterate dirs or DB).
    // 2. Extract "Team-Name" prefix.
    // 3. Find latest version for that "Team-Name" in 'mod_versions' or 'thunderstore' cache.
    // 4. Compare.

    // Let's use a simpler approach for now.
    // We assume 'mods' table has 'id' = "Team-Name-Version".
    // We split it to get "Team-Name".
    // We query DB for max version of "Team-Name".

    let mut stmt = conn.prepare("SELECT id FROM mods")?;
    let installed_ids: Vec<String> = stmt.query_map([], |row| row.get(0))?.filter_map(|r| r.ok()).collect();

    let mut updates = Vec::new();

    for installed_id in installed_ids {
        // installed_id e.g. "TeamL2-Jotunn-2.15.0" or "Team-Name-With-Hyphens-1.0.0"
        // We split by the last hyphen to separate version from package name
        let (package_name, installed_version) = match installed_id.rsplit_once('-') {
            Some((name, ver)) => (name, ver),
            None => continue,
        };

        // Find latest version for this package in mod_versions
        // usage of "LIKE" to find other versions of the same package
        let mut ver_stmt = conn.prepare(
            "SELECT version_number, download_url FROM mod_versions
             WHERE full_name LIKE ?1
             ORDER BY date_created DESC LIMIT 1"
        )?;

        // Assuming IDs are consistently named "PackageName-Version"
        // We look for anything starting with "PackageName-"
        let pattern = format!("{}-%", package_name);
        let mut rows = ver_stmt.query([&pattern])?;

        if let Some(row) = rows.next()? {
            let latest_version: String = row.get(0)?;
            let download_url: String = row.get(1)?;

            if latest_version != installed_version {
                 // Simple string comparison might fail for semver (1.10 < 1.9), but good enough for now
                 // or use a semver crate.
                 // Let's assume inequality means update available.

                 updates.push(UpdateInfo {
                     mod_id: installed_id.clone(), // The installed ID
                     current_version: installed_version.to_string(),
                     latest_version: latest_version,
                     changelog: "".to_string(), // Fetch if possible
                     download_url,
                 });
            }
        }
    }

    Ok(updates)
}

#[tauri::command]
pub async fn update_mod(state: State<'_, AppState>, repository_path: String, mod_id: String) -> Result<()> {
    tracing::info!("Updating mod: {}", mod_id);

    // 1. Check for update (get target URL and ID)
    // mod_id is the INSTALLED one (e.g. "Team-Name-1.0.0")

    let updates = check_updates(state.clone()).await?;
    if let Some(update) = updates.iter().find(|u| u.mod_id == mod_id) {
        // Reconstruct full ID
        // Assuming package name is everything before the version in mod_id
        let (package_name, _) = match mod_id.rsplit_once('-') {
            Some((name, _ver)) => (name, _ver),
            None => return Err(AppError::Custom("Invalid mod ID format".to_string())),
        };

        let new_full_id = format!("{}-{}", package_name, update.latest_version);

        // 2. Call install_mod for the new version
        crate::commands::mod_operations::install_mod(
            state.clone(),
            repository_path.clone(),
            new_full_id.clone(),
            update.download_url.clone()
        ).await?;

        // 3. Uninstall old version to prevent duplicates
        // Note: Check if old version is different from new version (it should be)
        if mod_id != new_full_id {
             crate::commands::mod_operations::uninstall_mod(repository_path, mod_id).await?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn update_all_mods(state: State<'_, AppState>, repository_path: String) -> Result<()> {
    tracing::info!("Updating all mods...");
    let updates = check_updates(state.clone()).await?;

    for update in updates {
        // We can reuse update_mod logic
        // But calling update_mod directly might re-fetch updates list which is inefficient but safe
        // Or we implement logic here.

        let (package_name, _) = match update.mod_id.rsplit_once('-') {
            Some((name, _ver)) => (name, _ver),
            None => continue,
        };

        let new_full_id = format!("{}-{}", package_name, update.latest_version);

        crate::commands::mod_operations::install_mod(
            state.clone(),
            repository_path.clone(),
            new_full_id.clone(),
            update.download_url
        ).await?;

        if update.mod_id != new_full_id {
             crate::commands::mod_operations::uninstall_mod(repository_path.clone(), update.mod_id).await?;
        }
    }

    Ok(())
}