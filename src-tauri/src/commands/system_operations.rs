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