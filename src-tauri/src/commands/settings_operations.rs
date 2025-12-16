use crate::models::AppSettings;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

// Helper to get settings file path
fn get_settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("settings.json"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    tracing::info!("Saving settings...");

    let path = get_settings_path(&app)?;

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;

    tracing::info!("Settings saved successfully");
    Ok(())
}

#[tauri::command]
pub async fn load_settings(app: AppHandle) -> Result<AppSettings, String> {
    tracing::info!("Loading settings...");

    let path = get_settings_path(&app)?;

    if !path.exists() {
        tracing::info!("Settings file not found, returning defaults");
        // Return default settings
        return Ok(AppSettings {
            valheim_path: "".to_string(),
            bepinex_path: "".to_string(),
            repository_path: "".to_string(),
            backup_path: "".to_string(),
            theme: "dark".to_string(),
            auto_update: true,
            auto_backup: true,
            language: "en".to_string(),
        });
    }

    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let settings: AppSettings = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    Ok(settings)
}
