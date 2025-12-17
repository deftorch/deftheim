use crate::error::{AppError, Result};
use crate::models::ModInfo;
use crate::services::thunderstore_service::ThunderstoreService;
use std::path::Path;
use std::fs;
use std::io::Cursor;
use walkdir::WalkDir;
use serde::Deserialize;
use tauri::State;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
struct Manifest {
    name: String,
    version_number: String,
    website_url: Option<String>,
    description: Option<String>,
    dependencies: Option<Vec<String>>,
}

#[tauri::command]
pub async fn get_thunderstore_mods(state: State<'_, AppState>) -> Result<Vec<ModInfo>> {
    tracing::info!("Fetching Thunderstore mods...");
    let service = ThunderstoreService::new(state.db.clone());
    service.fetch_and_cache_mods().await
}

#[tauri::command]
pub async fn scan_mods(repository_path: String) -> Result<Vec<ModInfo>> {
    tracing::info!("Scanning mods in: {}", repository_path);
    let mut mods = Vec::new();
    let repo_path = Path::new(&repository_path);

    if !repo_path.exists() {
        return Ok(vec![]);
    }

    // We expect each folder in repository_path to be a mod folder
    for entry in std::fs::read_dir(repo_path)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            let manifest_path = path.join("manifest.json");
            if manifest_path.exists() {
                if let Ok(content) = fs::read_to_string(&manifest_path) {
                    if let Ok(manifest) = serde_json::from_str::<Manifest>(&content) {
                        let id = path.file_name().unwrap().to_string_lossy().to_string();
                        // Try to parse author from ID (Author-Name-Version) or just directory name
                        // This is heuristic.
                        let parts: Vec<&str> = id.split('-').collect();
                        let author = if parts.len() >= 2 { parts[0].to_string() } else { "Unknown".to_string() };

                        // Calculate size
                        let size = WalkDir::new(&path).into_iter().filter_map(|e| e.ok()).map(|e| e.metadata().map(|m| m.len()).unwrap_or(0)).sum();

                        mods.push(ModInfo {
                            id: id.clone(),
                            name: manifest.name,
                            version: manifest.version_number,
                            author,
                            description: manifest.description.unwrap_or_default(),
                            icon: None, // TODO: Load icon.png if exists
                            size,
                            installed: true,
                            enabled: false, // This depends on profile, scan_mods just lists repo?
                            dependencies: manifest.dependencies.unwrap_or_default(),
                            categories: vec![],
                            download_url: None,
                            website_url: manifest.website_url,
                            rating: None,
                            downloads: None,
                            last_updated: String::new(), // Metadata doesn't have this
                        });
                    }
                }
            }
        }
    }

    Ok(mods)
}

#[tauri::command]
pub async fn install_mod(state: State<'_, AppState>, repository_path: String, mod_id: String, url: String) -> Result<()> {
    tracing::info!("Starting installation for: {}", mod_id);
    let mut visited = std::collections::HashSet::new();
    install_mod_recursive(&state, &repository_path, &mod_id, &url, &mut visited).await
}

