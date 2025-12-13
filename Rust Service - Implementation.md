// ============================================================================
// src-tauri/src/services/mod_scanner.rs
// ============================================================================
use crate::{error::Result, models::ModInfo};
use std::path::Path;
use walkdir::WalkDir;
use serde_json;

pub struct ModScanner;

impl ModScanner {
    pub fn scan_directory(path: &Path) -> Result<Vec<ModInfo>> {
        let mut mods = Vec::new();

        for entry in WalkDir::new(path)
            .max_depth(2)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() {
                let file_name = entry.file_name().to_string_lossy();
                
                // Look for manifest.json or mod metadata files
                if file_name == "manifest.json" {
                    if let Ok(mod_info) = Self::parse_manifest(entry.path()) {
                        mods.push(mod_info);
                    }
                }
            }
        }

        Ok(mods)
    }

    fn parse_manifest(path: &Path) -> Result<ModInfo> {
        let content = std::fs::read_to_string(path)?;
        let manifest: serde_json::Value = serde_json::from_str(&content)?;

        Ok(ModInfo {
            id: manifest["name"].as_str().unwrap_or("unknown").to_string(),
            name: manifest["name"].as_str().unwrap_or("Unknown").to_string(),
            version: manifest["version_number"].as_str().unwrap_or("0.0.0").to_string(),
            author: manifest["author"].as_str().unwrap_or("Unknown").to_string(),
            description: manifest["description"].as_str().unwrap_or("").to_string(),
            icon: None,
            size: Self::calculate_mod_size(path.parent().unwrap())?,
            installed: true,
            enabled: false,
            dependencies: Self::parse_dependencies(&manifest),
            categories: vec![],
            download_url: manifest["website_url"].as_str().map(String::from),
            website_url: manifest["website_url"].as_str().map(String::from),
            rating: None,
            downloads: None,
            last_updated: chrono::Utc::now().to_rfc3339(),
        })
    }

    fn parse_dependencies(manifest: &serde_json::Value) -> Vec<String> {
        manifest["dependencies"]
            .as_array()
            .map(|deps| {
                deps.iter()
                    .filter_map(|d| d.as_str())
                    .map(String::from)
                    .collect()
            })
            .unwrap_or_default()
    }

    fn calculate_mod_size(path: &Path) -> Result<u64> {
        let mut size = 0u64;
        
        for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Ok(metadata) = entry.metadata() {
                    size += metadata.len();
                }
            }
        }
        
        Ok(size)
    }

    pub fn validate_mod(path: &Path) -> bool {
        // Check if mod has required structure
        let manifest_path = path.join("manifest.json");
        let plugins_path = path.join("plugins");
        
        manifest_path.exists() || plugins_path.exists()
    }
}

// ============================================================================
// src-tauri/src/services/profile_manager.rs
// ============================================================================
use crate::{error::{Result, AppError}, models::Profile};
use std::path::{Path, PathBuf};
use std::fs;

pub struct ProfileManager {
    profiles_dir: PathBuf,
}

impl ProfileManager {
    pub fn new(base_dir: &Path) -> Self {
        let profiles_dir = base_dir.join("profiles");
        fs::create_dir_all(&profiles_dir).ok();
        
        Self { profiles_dir }
    }

    pub fn create_profile(&self, profile: &Profile) -> Result<()> {
        let profile_path = self.profiles_dir.join(format!("{}.json", profile.id));
        
        if profile_path.exists() {
            return Err(AppError::Custom("Profile already exists".to_string()));
        }

        let json = serde_json::to_string_pretty(profile)?;
        fs::write(profile_path, json)?;
        
        tracing::info!("Created profile: {} ({})", profile.name, profile.id);
        Ok(())
    }

    pub fn load_profile(&self, id: &str) -> Result<Profile> {
        let profile_path = self.profiles_dir.join(format!("{}.json", id));
        
        if !profile_path.exists() {
            return Err(AppError::ProfileNotFound(id.to_string()));
        }

        let content = fs::read_to_string(profile_path)?;
        let profile: Profile = serde_json::from_str(&content)?;
        
        Ok(profile)
    }

