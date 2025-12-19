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
use sha2::{Sha256, Digest};
use futures::stream::{self, StreamExt};

/// Validates mod_id to prevent path traversal
fn validate_mod_id(mod_id: &str) -> Result<()> {
    if mod_id.is_empty() {
        return Err(AppError::Custom("Mod ID cannot be empty".into()));
    }
    // Check for suspicious characters that could indicate path traversal
    if mod_id.contains("..") || mod_id.contains('/') || mod_id.contains('\\') {
        return Err(AppError::Custom("Invalid Mod ID: Potential path traversal detected".into()));
    }
    Ok(())
}

/// Validates URL to ensure it points to a trusted domain
fn validate_url(url: &str) -> Result<()> {
    let trusted_domains = ["thunderstore.io", "gcdn.thunderstore.io"];
    let parsed_url = url::Url::parse(url).map_err(|_| AppError::Custom("Invalid URL format".into()))?;

    if let Some(domain) = parsed_url.domain() {
        if trusted_domains.iter().any(|&d| domain == *d || domain.ends_with(&format!(".{}", d))) {
            return Ok(());
        }
    }

    Err(AppError::Custom(format!("URL domain not trusted: {}", url)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use sha2::{Digest, Sha256};

    #[test]
    fn test_validate_mod_id() {
        assert!(validate_mod_id("ValidModId").is_ok());
        assert!(validate_mod_id("Valid-Mod-Id-1.0.0").is_ok());

        // Path traversal attempts
        assert!(validate_mod_id("../../../etc/passwd").is_err());
        assert!(validate_mod_id("Mod/Id").is_err());
        assert!(validate_mod_id("Mod\\Id").is_err());
        assert!(validate_mod_id("..").is_err());

        // Empty
        assert!(validate_mod_id("").is_err());
    }

    #[test]
    fn test_validate_url() {
        assert!(validate_url("https://thunderstore.io/package/download/author/mod/1.0.0/").is_ok());
        assert!(validate_url("https://gcdn.thunderstore.io/live/repository/packages/author-mod-1.0.0.zip").is_ok());
        assert!(validate_url("https://subdomain.thunderstore.io/file").is_ok());

        // Invalid domains
        assert!(validate_url("https://evil.com/malware.zip").is_err());
        assert!(validate_url("http://thunderstore.io.evil.com/file").is_err());
        assert!(validate_url("https://evilthunderstore.io").is_err());

        // Invalid URL format
        assert!(validate_url("not_a_url").is_err());
    }

    #[test]
    fn test_verify_checksum() {
        let content = b"test content";
        let mut hasher = Sha256::new();
        hasher.update(content);
        let correct_hash = hex::encode(hasher.finalize());
        let wrong_hash = "0000000000000000000000000000000000000000000000000000000000000000";

        assert!(verify_checksum(content, &correct_hash).is_ok());
        assert!(verify_checksum(content, wrong_hash).is_err());
        assert!(verify_checksum(content, "").is_ok()); // Optional check skipped
    }
}

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
    let repo_path = repository_path.clone();

    // Offload blocking IO to a separate thread
    let mods = tauri::async_runtime::spawn_blocking(move || {
        let mut mods = Vec::new();
        let path = Path::new(&repo_path);

        if !path.exists() {
            return Ok(vec![]);
        }

        // We expect each folder in repository_path to be a mod folder
        for entry in std::fs::read_dir(path)? {
            let entry = entry?;
            let mod_dir_path = entry.path();
            if mod_dir_path.is_dir() {
                let manifest_path = mod_dir_path.join("manifest.json");
                if manifest_path.exists() {
                    if let Ok(content) = fs::read_to_string(&manifest_path) {
                        if let Ok(manifest) = serde_json::from_str::<Manifest>(&content) {
                            let id = mod_dir_path.file_name().unwrap().to_string_lossy().to_string();
                            // Try to parse author from ID (Author-Name-Version) or just directory name
                            let parts: Vec<&str> = id.split('-').collect();
                            let author = if parts.len() >= 2 { parts[0].to_string() } else { "Unknown".to_string() };

                            // Calculate size
                            let size = WalkDir::new(&mod_dir_path).into_iter().filter_map(|e| e.ok()).map(|e| e.metadata().map(|m| m.len()).unwrap_or(0)).sum();

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
        Ok::<Vec<ModInfo>, std::io::Error>(mods)
    }).await.map_err(|e| AppError::Custom(format!("Task join error: {}", e)))??;

    Ok(mods)
}

fn verify_checksum(content: &[u8], expected_hash: &str) -> Result<()> {
    if expected_hash.is_empty() {
        return Ok(());
    }
    let mut hasher = Sha256::new();
    hasher.update(content);
    let result = hasher.finalize();
    let computed_hash = hex::encode(result);

    if computed_hash != expected_hash {
        return Err(AppError::ChecksumMismatch(expected_hash.to_string(), computed_hash));
    }
    Ok(())
}

#[tauri::command]
pub async fn install_mod(state: State<'_, AppState>, repository_path: String, mod_id: String, url: String) -> Result<()> {
    validate_mod_id(&mod_id)?;
    // Validate URL only if it's provided directly by user (which it is here)
    validate_url(&url)?;

    // For single install, we treat it as an isolated call or entry point.
    // However, the original install_mod was recursive.
    // We should keep the original behavior for backward compatibility or simple use,
    // but we can delegate to the new recursive/parallel logic if possible.
    // But since `install_mod` signature is fixed for frontend (maybe), we should keep it.
    // The original implementation was:

    tracing::info!("Starting installation for: {}", mod_id);
    let mut visited = std::collections::HashSet::new();
    // Re-use recursive implementation but adapted?
    // Actually, let's keep the original sequential implementation as `install_mod_recursive`
    // OR switch to the new one?
    // The new requirement is "Parallel Downloads".
    // So `install_mod` should probably also use parallel if possible?
    // But let's just implement `install_mod_with_deps_parallel` as a NEW command for now,
    // and keep `install_mod` functional (maybe using `install_single_mod` sequentially).

    install_mod_recursive_sequential(&state, &repository_path, &mod_id, &url, &mut visited).await
}

// Renamed old recursive function to keep it for sequential install_mod
#[async_recursion::async_recursion]
async fn install_mod_recursive_sequential(
    state: &AppState,
    repository_path: &str,
    mod_id: &str,
    url: &str,
    visited: &mut std::collections::HashSet<String>
) -> Result<()> {
    validate_mod_id(mod_id)?;

    if visited.contains(mod_id) {
        return Ok(());
    }
    visited.insert(mod_id.to_string());

    // Use install_single_mod logic
    install_single_mod(state, repository_path, mod_id, url, None).await?;

    // Dependencies
    let dependencies = get_dependencies_from_db(state, mod_id)?;
    for dep_id in dependencies {
        if let Some(url) = get_mod_url_from_db(state, &dep_id)? {
             install_mod_recursive_sequential(state, repository_path, &dep_id, &url, visited).await?;
        }
    }
    Ok(())
}

/// Core installation logic used by both sequential and parallel installers.
/// Downloads, verifies, extracts, and registers the mod.
pub async fn install_single_mod(
    state: &AppState,
    repository_path: &str,
    mod_id: &str,
    url: &str,
    expected_hash: Option<&str>
) -> Result<()> {
    validate_mod_id(mod_id)?;
    validate_url(url)?;

    let target_dir = Path::new(repository_path).join(mod_id);
    if !target_dir.exists() {
        tracing::info!("Downloading and installing mod: {} from {}", mod_id, url);
        let response = reqwest::get(url).await?;
        let content = response.bytes().await?;

        if let Some(hash) = expected_hash {
            verify_checksum(&content, hash)?;
        }

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
        update_db_from_manifest(state, &target_dir, mod_id, url)?;

    } else {
        tracing::info!("Mod {} already installed.", mod_id);
    }
    Ok(())
}

fn update_db_from_manifest(state: &AppState, target_dir: &Path, mod_id: &str, url: &str) -> Result<()> {
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
    Ok(())
}

fn get_dependencies_from_db(state: &AppState, mod_id: &str) -> Result<Vec<String>> {
    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
    let mut stmt = conn.prepare("SELECT dependency_id FROM mod_dependencies WHERE version_full_name = ?")?;
    let rows = stmt.query_map([mod_id], |row| row.get(0))?;
    let mut deps = Vec::new();
    for r in rows {
        if let Ok(d) = r {
            deps.push(d);
        }
    }
    Ok(deps)
}

fn get_mod_url_from_db(state: &AppState, mod_id: &str) -> Result<Option<String>> {
    let conn = state.db.lock().map_err(|_| AppError::Custom("DB lock poisoned".to_string()))?;
    let mut stmt = conn.prepare("SELECT download_url FROM mod_versions WHERE full_name = ?")?;
    let mut rows = stmt.query([mod_id])?;
    if let Some(row) = rows.next()? {
        Ok(row.get(0).ok())
    } else {
        Ok(None)
    }
}

// 2. Modifikasi install_mod untuk download parallel dependensi
#[tauri::command]
pub async fn install_mod_with_deps_parallel(
    state: State<'_, AppState>,
    repository_path: String,
    mod_id: String
) -> Result<()> {
    validate_mod_id(&mod_id)?;
    tracing::info!("Starting parallel installation for: {}", mod_id);

    // First ensure the main mod is installed (to get its dependencies if not already in DB?)
    // Actually, usually we know the dependencies from the DB cache if we browsed it.
    // If not, we might need to fetch the mod first.
    // Let's assume the mod is known in DB or passed URL.
    // Wait, this function doesn't take URL. It assumes DB has it.

    let url = get_mod_url_from_db(&state, &mod_id)?.ok_or_else(|| AppError::ModNotFound(mod_id.clone()))?;

    // Install the main mod first
    install_single_mod(&state, &repository_path, &mod_id, &url, None).await?;

    // Now get dependencies
    let dependencies = get_dependencies_from_db(&state, &mod_id)?;
    tracing::info!("Found dependencies for {}: {:?}", mod_id, dependencies);

    // Download paralel dengan batas konkurensi (misal 5)
    let stream = stream::iter(dependencies)
        .map(|dep_id| {
            let state = state.clone();
            let repo = repository_path.clone();
            async move {
                // We need to resolve URL for each dependency
                if let Ok(Some(url)) = get_mod_url_from_db(&state, &dep_id) {
                     install_single_mod(&state, &repo, &dep_id, &url, None).await
                } else {
                    tracing::warn!("Could not find URL for dependency: {}", dep_id);
                    // Just skip if not found?
                    Ok(())
                }
            }
        })
        .buffer_unordered(5); // 5 concurrent downloads

    stream.for_each(|res| async {
        if let Err(e) = res {
            tracing::error!("Failed to install dependency: {}", e);
        }
    }).await;

    Ok(())
}

#[tauri::command]
pub async fn uninstall_mod(repository_path: String, mod_id: String) -> Result<()> {
    validate_mod_id(&mod_id)?;
    tracing::info!("Uninstalling mod: {}", mod_id);
    let target_dir = Path::new(&repository_path).join(&mod_id);
    if target_dir.exists() {
        fs::remove_dir_all(target_dir)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn enable_mod(repository_path: String, game_plugins_path: String, mod_id: String) -> Result<()> {
    validate_mod_id(&mod_id)?;
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
    validate_mod_id(&mod_id)?;
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
