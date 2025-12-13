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