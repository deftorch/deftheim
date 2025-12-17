use crate::error::{AppError, Result};
use crate::commands::settings_operations;
use std::path::{Path, PathBuf};
use std::fs;
use tauri::AppHandle;

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

const VALHEIM_APP_ID: u32 = 892970;

fn get_steam_path() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        // Try 64-bit Steam
        if let Ok(key) = hklm.open_subkey("SOFTWARE\\Wow6432Node\\Valve\\Steam") {
            if let Ok(path) = key.get_value::<String, _>("InstallPath") {
                return Some(PathBuf::from(path));
            }
        }
        // Try 32-bit Steam
        if let Ok(key) = hklm.open_subkey("SOFTWARE\\Valve\\Steam") {
            if let Ok(path) = key.get_value::<String, _>("InstallPath") {
                return Some(PathBuf::from(path));
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let paths = vec![
                home.join(".steam/steam"),
                home.join(".local/share/Steam"),
            ];
            for path in paths {
                if path.exists() {
                    return Some(path);
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            let path = home.join("Library/Application Support/Steam");
            if path.exists() {
                return Some(path);
            }
        }
    }

    None
}

fn parse_library_folders(steam_path: &Path) -> Vec<PathBuf> {
    let mut folders = vec![steam_path.to_path_buf()];
    let vdf_path = steam_path.join("steamapps").join("libraryfolders.vdf");

    if let Ok(content) = fs::read_to_string(&vdf_path) {
        // Basic VDF parsing to find library paths
        // Looks for "path" "/path/to/library" pattern
        if let Ok(re) = regex::Regex::new(r#""path"\s+"([^"]+)""#) {
            for cap in re.captures_iter(&content) {
                if let Some(path_str) = cap.get(1) {
                    let path = PathBuf::from(path_str.as_str());
                    if path.exists() {
                        folders.push(path);
                    }
                }
            }
        }
    }
    folders
}

#[tauri::command]
pub async fn detect_valheim_path(app: AppHandle) -> Result<String> {
    tracing::info!("Detecting Valheim installation...");

    // 1. Check settings first (Manual override)
    if let Ok(settings) = settings_operations::load_settings(app.clone()).await {
        if !settings.valheim_path.is_empty() {
            let path = PathBuf::from(&settings.valheim_path);
            if path.exists() {
                tracing::info!("Found Valheim at configured path: {:?}", path);
                return Ok(settings.valheim_path);
            }
        }
    }

    // 2. Auto-detect via Steam
    if let Some(steam_path) = get_steam_path() {
        let libraries = parse_library_folders(&steam_path);

        for library in libraries {
            let valheim_path = library.join("steamapps").join("common").join("Valheim");
            // On Windows it's valheim.exe, on Linux valheim.x86_64 usually, but checking directory is usually enough
            if valheim_path.exists() {
                tracing::info!("Found Valheim via Steam at: {:?}", valheim_path);
                // Optionally save this detected path to settings?
                // For now, just return it.
                return Ok(valheim_path.to_string_lossy().to_string());
            }
        }
    }

    // 3. Fallback checks
    #[cfg(target_os = "windows")]
    let common_paths = vec![
        r"C:\Program Files (x86)\Steam\steamapps\common\Valheim",
        r"C:\Program Files\Steam\steamapps\common\Valheim",
    ];

    #[cfg(target_os = "linux")]
    let common_paths = {
        if let Some(home) = dirs::home_dir() {
            vec![
                home.join(".steam/steam/steamapps/common/Valheim"),
                home.join(".local/share/Steam/steamapps/common/Valheim"),
            ]
        } else {
            vec![]
        }
    };

    #[cfg(target_os = "macos")]
    let common_paths = {
        if let Some(home) = dirs::home_dir() {
            vec![
                home.join("Library/Application Support/Steam/steamapps/common/Valheim")
            ]
        } else {
            vec![]
        }
    };

    for path in common_paths {
        let p = PathBuf::from(path);
        if p.exists() {
             tracing::info!("Found Valheim at fallback: {:?}", p);
             return Ok(p.to_string_lossy().to_string());
        }
    }

    Err(AppError::ValheimNotFound)
}

#[tauri::command]
pub async fn check_bepinex(app: AppHandle) -> Result<bool> {
    tracing::info!("Checking BepInEx installation...");

    // We now pass the app handle to detect_valheim_path so it respects settings
    match detect_valheim_path(app).await {
        Ok(path_str) => {
            let path = PathBuf::from(path_str);
            let bepinex_path = path.join("BepInEx");
            // Check for core/BepInEx.dll or similar structure
            Ok(bepinex_path.exists() && bepinex_path.join("core").exists())
        },
        Err(_) => Ok(false)
    }
}

#[tauri::command]
pub async fn install_bepinex() -> Result<()> {
    tracing::info!("Installing BepInEx...");

    // TODO: Download and install BepInEx

    Ok(())
}

#[tauri::command]
pub async fn launch_valheim(app: AppHandle, profile_id: Option<String>) -> Result<()> {
    tracing::info!("Launching Valheim with profile: {:?}", profile_id);

    // 1. Detect path (respecting manual setting)
    let valheim_path_str = detect_valheim_path(app.clone()).await?;
    let valheim_path = PathBuf::from(valheim_path_str);

    // Construct executable path
    #[cfg(target_os = "windows")]
    let exe_name = "valheim.exe";
    #[cfg(target_os = "linux")]
    let exe_name = "valheim.x86_64";
    #[cfg(target_os = "macos")]
    let exe_name = "valheim.app";

    let exe_path = valheim_path.join(exe_name);

    if !exe_path.exists() {
        return Err(AppError::ValheimNotFound);
    }

    // 2. If profile is selected, activate it (using switch_profile logic)
    // We can't easily call `switch_profile` directly if it's an async command requiring state that we might not have easy access to here without `State`.
    // However, `switch_profile` logic should be accessible.
    // For now, let's assume the user has already switched profile in the UI, or we enforce it here if we refactor `switch_profile` to be a service method.
    // Given the constraints, let's setup the environment variables manually here if needed.

    // START_UP_ENV setup for Doorstop/BepInEx
    // If BepInEx is installed, we might need to set specific env vars to point to the profile's BepInEx config/plugins?
    // Standard BepInEx usually loads from the game folder.
    // If we are using symlinks (enable_mod), the "active" profile's mods are already in the game folder.
    // So simply launching the game is sufficient IF `enable_mod` was called for all mods in the active profile.
    // The `switch_profile` command (in profile_operations) is responsible for clearing the game folder and symlinking the new profile's mods.
    // So we assume the UI calls `switch_profile` -> `launch_valheim`.

    // Ideally, we launch via Steam to ensure overlay works, but direct launch is requested/supported.
    // On Linux/macOS, we might need to set LD_LIBRARY_PATH or similar if not launching via Steam.

    // Launch
    tracing::info!("Executing: {:?}", exe_path);
    open::that(exe_path).map_err(AppError::Io)?;

    Ok(())
}