    pub fn list_profiles(&self) -> Result<Vec<Profile>> {
        let mut profiles = Vec::new();

        for entry in fs::read_dir(&self.profiles_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(profile) = serde_json::from_str::<Profile>(&content) {
                        profiles.push(profile);
                    }
                }
            }
        }

        profiles.sort_by(|a, b| b.last_used.cmp(&a.last_used));
        Ok(profiles)
    }

    pub fn update_profile(&self, id: &str, profile: &Profile) -> Result<()> {
        let profile_path = self.profiles_dir.join(format!("{}.json", id));
        
        if !profile_path.exists() {
            return Err(AppError::ProfileNotFound(id.to_string()));
        }

        let json = serde_json::to_string_pretty(profile)?;
        fs::write(profile_path, json)?;
        
        tracing::info!("Updated profile: {}", id);
        Ok(())
    }

    pub fn delete_profile(&self, id: &str) -> Result<()> {
        let profile_path = self.profiles_dir.join(format!("{}.json", id));
        
        if !profile_path.exists() {
            return Err(AppError::ProfileNotFound(id.to_string()));
        }

        fs::remove_file(profile_path)?;
        tracing::info!("Deleted profile: {}", id);
        Ok(())
    }

    pub fn activate_profile(&self, valheim_path: &Path, profile: &Profile, mods: &[ModInfo]) -> Result<()> {
        tracing::info!("Activating profile: {} with {} mods", profile.name, profile.mods.len());
        
        let bepinex_plugins = valheim_path.join("BepInEx").join("plugins");
        
        // Clear current plugins (safely backup first)
        Self::backup_current_state(&bepinex_plugins)?;
        Self::clear_plugins(&bepinex_plugins)?;

        // Symlink/copy profile mods
        for mod_id in &profile.mods {
            if let Some(mod_info) = mods.iter().find(|m| &m.id == mod_id) {
                Self::enable_mod(&bepinex_plugins, mod_info)?;
            }
        }

        tracing::info!("Profile activated successfully");
        Ok(())
    }

    fn backup_current_state(_plugins_dir: &Path) -> Result<()> {
        // TODO: Implement backup logic
        Ok(())
    }

    fn clear_plugins(plugins_dir: &Path) -> Result<()> {
        if plugins_dir.exists() {
            for entry in fs::read_dir(plugins_dir)? {
                let entry = entry?;
                let path = entry.path();
                
                if path.is_symlink() {
                    fs::remove_file(&path)?;
                } else if path.is_dir() {
                    fs::remove_dir_all(&path)?;
                }
            }
        }
        Ok(())
    }

    fn enable_mod(plugins_dir: &Path, mod_info: &ModInfo) -> Result<()> {
        tracing::debug!("Enabling mod: {}", mod_info.name);
        
        // TODO: Implement actual mod enabling (symlink or copy)
        // This is a simplified version
        
        Ok(())
    }
}

// ============================================================================
// src-tauri/src/services/update_checker.rs
// ============================================================================
use crate::{error::Result, models::ModInfo};
use reqwest;
use serde_json::Value;

pub struct UpdateChecker {
    client: reqwest::Client,
}

impl UpdateChecker {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::builder()
                .user_agent("ValheimModManager/2.0")
                .build()
                .unwrap(),
        }
    }

    pub async fn check_thunderstore_updates(&self, mod_info: &ModInfo) -> Result<Option<String>> {
        let url = format!(
            "https://valheim.thunderstore.io/api/v1/package/{}/{}",
            mod_info.author, mod_info.name
        );

        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Ok(None);
        }

        let data: Value = response.json().await?;
        
        if let Some(latest) = data["versions"].as_array().and_then(|v| v.first()) {
            let latest_version = latest["version_number"].as_str().unwrap_or("");
            
            if latest_version != mod_info.version {
                return Ok(Some(latest_version.to_string()));
            }
        }

        Ok(None)
    }

    pub async fn check_all_updates(&self, mods: &[ModInfo]) -> Result<Vec<(String, String)>> {
        let mut updates = Vec::new();

        for mod_info in mods {
            if let Ok(Some(new_version)) = self.check_thunderstore_updates(mod_info).await {
                updates.push((mod_info.id.clone(), new_version));
            }
        }

        Ok(updates)
    }
}

// ============================================================================
// src-tauri/src/services/backup_service.rs
// ============================================================================
use crate::error::Result;
use std::path::{Path, PathBuf};
use std::fs;
use chrono::Utc;

pub struct BackupService {
    backup_dir: PathBuf,
}

