#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod state;
mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use tracing_subscriber;
use std::sync::{Arc, Mutex};
use rusqlite::Connection;
use tauri::Manager;
use crate::state::AppState;

fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("deftheim=debug,info")
        .init();

    tracing::info!("Starting Deftheim v2.0.0");

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let app_dir = app_handle.path().app_data_dir().expect("Failed to resolve app data");

            if !app_dir.exists() {
                std::fs::create_dir_all(&app_dir)?;
            }

            let db_path = app_dir.join("deftheim.db");
            tracing::info!("Database path: {:?}", db_path);

            let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

            // Create tables
            db::schema::create_tables(&conn).map_err(|e| e.to_string())?;

            app.manage(AppState {
                db: Arc::new(Mutex::new(conn)),
            });

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Mod operations
            commands::mod_operations::get_thunderstore_mods,
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
            commands::profile_operations::export_profile_to_code,
            commands::profile_operations::import_profile_from_code,
            // System operations
            commands::system_operations::detect_valheim_path,
            commands::system_operations::check_bepinex,
            commands::system_operations::install_bepinex,
            commands::system_operations::launch_valheim,
            // Update operations
            commands::update_operations::check_updates,
            commands::update_operations::update_mod,
            commands::update_operations::update_all_mods,
            // Backup operations
            commands::backup_operations::create_backup,
            commands::backup_operations::restore_backup,
            commands::backup_operations::list_backups,
            // Settings operations
            commands::settings_operations::save_settings,
            commands::settings_operations::load_settings,
            // Config operations
            commands::config_operations::list_config_files,
            commands::config_operations::read_config_file,
            commands::config_operations::save_config_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
