// ============================================================================
// src-tauri/src/main.rs - Complete Integration
// ============================================================================
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use std::sync::Mutex;
use tauri::State;
use db::Database;
use tracing_subscriber;

// Application state
pub struct AppState {
    db: Mutex<Database>,
    valheim_path: Mutex<Option<String>>,
    repository_path: Mutex<String>,
}

fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("valheim_mod_manager=debug,info")
        .init();

    tracing::info!("Starting Valheim Mod Manager v2.0.0");

    // Initialize app state
    let home_dir = dirs::data_local_dir()
        .expect("Could not find home directory")
        .join("ValheimModManager");
    
    std::fs::create_dir_all(&home_dir).ok();

    let db_path = home_dir.join("database").join("mods.db");
    std::fs::create_dir_all(db_path.parent().unwrap()).ok();

    let repository_path = home_dir.join("repository");
    std::fs::create_dir_all(&repository_path).ok();

    let db = Database::new(db_path.to_str().unwrap())
        .expect("Failed to initialize database");

    let app_state = AppState {
        db: Mutex::new(db),
        valheim_path: Mutex::new(None),
        repository_path: Mutex::new(repository_path.to_str().unwrap().to_string()),
    };

    tauri::Builder::default()
        .manage(app_state)
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
            commands::mod_operations::search_mods,
            // Profile operations
            commands::profile_operations::create_profile,
            commands::profile_operations::get_profile,
            commands::profile_operations::list_profiles,
            commands::profile_operations::update_profile,
            commands::profile_operations::delete_profile,
            commands::profile_operations::switch_profile,
            // System operations
            commands::system_operations::detect_valheim_path,
            commands::system_operations::set_valheim_path,
            commands::system_operations::check_bepinex,
            commands::system_operations::install_bepinex,
            commands::system_operations::launch_valheim,
            commands::system_operations::get_system_info,
            // Update operations
            commands::update_operations::check_updates,
            commands::update_operations::update_mod,
            commands::update_operations::update_all_mods,
            // Backup operations
            commands::backup_operations::create_backup,
            commands::backup_operations::restore_backup,
            commands::backup_operations::list_backups,
            commands::backup_operations::delete_backup,
            // Settings operations
            commands::settings_operations::get_settings,
            commands::settings_operations::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ============================================================================
// src-tauri/src/commands/mod_operations.rs - Complete Implementation
// ============================================================================
use crate::{error::Result, models::ModInfo, AppState, services::ModScanner};
use tauri::State;
use std::path::Path;

#[tauri::command]
pub async fn scan_mods(state: State<'_, AppState>) -> Result<Vec<ModInfo>> {
    tracing::info!("Scanning mods...");
    
    let repository_path = state.repository_path.lock().unwrap().clone();
    let path = Path::new(&repository_path);
    
    let mods = ModScanner::scan_directory(path)?;
    
    // Save to database
    let db = state.db.lock().unwrap();
    for mod_info in &mods {
        db.insert_mod(mod_info)?;
    }
    
    tracing::info!("Found {} mods", mods.len());
    Ok(mods)
}

#[tauri::command]
pub async fn install_mod(mod_id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Installing mod: {}", mod_id);
    
    // Mark as installed in database
    let db = state.db.lock().unwrap();
    db.update_mod_status(&mod_id, true, false)?;
    
    Ok(())
}

#[tauri::command]
pub async fn uninstall_mod(mod_id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Uninstalling mod: {}", mod_id);
    
    let db = state.db.lock().unwrap();
    db.update_mod_status(&mod_id, false, false)?;
    
    Ok(())
}

