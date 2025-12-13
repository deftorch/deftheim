// ============================================================================
// src-tauri/src/db/schema.rs
// ============================================================================
use rusqlite::{Connection, Result};

pub fn initialize_database(conn: &Connection) -> Result<()> {
    // Create tables
    create_mods_table(conn)?;
    create_profiles_table(conn)?;
    create_profile_mods_table(conn)?;
    create_settings_table(conn)?;
    create_downloads_table(conn)?;
    
    Ok(())
}

fn create_mods_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS mods (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            size INTEGER NOT NULL,
            installed INTEGER NOT NULL DEFAULT 0,
            enabled INTEGER NOT NULL DEFAULT 0,
            dependencies TEXT,
            categories TEXT,
            download_url TEXT,
            website_url TEXT,
            rating REAL,
            downloads INTEGER,
            last_updated TEXT NOT NULL,
            installed_at TEXT,
            updated_at TEXT
        )",
        [],
    )?;

    // Create indexes
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mods_name ON mods(name)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mods_author ON mods(author)",
        [],
    )?;

    Ok(())
}

fn create_profiles_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 0,
            created TEXT NOT NULL,
            last_used TEXT NOT NULL,
            play_time INTEGER NOT NULL DEFAULT 0
        )",
        [],
    )?;

    Ok(())
}

fn create_profile_mods_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS profile_mods (
            profile_id TEXT NOT NULL,
            mod_id TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            load_order INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (profile_id, mod_id),
            FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
            FOREIGN KEY (mod_id) REFERENCES mods(id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(())
}

fn create_settings_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    Ok(())
}

fn create_downloads_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS downloads (
            id TEXT PRIMARY KEY,
            mod_id TEXT NOT NULL,
            url TEXT NOT NULL,
            status TEXT NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            total_size INTEGER,
            downloaded_size INTEGER NOT NULL DEFAULT 0,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            error TEXT
        )",
        [],
    )?;

    Ok(())
}

