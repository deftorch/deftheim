// ============================================================================
// src-tauri/src/main.rs
// ============================================================================
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use tracing_subscriber;

fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("valheim_mod_manager=debug,info")
        .init();

    tracing::info!("Starting Valheim Mod Manager v2.0.0");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Mod operations
            commands::mod_operations::scan_mods,
            commands::mod_operations::install_mod,
            commands::mod_operations::uninstall_mod,
            commands::mod_operations::enable_mod,
            commands::mod_operations::disable_mod,
            // Profile operations
            commands::profile_operations::create_profile,
            commands::profile_operations::update_profile,
            commands::profile_operations::delete_profile,
            commands::profile_operations::switch_profile,
            commands::profile_operations::list_profiles,
            // System operations
            commands::system_operations::detect_valheim_path,
            commands::system_operations::check_bepinex,
            commands::system_operations::install_bepinex,
            commands::system_operations::launch_valheim,
            // Update operations
            commands::update_operations::check_updates,
            commands::update_operations::update_mod,
            // Backup operations
            commands::backup_operations::create_backup,
            commands::backup_operations::restore_backup,
            commands::backup_operations::list_backups,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ============================================================================
// src-tauri/src/error.rs
// ============================================================================
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Mod not found: {0}")]
    ModNotFound(String),

    #[error("Profile not found: {0}")]
    ProfileNotFound(String),

    #[error("Valheim not found")]
    ValheimNotFound,

    #[error("BepInEx not installed")]
    BepInExNotInstalled,

    #[error("Invalid path: {0}")]
    InvalidPath(String),

    #[error("{0}")]
    Custom(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;

// ============================================================================
// src-tauri/src/models/mod.rs
// ============================================================================
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub icon: Option<String>,
    pub size: u64,
    pub installed: bool,
    pub enabled: bool,
    pub dependencies: Vec<String>,
    pub categories: Vec<String>,
    pub download_url: Option<String>,
    pub website_url: Option<String>,
    pub rating: Option<f32>,
    pub downloads: Option<u64>,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub mods: Vec<String>,
    pub active: bool,
    pub created: String,
    pub last_used: String,
    pub play_time: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub valheim_path: String,
    pub bepinex_path: String,
    pub repository_path: String,
    pub backup_path: String,
    pub theme: String,
    pub auto_update: bool,
    pub auto_backup: bool,
    pub language: String,
}

// ============================================================================
// src-tauri/src/commands/mod_operations.rs
// ============================================================================
use crate::{error::Result, models::ModInfo};

#[tauri::command]
pub async fn scan_mods() -> Result<Vec<ModInfo>> {
    tracing::info!("Scanning mods...");
    
    // TODO: Implement actual mod scanning logic
    // 1. Read repository folder
    // 2. Parse mod metadata
    // 3. Return list of mods
    
    Ok(vec![])
}

#[tauri::command]
pub async fn install_mod(mod_id: String) -> Result<()> {
    tracing::info!("Installing mod: {}", mod_id);
    
    // TODO: Implement mod installation
    // 1. Download mod if needed
    // 2. Extract files
    // 3. Add to repository
    // 4. Update database
    
    Ok(())
}

#[tauri::command]
pub async fn uninstall_mod(mod_id: String) -> Result<()> {
    tracing::info!("Uninstalling mod: {}", mod_id);
    
    // TODO: Implement mod uninstallation
    
    Ok(())
}

#[tauri::command]
pub async fn enable_mod(mod_id: String) -> Result<()> {
    tracing::info!("Enabling mod: {}", mod_id);
    
    // TODO: Implement mod enable (symlink/copy to BepInEx)
    
    Ok(())
}

#[tauri::command]
pub async fn disable_mod(mod_id: String) -> Result<()> {
    tracing::info!("Disabling mod: {}", mod_id);
    
    // TODO: Implement mod disable (remove from BepInEx)
    
    Ok(())
}

