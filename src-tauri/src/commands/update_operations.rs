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