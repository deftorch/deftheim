use crate::{error::{Result, AppError}, models::Profile, state::AppState};
use tauri::State;
use std::io::{Read, Write};
use base64::{Engine as _, engine::general_purpose};
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use flate2::Compression;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ProfileManifest {
    name: String,
    mods: Vec<ProfileModEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProfileModEntry {
    name: String, // Full name: Team-Name-Version
    enabled: bool,
}

#[tauri::command]
pub async fn create_profile(state: State<'_, AppState>, name: String) -> Result<Profile> {
    tracing::info!("Creating profile: {}", name);
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let profile = Profile {
        id: id.clone(),
        name: name.clone(),
        description: String::new(),
        icon: String::new(),
        color: String::new(),
        mods: vec![],
        active: false,
        created: now.clone(),
        last_used: now.clone(),
        play_time: 0,
    };

    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
    conn.execute(
        "INSERT INTO profiles (id, name, description, icon, color, active, created, last_used, play_time)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &profile.id,
            &profile.name,
            &profile.description,
            &profile.icon,
            &profile.color,
            false,
            &profile.created,
            &profile.last_used,
            profile.play_time
        ),
    )?;

    Ok(profile)
}

#[tauri::command]
pub async fn update_profile(id: String, updates: serde_json::Value) -> Result<()> {
    tracing::info!("Updating profile: {}", id);

    // TODO: Implement profile update

    Ok(())
}

#[tauri::command]
pub async fn delete_profile(id: String) -> Result<()> {
    tracing::info!("Deleting profile: {}", id);

    // TODO: Implement profile deletion

    Ok(())
}

#[tauri::command]
pub async fn switch_profile(id: String) -> Result<()> {
    tracing::info!("Switching to profile: {}", id);

    // TODO: Implement profile switching
    // 1. Disable current profile mods
    // 2. Enable new profile mods
    // 3. Update database

    Ok(())
}

#[tauri::command]
pub async fn list_profiles(state: State<'_, AppState>) -> Result<Vec<Profile>> {
    tracing::info!("Listing profiles");
    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
    let mut stmt = conn.prepare("SELECT id, name, description, icon, color, active, created, last_used, play_time FROM profiles")?;

    let rows = stmt.query_map([], |row| {
        Ok(Profile {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            icon: row.get(3)?,
            color: row.get(4)?,
            active: row.get(5)?,
            created: row.get(6)?,
            last_used: row.get(7)?,
            play_time: row.get(8)?,
            mods: vec![], // TODO: Load mods for each profile if needed
        })
    })?;

    let mut profiles = Vec::new();
    for row in rows {
        profiles.push(row?);
    }

    Ok(profiles)
}

#[tauri::command]
pub async fn export_profile_to_code(state: State<'_, AppState>, profile_id: String) -> Result<String> {
    tracing::info!("Exporting profile: {}", profile_id);
    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;

    // Get profile name
    let profile_name: String = conn.query_row(
        "SELECT name FROM profiles WHERE id = ?1",
        [&profile_id],
        |row| row.get(0),
    )?;

    // Get mods
    let mut stmt = conn.prepare("SELECT mod_id, enabled, version FROM profile_mods WHERE profile_id = ?1")?;
    let mod_rows = stmt.query_map([&profile_id], |row| {
        let mod_id: String = row.get(0)?;
        let enabled: bool = row.get(1)?;
        let _version: String = row.get(2)?; // Not using version in simple export yet, assuming mod_id has it or handled
        Ok(ProfileModEntry {
            name: mod_id, // This should be full name like Team-Name-Version
            enabled,
        })
    })?;

    let mut mods = Vec::new();
    for m in mod_rows {
        mods.push(m?);
    }

    let manifest = ProfileManifest {
        name: profile_name,
        mods,
    };

    let json = serde_json::to_string(&manifest).map_err(|e| AppError::Custom(e.to_string()))?;

    // Gzip
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(json.as_bytes())?;
    let compressed = encoder.finish()?;

    // Base64
    let code = general_purpose::STANDARD.encode(compressed);

    Ok(code)
}

#[tauri::command]
pub async fn import_profile_from_code(state: State<'_, AppState>, code: String, new_name: String) -> Result<Profile> {
    tracing::info!("Importing profile from code...");

    // Decode Base64
    let compressed = general_purpose::STANDARD.decode(&code).map_err(|e| AppError::Custom(format!("Base64 decode failed: {}", e)))?;

    // Gunzip
    let mut decoder = GzDecoder::new(&compressed[..]);
    let mut json = String::new();
    decoder.read_to_string(&mut json)?;

    // Parse JSON
    let manifest: ProfileManifest = serde_json::from_str(&json).map_err(|e| AppError::Custom(format!("JSON parse failed: {}", e)))?;

    // Create Profile
    let mut new_profile = create_profile(state.clone(), new_name).await?;

    // Add mods to profile_mods
    // Also trigger install? Ideally yes, but install_mod requires repository path etc.
    // For now we just populate the database. The user might need to "Sync" or "Update All".
    // Or we can assume we need to trigger installs.

    // To properly install, we need to know repository path, which is in settings.
    // Since we don't have settings passed here easily without reading DB or args,
    // we will just register the mods in the profile.
    // The frontend should probably trigger "Sync Profile" or "Install Missing Mods" after import.

    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;

    for mod_entry in manifest.mods {
        // mod_entry.name is "Team-Name-Version"
        // Insert into profile_mods
        conn.execute(
            "INSERT OR REPLACE INTO profile_mods (profile_id, mod_id, enabled, version) VALUES (?1, ?2, ?3, ?4)",
            (&new_profile.id, &mod_entry.name, mod_entry.enabled, "0.0.0"), // TODO: Parse version from name
        )?;
    }

    Ok(new_profile)
}