// ============================================================================
// src-tauri/src/commands/profile_operations.rs
// ============================================================================
use crate::{error::Result, models::Profile};

#[tauri::command]
pub async fn create_profile(profile: Profile) -> Result<Profile> {
    tracing::info!("Creating profile: {}", profile.name);
    
    // TODO: Implement profile creation
    
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
pub async fn list_profiles() -> Result<Vec<Profile>> {
    tracing::info!("Listing profiles");
    
    // TODO: Implement profile listing
    
    Ok(vec![])
}

// ============================================================================
// src-tauri/src/commands/system_operations.rs
// ============================================================================
use crate::error::Result;

#[tauri::command]
pub async fn detect_valheim_path() -> Result<String> {
    tracing::info!("Detecting Valheim installation...");
    
    // TODO: Implement Valheim detection
    // 1. Check Steam library folders
    // 2. Check registry (Windows)
    // 3. Check common paths
    
    Err(crate::error::AppError::ValheimNotFound)
}

#[tauri::command]
pub async fn check_bepinex() -> Result<bool> {
    tracing::info!("Checking BepInEx installation...");
    
    // TODO: Check if BepInEx is installed
    
    Ok(false)
}

#[tauri::command]
pub async fn install_bepinex() -> Result<()> {
    tracing::info!("Installing BepInEx...");
    
    // TODO: Download and install BepInEx
    
    Ok(())
}

#[tauri::command]
pub async fn launch_valheim(profile_id: Option<String>) -> Result<()> {
    tracing::info!("Launching Valheim with profile: {:?}", profile_id);
    
    // TODO: Launch Valheim
    // 1. Switch to profile if provided
    // 2. Launch game executable
    
    Ok(())
}

// ============================================================================
// src-tauri/src/commands/update_operations.rs
// ============================================================================
use crate::error::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub mod_id: String,
    pub current_version: String,
    pub latest_version: String,
    pub changelog: String,
}

#[tauri::command]
pub async fn check_updates() -> Result<Vec<UpdateInfo>> {
    tracing::info!("Checking for updates...");
    
    // TODO: Check for mod updates
    
    Ok(vec![])
}

#[tauri::command]
pub async fn update_mod(mod_id: String) -> Result<()> {
    tracing::info!("Updating mod: {}", mod_id);
    
    // TODO: Update specific mod
    
    Ok(())
}

// ============================================================================
// src-tauri/src/commands/backup_operations.rs
// ============================================================================
use crate::error::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupInfo {
    pub id: String,
    pub description: String,
    pub timestamp: String,
    pub size: u64,
}

#[tauri::command]
pub async fn create_backup(description: Option<String>) -> Result<()> {
    tracing::info!("Creating backup: {:?}", description);
    
    // TODO: Create backup
    
    Ok(())
}

#[tauri::command]
pub async fn restore_backup(backup_id: String) -> Result<()> {
    tracing::info!("Restoring backup: {}", backup_id);
    
    // TODO: Restore from backup
    
    Ok(())
}

#[tauri::command]
pub async fn list_backups() -> Result<Vec<BackupInfo>> {
    tracing::info!("Listing backups");
    
    // TODO: List all backups
    
    Ok(vec![])
}

// ============================================================================
// src-tauri/src/commands/mod.rs - Module declarations
// ============================================================================
pub mod mod_operations;
pub mod profile_operations;
pub mod system_operations;
pub mod update_operations;
pub mod backup_operations;

// ============================================================================
// src-tauri/src/services/mod.rs
// ============================================================================
pub mod mod_scanner;
pub mod mod_installer;
pub mod profile_manager;
pub mod config_manager;
pub mod update_checker;
pub mod backup_service;
pub mod download_manager;

// ============================================================================
// src-tauri/src/utils/mod.rs
// ============================================================================
pub mod file_ops;
pub mod validation;
pub mod hash;

// ============================================================================
// src-tauri/src/db/mod.rs
// ============================================================================
pub mod schema;
pub mod migrations;
pub mod queries;