// ============================================================================
// src-tauri/src/db/queries.rs
// ============================================================================
use crate::{error::Result, models::{ModInfo, Profile}};
use rusqlite::{Connection, params};
use chrono::Utc;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        super::schema::initialize_database(&conn)?;
        
        Ok(Self { conn })
    }

    // ========================================================================
    // MOD OPERATIONS
    // ========================================================================

    pub fn insert_mod(&self, mod_info: &ModInfo) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO mods 
            (id, name, version, author, description, icon, size, installed, enabled,
             dependencies, categories, download_url, website_url, rating, downloads,
             last_updated, installed_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)",
            params![
                mod_info.id,
                mod_info.name,
                mod_info.version,
                mod_info.author,
                mod_info.description,
                mod_info.icon,
                mod_info.size as i64,
                mod_info.installed as i32,
                mod_info.enabled as i32,
                serde_json::to_string(&mod_info.dependencies).ok(),
                serde_json::to_string(&mod_info.categories).ok(),
                mod_info.download_url,
                mod_info.website_url,
                mod_info.rating,
                mod_info.downloads.map(|d| d as i64),
                mod_info.last_updated,
                if mod_info.installed { Some(Utc::now().to_rfc3339()) } else { None },
                Utc::now().to_rfc3339(),
            ],
        )?;

        Ok(())
    }

    pub fn get_mod(&self, id: &str) -> Result<Option<ModInfo>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, version, author, description, icon, size, installed, enabled,
                    dependencies, categories, download_url, website_url, rating, downloads,
                    last_updated
             FROM mods WHERE id = ?1"
        )?;

        let mod_info = stmt.query_row(params![id], |row| {
            Ok(ModInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                version: row.get(2)?,
                author: row.get(3)?,
                description: row.get(4)?,
                icon: row.get(5)?,
                size: row.get::<_, i64>(6)? as u64,
                installed: row.get::<_, i32>(7)? != 0,
                enabled: row.get::<_, i32>(8)? != 0,
                dependencies: serde_json::from_str(&row.get::<_, String>(9)?).unwrap_or_default(),
                categories: serde_json::from_str(&row.get::<_, String>(10)?).unwrap_or_default(),
                download_url: row.get(11)?,
                website_url: row.get(12)?,
                rating: row.get(13)?,
                downloads: row.get::<_, Option<i64>>(14)?.map(|d| d as u64),
                last_updated: row.get(15)?,
            })
        }).optional()?;

        Ok(mod_info)
    }

    pub fn list_mods(&self, installed_only: bool) -> Result<Vec<ModInfo>> {
        let query = if installed_only {
            "SELECT id, name, version, author, description, icon, size, installed, enabled,
                    dependencies, categories, download_url, website_url, rating, downloads,
                    last_updated
             FROM mods WHERE installed = 1 ORDER BY name"
        } else {
            "SELECT id, name, version, author, description, icon, size, installed, enabled,
                    dependencies, categories, download_url, website_url, rating, downloads,
                    last_updated
             FROM mods ORDER BY name"
        };

        let mut stmt = self.conn.prepare(query)?;
        let mods_iter = stmt.query_map([], |row| {
            Ok(ModInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                version: row.get(2)?,
                author: row.get(3)?,
                description: row.get(4)?,
                icon: row.get(5)?,
                size: row.get::<_, i64>(6)? as u64,
                installed: row.get::<_, i32>(7)? != 0,
                enabled: row.get::<_, i32>(8)? != 0,
                dependencies: serde_json::from_str(&row.get::<_, String>(9)?).unwrap_or_default(),
                categories: serde_json::from_str(&row.get::<_, String>(10)?).unwrap_or_default(),
                download_url: row.get(11)?,
                website_url: row.get(12)?,
                rating: row.get(13)?,
                downloads: row.get::<_, Option<i64>>(14)?.map(|d| d as u64),
                last_updated: row.get(15)?,
            })
        })?;

        let mods: Vec<ModInfo> = mods_iter.filter_map(|m| m.ok()).collect();
        Ok(mods)
    }

    pub fn update_mod_status(&self, id: &str, installed: bool, enabled: bool) -> Result<()> {
        self.conn.execute(
            "UPDATE mods SET installed = ?1, enabled = ?2, updated_at = ?3 WHERE id = ?4",
            params![installed as i32, enabled as i32, Utc::now().to_rfc3339(), id],
        )?;

        Ok(())
    }

    pub fn delete_mod(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM mods WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn search_mods(&self, query: &str) -> Result<Vec<ModInfo>> {
        let search_pattern = format!("%{}%", query);
        
        let mut stmt = self.conn.prepare(
            "SELECT id, name, version, author, description, icon, size, installed, enabled,
                    dependencies, categories, download_url, website_url, rating, downloads,
                    last_updated
             FROM mods 
             WHERE name LIKE ?1 OR description LIKE ?1 OR author LIKE ?1
             ORDER BY rating DESC, downloads DESC"
        )?;

        let mods_iter = stmt.query_map(params![search_pattern], |row| {
            Ok(ModInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                version: row.get(2)?,
                author: row.get(3)?,
                description: row.get(4)?,
                icon: row.get(5)?,
                size: row.get::<_, i64>(6)? as u64,
                installed: row.get::<_, i32>(7)? != 0,
                enabled: row.get::<_, i32>(8)? != 0,
                dependencies: serde_json::from_str(&row.get::<_, String>(9)?).unwrap_or_default(),
                categories: serde_json::from_str(&row.get::<_, String>(10)?).unwrap_or_default(),
                download_url: row.get(11)?,
                website_url: row.get(12)?,
                rating: row.get(13)?,
                downloads: row.get::<_, Option<i64>>(14)?.map(|d| d as u64),
                last_updated: row.get(15)?,
            })
        })?;

        let mods: Vec<ModInfo> = mods_iter.filter_map(|m| m.ok()).collect();
        Ok(mods)
    }

    // ========================================================================
    // PROFILE OPERATIONS
    // ========================================================================

    pub fn insert_profile(&self, profile: &Profile) -> Result<()> {
        self.conn.execute(
            "INSERT INTO profiles (id, name, description, icon, color, active, created, last_used, play_time)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                profile.id,
                profile.name,
                profile.description,
                profile.icon,
                profile.color,
                profile.active as i32,
                profile.created,
                profile.last_used,
                profile.play_time as i64,
            ],
        )?;

        // Insert profile mods
        for (index, mod_id) in profile.mods.iter().enumerate() {
            self.conn.execute(
                "INSERT INTO profile_mods (profile_id, mod_id, enabled, load_order)
                 VALUES (?1, ?2, 1, ?3)",
                params![profile.id, mod_id, index as i32],
            )?;
        }

        Ok(())
    }

    pub fn get_profile(&self, id: &str) -> Result<Option<Profile>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, icon, color, active, created, last_used, play_time
             FROM profiles WHERE id = ?1"
        )?;

        let profile = stmt.query_row(params![id], |row| {
            let profile_id: String = row.get(0)?;
            
            Ok(Profile {
                id: profile_id,
                name: row.get(1)?,
                description: row.get(2)?,
                icon: row.get(3)?,
                color: row.get(4)?,
                active: row.get::<_, i32>(5)? != 0,
                mods: Vec::new(), // Will be filled below
                created: row.get(6)?,
                last_used: row.get(7)?,
                play_time: row.get::<_, i64>(8)? as u64,
            })
        }).optional()?;

        if let Some(mut profile) = profile {
            // Get profile mods
            let mut stmt = self.conn.prepare(
                "SELECT mod_id FROM profile_mods WHERE profile_id = ?1 ORDER BY load_order"
            )?;
            
            let mods: Vec<String> = stmt.query_map(params![profile.id], |row| row.get(0))?
                .filter_map(|r| r.ok())
                .collect();
            
            profile.mods = mods;
            
            return Ok(Some(profile));
        }

        Ok(None)
    }

    pub fn list_profiles(&self) -> Result<Vec<Profile>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, icon, color, active, created, last_used, play_time
             FROM profiles ORDER BY last_used DESC"
        )?;

        let profiles_iter = stmt.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                Profile {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    icon: row.get(3)?,
                    color: row.get(4)?,
                    active: row.get::<_, i32>(5)? != 0,
                    mods: Vec::new(),
                    created: row.get(6)?,
                    last_used: row.get(7)?,
                    play_time: row.get::<_, i64>(8)? as u64,
                }
            ))
        })?;

        let mut profiles = Vec::new();
        
        for result in profiles_iter {
            if let Ok((profile_id, mut profile)) = result {
                // Get mods for this profile
                let mut stmt = self.conn.prepare(
                    "SELECT mod_id FROM profile_mods WHERE profile_id = ?1 ORDER BY load_order"
                )?;
                
                let mods: Vec<String> = stmt.query_map(params![profile_id], |row| row.get(0))?
                    .filter_map(|r| r.ok())
                    .collect();
                
                profile.mods = mods;
                profiles.push(profile);
            }
        }

        Ok(profiles)
    }

    pub fn update_profile(&self, profile: &Profile) -> Result<()> {
        self.conn.execute(
            "UPDATE profiles 
             SET name = ?1, description = ?2, icon = ?3, color = ?4, 
                 active = ?5, last_used = ?6, play_time = ?7
             WHERE id = ?8",
            params![
                profile.name,
                profile.description,
                profile.icon,
                profile.color,
                profile.active as i32,
                profile.last_used,
                profile.play_time as i64,
                profile.id,
            ],
        )?;

        // Update mods
        self.conn.execute(
            "DELETE FROM profile_mods WHERE profile_id = ?1",
            params![profile.id],
        )?;

        for (index, mod_id) in profile.mods.iter().enumerate() {
            self.conn.execute(
                "INSERT INTO profile_mods (profile_id, mod_id, enabled, load_order)
                 VALUES (?1, ?2, 1, ?3)",
                params![profile.id, mod_id, index as i32],
            )?;
        }

        Ok(())
    }

    pub fn delete_profile(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM profiles WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn set_active_profile(&self, id: &str) -> Result<()> {
        // Deactivate all profiles
        self.conn.execute("UPDATE profiles SET active = 0", [])?;
        
        // Activate selected profile
        self.conn.execute(
            "UPDATE profiles SET active = 1, last_used = ?1 WHERE id = ?2",
            params![Utc::now().to_rfc3339(), id],
        )?;

        Ok(())
    }

    // ========================================================================
    // SETTINGS OPERATIONS
    // ========================================================================

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let value = stmt.query_row(params![key], |row| row.get(0)).optional()?;
        Ok(value)
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            params![key, value, Utc::now().to_rfc3339()],
        )?;
        Ok(())
    }
}

// ============================================================================
// src-tauri/src/db/mod.rs
// ============================================================================
pub mod schema;
pub mod queries;

pub use queries::Database;