// Recursive helper function
#[async_recursion::async_recursion]
async fn install_mod_recursive(
    state: &AppState,
    repository_path: &str,
    mod_id: &str,
    url: &str,
    visited: &mut std::collections::HashSet<String>
) -> Result<()> {
    if visited.contains(mod_id) {
        tracing::info!("Mod {} already visited, skipping recursion", mod_id);
        return Ok(());
    }
    visited.insert(mod_id.to_string());

    tracing::info!("Installing mod: {} from {}", mod_id, url);
    let target_dir = Path::new(repository_path).join(mod_id);

    // Download and Install (only if not already exists or force overwrite - currently skipping if exists)
    // Note: To support updates, we might want to overwrite. For now, let's assume if dir exists, it's installed.
    if !target_dir.exists() {
        // Download
        let response = reqwest::get(url).await?;
        let content = response.bytes().await?;

        // Unzip
        let reader = Cursor::new(content);
        let mut archive = zip::ZipArchive::new(reader).map_err(|e| AppError::Custom(e.to_string()))?;

        fs::create_dir_all(&target_dir)?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| AppError::Custom(e.to_string()))?;
            let outpath = match file.enclosed_name() {
                Some(path) => target_dir.join(path),
                None => continue,
            };

            if file.name().ends_with('/') {
                fs::create_dir_all(&outpath)?;
            } else {
                if let Some(p) = outpath.parent() {
                    if !p.exists() {
                        fs::create_dir_all(p)?;
                    }
                }
                let mut outfile = fs::File::create(&outpath)?;
                std::io::copy(&mut file, &mut outfile)?;
            }
        }

        // Parse manifest and update DB
        let manifest_path = target_dir.join("manifest.json");
        if manifest_path.exists() {
            if let Ok(content) = fs::read_to_string(&manifest_path) {
                if let Ok(manifest) = serde_json::from_str::<Manifest>(&content) {
                    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;

                    conn.execute(
                        "INSERT OR IGNORE INTO mods (id, name, owner, full_name, package_url, date_created, date_updated, uuid4, rating_score, is_pinned, is_deprecated, has_nsfw_content)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                        (
                            mod_id,
                            &manifest.name,
                            "Unknown",
                            mod_id,
                            url,
                            "", "", "", 0, false, false, false
                        ),
                    )?;

                    conn.execute(
                        "INSERT OR IGNORE INTO mod_versions (full_name, mod_id, name, description, icon, version_number, download_url, downloads, date_created, website_url, is_active, uuid4, file_size)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                        (
                            mod_id,
                            mod_id,
                            &manifest.name,
                            &manifest.description.unwrap_or_default(),
                            "",
                            &manifest.version_number,
                            url,
                            0, "",
                            &manifest.website_url.unwrap_or_default(),
                            true, "", 0
                        ),
                    )?;

                    // Insert dependencies from manifest
                    if let Some(deps) = manifest.dependencies {
                        for dep in deps {
                            conn.execute(
                                "INSERT OR IGNORE INTO mod_dependencies (version_full_name, dependency_id) VALUES (?1, ?2)",
                                (mod_id, &dep),
                            )?;
                        }
                    }
                }
            }
        }
    } else {
        tracing::info!("Mod {} already installed at {:?}", mod_id, target_dir);
    }

    // Resolve Dependencies
    let dependencies: Vec<String> = {
        let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
        let mut stmt = conn.prepare("SELECT dependency_id FROM mod_dependencies WHERE version_full_name = ?")?;
        let rows = stmt.query_map([mod_id], |row| row.get(0))?;
        let mut deps = Vec::new();
        for r in rows {
            if let Ok(d) = r {
                deps.push(d);
            }
        }
        deps
    };

    tracing::info!("Found {} dependencies for {}", dependencies.len(), mod_id);

    for dep_id in dependencies {
        // Find download URL for dependency
        let dep_url: Option<String> = {
            let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
            let mut stmt = conn.prepare("SELECT download_url FROM mod_versions WHERE full_name = ?")?;
            let mut rows = stmt.query([&dep_id])?;
            if let Some(row) = rows.next()? {
                row.get(0).ok()
            } else {
                None
            }
        };

        if let Some(url) = dep_url {
            tracing::info!("Recursively installing dependency: {}", dep_id);
            // Box::pin is handled by async_recursion macro
            install_mod_recursive(state, repository_path, &dep_id, &url, visited).await?;
        } else {
            tracing::warn!("Could not find download URL for dependency: {}", dep_id);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn uninstall_mod(repository_path: String, mod_id: String) -> Result<()> {
    tracing::info!("Uninstalling mod: {}", mod_id);
    let target_dir = Path::new(&repository_path).join(&mod_id);
    if target_dir.exists() {
        fs::remove_dir_all(target_dir)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn enable_mod(repository_path: String, game_plugins_path: String, mod_id: String) -> Result<()> {
    tracing::info!("Enabling mod: {}", mod_id);
    let source_dir = Path::new(&repository_path).join(&mod_id);
    let target_dir = Path::new(&game_plugins_path).join(&mod_id);

    if !source_dir.exists() {
        return Err(AppError::ModNotFound(mod_id));
    }

    if target_dir.exists() {
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        match std::os::windows::fs::symlink_dir(&source_dir, &target_dir) {
            Ok(_) => Ok(()),
            Err(_) => link_dir_contents(&source_dir, &target_dir).map_err(AppError::Io)
        }?;
    }
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(&source_dir, &target_dir)?;
    }

    Ok(())
}

#[tauri::command]
pub async fn disable_mod(game_plugins_path: String, mod_id: String) -> Result<()> {
    tracing::info!("Disabling mod: {}", mod_id);
    let target_dir = Path::new(&game_plugins_path).join(&mod_id);
    if target_dir.exists() {
        #[cfg(unix)]
        fs::remove_file(&target_dir).or_else(|_| fs::remove_dir_all(&target_dir))?;

        #[cfg(target_os = "windows")]
        fs::remove_dir_all(&target_dir)?;
    }
    Ok(())
}

// Helper for recursive hardlinking (Windows fallback)
#[cfg(target_os = "windows")]
fn link_dir_contents(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in WalkDir::new(src) {
        let entry = entry?;
        let path = entry.path();
        let rel_path = path.strip_prefix(src).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        let target_path = dst.join(rel_path);

        if path.is_dir() {
            fs::create_dir_all(&target_path)?;
        } else {
            fs::hard_link(path, &target_path)?;
        }
    }
    Ok(())
}
