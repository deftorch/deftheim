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