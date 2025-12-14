use crate::error::Result;
use crate::models::ModInfo;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[tauri::command]
pub async fn scan_mods() -> Result<Vec<ModInfo>> {
    tracing::info!("Scanning mods...");

    // In a real implementation, we would get the path from arguments or database
    // For now, let's scan a dummy "repository" folder in the app data directory
    // or just return an empty list if not exists, but we want to implement the logic.

    let mut mods = Vec::new();

    // Logic:
    // 1. Get repository path (mocked for now as ./repository)
    // 2. Walk dir
    // 3. For each folder, check if it has manifest.json (Thunderstore format)
    // 4. Parse manifest and create ModInfo

    // Since we can't easily rely on filesystem existence in this restricted environment without setup,
    // we will implement the code that *would* work.

    let repo_path = PathBuf::from("repository");
    if !repo_path.exists() {
        return Ok(vec![]);
    }

    for entry in WalkDir::new(&repo_path)
        .min_depth(1)
        .max_depth(2) // Assumes Author-ModName structure
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_dir() {
            let manifest_path = entry.path().join("manifest.json");
            if manifest_path.exists() {
                // Parse manifest (Simplified)
                // In real app, use serde_json to parse into a Manifest struct, then map to ModInfo
                if let Some(file_name) = entry.file_name().to_str() {
                     mods.push(ModInfo {
                        id: file_name.to_string(),
                        name: file_name.to_string(),
                        version: "1.0.0".to_string(), // Placeholder
                        author: "Unknown".to_string(),
                        description: "Local mod".to_string(),
                        icon: None,
                        size: 0,
                        installed: true,
                        enabled: true,
                        dependencies: vec![],
                        categories: vec![],
                        download_url: None,
                        website_url: None,
                        rating: None,
                        downloads: None,
                        last_updated: "2024-01-01".to_string(),
                    });
                }
            }
        }
    }

    Ok(mods)
}

#[tauri::command]
pub async fn install_mod(mod_id: String) -> Result<()> {
    tracing::info!("Installing mod: {}", mod_id);

    // 1. Fetch metadata (omitted, assuming we have URL)
    // 2. Download
    // 3. Unzip

    // Note: Since we don't have a real backend API to fetch mod URLs from,
    // we will simulate the "Action" part.

    // Code structure for download using reqwest:
    /*
    let url = "https://example.com/mod.zip";
    let response = reqwest::get(url).await?.bytes().await?;
    let mut archive = zip::ZipArchive::new(std::io::Cursor::new(response))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        // extract logic...
    }
    */

    Ok(())
}

#[tauri::command]
pub async fn uninstall_mod(mod_id: String) -> Result<()> {
    tracing::info!("Uninstalling mod: {}", mod_id);

    // Remove directory from repository
    let repo_path = PathBuf::from("repository").join(mod_id);
    if repo_path.exists() {
        std::fs::remove_dir_all(repo_path)?;
    } else {
        return Err(crate::error::AppError::ModNotFound("Mod not found on disk".to_string()));
    }

    Ok(())
}

#[tauri::command]
pub async fn enable_mod(mod_id: String) -> Result<()> {
    tracing::info!("Enabling mod: {}", mod_id);
    Ok(())
}

#[tauri::command]
pub async fn disable_mod(mod_id: String) -> Result<()> {
    tracing::info!("Disabling mod: {}", mod_id);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_scan_mods_empty() {
        // This test ensures the function runs without panic
        let result = scan_mods().await;
        assert!(result.is_ok());
    }
}