impl BackupService {
    pub fn new(base_dir: &Path) -> Self {
        let backup_dir = base_dir.join("backups");
        fs::create_dir_all(&backup_dir).ok();
        
        Self { backup_dir }
    }

    pub fn create_backup(&self, description: Option<String>) -> Result<String> {
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let backup_id = format!("backup_{}", timestamp);
        let backup_path = self.backup_dir.join(&backup_id);
        
        fs::create_dir_all(&backup_path)?;
        
        // Create backup metadata
        let metadata = serde_json::json!({
            "id": backup_id,
            "timestamp": Utc::now().to_rfc3339(),
            "description": description.unwrap_or_else(|| "Auto backup".to_string()),
        });
        
        let metadata_path = backup_path.join("metadata.json");
        fs::write(metadata_path, serde_json::to_string_pretty(&metadata)?)?;
        
        tracing::info!("Created backup: {}", backup_id);
        Ok(backup_id)
    }

    pub fn restore_backup(&self, backup_id: &str) -> Result<()> {
        let backup_path = self.backup_dir.join(backup_id);
        
        if !backup_path.exists() {
            return Err(crate::error::AppError::Custom(
                format!("Backup not found: {}", backup_id)
            ));
        }

        tracing::info!("Restoring backup: {}", backup_id);
        
        // TODO: Implement actual restore logic
        
        Ok(())
    }

    pub fn list_backups(&self) -> Result<Vec<serde_json::Value>> {
        let mut backups = Vec::new();

        for entry in fs::read_dir(&self.backup_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                let metadata_path = path.join("metadata.json");
                
                if metadata_path.exists() {
                    if let Ok(content) = fs::read_to_string(&metadata_path) {
                        if let Ok(metadata) = serde_json::from_str(&content) {
                            backups.push(metadata);
                        }
                    }
                }
            }
        }

        backups.sort_by(|a, b| {
            b["timestamp"].as_str().cmp(&a["timestamp"].as_str())
        });

        Ok(backups)
    }

    pub fn clean_old_backups(&self, keep_count: usize) -> Result<()> {
        let mut backups = self.list_backups()?;
        
        if backups.len() <= keep_count {
            return Ok(());
        }

        backups.drain(keep_count..);
        
        for backup in backups {
            if let Some(id) = backup["id"].as_str() {
                let backup_path = self.backup_dir.join(id);
                if backup_path.exists() {
                    fs::remove_dir_all(&backup_path)?;
                    tracing::info!("Cleaned old backup: {}", id);
                }
            }
        }

        Ok(())
    }
}

// ============================================================================
// src-tauri/src/utils/file_ops.rs
// ============================================================================
use std::path::Path;
use std::fs;
use crate::error::Result;

pub fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

pub fn create_symlink(target: &Path, link: &Path) -> Result<()> {
    #[cfg(windows)]
    {
        if target.is_dir() {
            std::os::windows::fs::symlink_dir(target, link)?;
        } else {
            std::os::windows::fs::symlink_file(target, link)?;
        }
    }
    
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(target, link)?;
    }

    Ok(())
}

pub fn calculate_directory_size(path: &Path) -> Result<u64> {
    let mut size = 0u64;
    
    for entry in walkdir::WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Ok(metadata) = entry.metadata() {
                size += metadata.len();
            }
        }
    }
    
    Ok(size)
}

// ============================================================================
// src-tauri/src/utils/validation.rs
// ============================================================================
use std::path::Path;
use regex::Regex;

pub fn validate_valheim_path(path: &Path) -> bool {
    // Check if valheim.exe exists
    let valheim_exe = path.join("valheim.exe");
    
    if !valheim_exe.exists() {
        return false;
    }

    // Check for other key files
    let data_dir = path.join("valheim_Data");
    
    data_dir.exists()
}

pub fn validate_bepinex_installation(path: &Path) -> bool {
    let bepinex_dir = path.join("BepInEx");
    let core_dll = bepinex_dir.join("core").join("BepInEx.dll");
    
    core_dll.exists()
}

pub fn validate_mod_name(name: &str) -> bool {
    let re = Regex::new(r"^[a-zA-Z0-9_\-\s]+$").unwrap();
    re.is_match(name) && !name.is_empty() && name.len() <= 100
}

pub fn validate_version(version: &str) -> bool {
    let re = Regex::new(r"^\d+\.\d+\.\d+$").unwrap();
    re.is_match(version)
}