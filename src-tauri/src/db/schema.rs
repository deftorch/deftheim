use rusqlite::{Connection, Result};

pub fn create_tables(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS mods (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            owner TEXT NOT NULL,
            full_name TEXT NOT NULL,
            package_url TEXT NOT NULL,
            date_created TEXT NOT NULL,
            date_updated TEXT NOT NULL,
            uuid4 TEXT NOT NULL,
            rating_score INTEGER NOT NULL,
            is_pinned BOOLEAN NOT NULL,
            is_deprecated BOOLEAN NOT NULL,
            has_nsfw_content BOOLEAN NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS mod_versions (
            full_name TEXT PRIMARY KEY,
            mod_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            version_number TEXT NOT NULL,
            download_url TEXT NOT NULL,
            downloads INTEGER NOT NULL,
            date_created TEXT NOT NULL,
            website_url TEXT NOT NULL,
            is_active BOOLEAN NOT NULL,
            uuid4 TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            FOREIGN KEY(mod_id) REFERENCES mods(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS mod_dependencies (
            version_full_name TEXT NOT NULL,
            dependency_id TEXT NOT NULL,
            PRIMARY KEY (version_full_name, dependency_id),
            FOREIGN KEY(version_full_name) REFERENCES mod_versions(full_name)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            active BOOLEAN NOT NULL DEFAULT 0,
            created TEXT NOT NULL,
            last_used TEXT NOT NULL,
            play_time INTEGER NOT NULL DEFAULT 0
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS profile_mods (
            profile_id TEXT NOT NULL,
            mod_id TEXT NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT 1,
            version TEXT NOT NULL,
            PRIMARY KEY (profile_id, mod_id),
            FOREIGN KEY(profile_id) REFERENCES profiles(id),
            FOREIGN KEY(mod_id) REFERENCES mods(id)
        )",
        [],
    )?;

    // Create indexes for performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mod_deps_parent ON mod_dependencies(version_full_name)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mod_deps_target ON mod_dependencies(dependency_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mod_versions_mod_id ON mod_versions(mod_id)",
        [],
    )?;

    Ok(())
}
