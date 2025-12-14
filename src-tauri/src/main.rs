#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    // Setup file logging
    // In a real app we'd get the app data dir from tauri config context, but here we can't easily access it before building
    // So we'll try to use a standard location or local folder for simplicity in this audit fix
    let file_appender = tracing_appender::rolling::daily("logs", "deftheim.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    // Initialize logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer()
                .with_writer(non_blocking)
                .with_ansi(false)
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_writer(std::io::stdout)
        )
        .with(
             tracing_subscriber::EnvFilter::new("deftheim=debug,info")
        )
        .init();

    tracing::info!("Starting Deftheim v2.0.0");

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
