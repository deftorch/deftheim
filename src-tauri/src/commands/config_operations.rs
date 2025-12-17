use crate::error::Result;
use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn list_config_files(bepinex_path: String) -> Result<Vec<String>> {
    tracing::info!("Listing config files in: {}", bepinex_path);
    let config_path = Path::new(&bepinex_path).join("config");
    let mut files = Vec::new();

    if config_path.exists() {
        for entry in fs::read_dir(config_path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    if ext == "cfg" {
                        if let Some(name) = path.file_name() {
                            files.push(name.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }

    Ok(files)
}

#[tauri::command]
pub async fn read_config_file(bepinex_path: String, filename: String) -> Result<String> {
    tracing::info!("Reading config file: {}", filename);
    let path = Path::new(&bepinex_path).join("config").join(filename);
    let content = fs::read_to_string(path)?;
    Ok(content)
}

#[tauri::command]
pub async fn save_config_file(bepinex_path: String, filename: String, content: String) -> Result<()> {
    tracing::info!("Saving config file: {}", filename);
    let path = Path::new(&bepinex_path).join("config").join(filename);
    fs::write(path, content)?;
    Ok(())
}