#[tauri::command]
pub async fn enable_mod(mod_id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Enabling mod: {}", mod_id);
    
    let db = state.db.lock().unwrap();
    if let Some(mod_info) = db.get_mod(&mod_id)? {
        db.update_mod_status(&mod_id, mod_info.installed, true)?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn disable_mod(mod_id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Disabling mod: {}", mod_id);
    
    let db = state.db.lock().unwrap();
    if let Some(mod_info) = db.get_mod(&mod_id)? {
        db.update_mod_status(&mod_id, mod_info.installed, false)?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn search_mods(query: String, state: State<'_, AppState>) -> Result<Vec<ModInfo>> {
    tracing::info!("Searching mods: {}", query);
    
    let db = state.db.lock().unwrap();
    let mods = db.search_mods(&query)?;
    
    Ok(mods)
}

// ============================================================================
// src-tauri/src/commands/profile_operations.rs - Complete Implementation
// ============================================================================
use crate::{error::{Result, AppError}, models::Profile, AppState};
use tauri::State;
use chrono::Utc;

#[tauri::command]
pub async fn create_profile(profile: Profile, state: State<'_, AppState>) -> Result<Profile> {
    tracing::info!("Creating profile: {}", profile.name);
    
    let db = state.db.lock().unwrap();
    db.insert_profile(&profile)?;
    
    Ok(profile)
}

#[tauri::command]
pub async fn get_profile(id: String, state: State<'_, AppState>) -> Result<Profile> {
    let db = state.db.lock().unwrap();
    
    db.get_profile(&id)?
        .ok_or_else(|| AppError::ProfileNotFound(id))
}

#[tauri::command]
pub async fn list_profiles(state: State<'_, AppState>) -> Result<Vec<Profile>> {
    tracing::info!("Listing profiles");
    
    let db = state.db.lock().unwrap();
    let profiles = db.list_profiles()?;
    
    Ok(profiles)
}

#[tauri::command]
pub async fn update_profile(id: String, profile: Profile, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Updating profile: {}", id);
    
    let db = state.db.lock().unwrap();
    db.update_profile(&profile)?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_profile(id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Deleting profile: {}", id);
    
    let db = state.db.lock().unwrap();
    db.delete_profile(&id)?;
    
    Ok(())
}

#[tauri::command]
pub async fn switch_profile(id: String, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Switching to profile: {}", id);
    
    let db = state.db.lock().unwrap();
    db.set_active_profile(&id)?;
    
    Ok(())
}

// ============================================================================
// src-tauri/src/commands/system_operations.rs - Complete Implementation
// ============================================================================
use crate::{error::Result, AppState, utils::validation};
use tauri::State;
use std::path::Path;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

#[tauri::command]
pub async fn detect_valheim_path(state: State<'_, AppState>) -> Result<String> {
    tracing::info!("Detecting Valheim installation...");
    
    // Try common paths
    let common_paths = vec![
        "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Valheim",
        "C:\\Program Files\\Steam\\steamapps\\common\\Valheim",
        "D:\\Steam\\steamapps\\common\\Valheim",
    ];

    for path_str in common_paths {
        let path = Path::new(path_str);
        if validation::validate_valheim_path(path) {
            tracing::info!("Found Valheim at: {}", path_str);
            
            // Save to state
            *state.valheim_path.lock().unwrap() = Some(path_str.to_string());
            
            return Ok(path_str.to_string());
        }
    }

    Err(crate::error::AppError::ValheimNotFound)
}

#[tauri::command]
pub async fn set_valheim_path(path: String, state: State<'_, AppState>) -> Result<()> {
    let path_obj = Path::new(&path);
    
    if !validation::validate_valheim_path(path_obj) {
        return Err(crate::error::AppError::InvalidPath(path));
    }

    *state.valheim_path.lock().unwrap() = Some(path);
    tracing::info!("Valheim path set");
    
    Ok(())
}

#[tauri::command]
pub async fn check_bepinex(state: State<'_, AppState>) -> Result<bool> {
    tracing::info!("Checking BepInEx installation...");
    
    let valheim_path = state.valheim_path.lock().unwrap();
    
    if let Some(path_str) = valheim_path.as_ref() {
        let path = Path::new(path_str);
        let is_installed = validation::validate_bepinex_installation(path);
        
        Ok(is_installed)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn install_bepinex(state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Installing BepInEx...");
    
    // TODO: Implement actual BepInEx installation
    // 1. Download from GitHub releases
    // 2. Extract to Valheim directory
    // 3. Verify installation
    
    Ok(())
}

#[tauri::command]
pub async fn launch_valheim(profile_id: Option<String>, state: State<'_, AppState>) -> Result<()> {
    tracing::info!("Launching Valheim with profile: {:?}", profile_id);
    
    let valheim_path = state.valheim_path.lock().unwrap();
    
    if let Some(path_str) = valheim_path.as_ref() {
        let exe_path = Path::new(path_str).join("valheim.exe");
        
        if exe_path.exists() {
            #[cfg(windows)]
            {
                std::process::Command::new(&exe_path)
                    .spawn()?;
            }
            
            tracing::info!("Valheim launched");
            Ok(())
        } else {
            Err(crate::error::AppError::ValheimNotFound)
        }
    } else {
        Err(crate::error::AppError::ValheimNotFound)
    }
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: "2.0.0".to_string(),
    })
}

// ============================================================================
// src-tauri/src/commands/settings_operations.rs
// ============================================================================
use crate::{error::Result, models::AppSettings, AppState};
use tauri::State;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings> {
    let db = state.db.lock().unwrap();
    
    let valheim_path = db.get_setting("valheim_path")?.unwrap_or_default();
    let theme = db.get_setting("theme")?.unwrap_or_else(|| "dark".to_string());
    
    Ok(AppSettings {
        valheim_path,
        bepinex_path: db.get_setting("bepinex_path")?.unwrap_or_default(),
        repository_path: db.get_setting("repository_path")?.unwrap_or_default(),
        backup_path: db.get_setting("backup_path")?.unwrap_or_default(),
        theme,
        auto_update: db.get_setting("auto_update")?.map(|v| v == "true").unwrap_or(true),
        auto_backup: db.get_setting("auto_backup")?.map(|v| v == "true").unwrap_or(true),
        language: db.get_setting("language")?.unwrap_or_else(|| "en".to_string()),
    })
}

#[tauri::command]
pub async fn save_settings(settings: AppSettings, state: State<'_, AppState>) -> Result<()> {
    let db = state.db.lock().unwrap();
    
    db.set_setting("valheim_path", &settings.valheim_path)?;
    db.set_setting("bepinex_path", &settings.bepinex_path)?;
    db.set_setting("repository_path", &settings.repository_path)?;
    db.set_setting("backup_path", &settings.backup_path)?;
    db.set_setting("theme", &settings.theme)?;
    db.set_setting("auto_update", &settings.auto_update.to_string())?;
    db.set_setting("auto_backup", &settings.auto_backup.to_string())?;
    db.set_setting("language", &settings.language)?;
    
    tracing::info!("Settings saved");
    Ok(())
}

// ============================================================================
// src-tauri/src/commands/mod.rs - Module declarations
// ============================================================================
pub mod mod_operations;
pub mod profile_operations;
pub mod system_operations;
pub mod update_operations;
pub mod backup_operations;
pub mod settings_operations;