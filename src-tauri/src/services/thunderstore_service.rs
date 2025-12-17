use crate::error::Result;
use crate::services::thunderstore::{self, PackageListing};
use crate::models::ModInfo;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};

pub struct ThunderstoreService {
    db_conn: Arc<Mutex<Connection>>,
}

impl ThunderstoreService {
    pub fn new(db_conn: Arc<Mutex<Connection>>) -> Self {
        Self { db_conn }
    }

    pub async fn fetch_and_cache_mods(&self) -> Result<Vec<ModInfo>> {
        let packages = thunderstore::fetch_packages().await?;
        self.cache_packages(&packages)?;

        // Convert to ModInfo for frontend
        let mod_infos = packages.into_iter().map(|p| {
            let latest = p.versions.first().cloned().unwrap_or_else(|| {
                // This should not happen for valid packages
                crate::services::thunderstore::PackageVersion {
                    name: p.name.clone(),
                    full_name: p.full_name.clone(),
                    description: "".to_string(),
                    icon: "".to_string(),
                    version_number: "0.0.0".to_string(),
                    dependencies: vec![],
                    download_url: "".to_string(),
                    downloads: 0,
                    date_created: p.date_created.clone(),
                    website_url: "".to_string(),
                    is_active: false,
                    uuid4: "".to_string(),
                    file_size: 0,
                }
            });

            ModInfo {
                id: p.full_name,
                name: p.name,
                version: latest.version_number,
                author: p.owner,
                description: latest.description,
                icon: Some(latest.icon),
                size: latest.file_size,
                installed: false, // Check logic needed
                enabled: false,
                dependencies: latest.dependencies,
                categories: p.categories,
                download_url: Some(latest.download_url),
                website_url: Some(latest.website_url),
                rating: Some(p.rating_score as f32),
                downloads: Some(latest.downloads),
                last_updated: p.date_updated,
            }
        }).collect();

        Ok(mod_infos)
    }

    fn cache_packages(&self, packages: &[PackageListing]) -> Result<()> {
        let conn = self.db_conn.lock().map_err(|_| crate::error::AppError::Custom("DB lock poisoned".to_string()))?;

        // Start transaction
        conn.execute("BEGIN TRANSACTION", [])?;

        for pkg in packages {
            conn.execute(
                "INSERT OR REPLACE INTO mods (id, name, owner, full_name, package_url, date_created, date_updated, uuid4, rating_score, is_pinned, is_deprecated, has_nsfw_content)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                (
                    &pkg.full_name, // Using full_name as ID for consistency
                    &pkg.name,
                    &pkg.owner,
                    &pkg.full_name,
                    &pkg.package_url,
                    &pkg.date_created,
                    &pkg.date_updated,
                    &pkg.uuid4,
                    pkg.rating_score,
                    pkg.is_pinned,
                    pkg.is_deprecated,
                    pkg.has_nsfw_content
                ),
            )?;

            for ver in &pkg.versions {
                conn.execute(
                    "INSERT OR REPLACE INTO mod_versions (full_name, mod_id, name, description, icon, version_number, download_url, downloads, date_created, website_url, is_active, uuid4, file_size)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                    (
                        &ver.full_name,
                        &pkg.full_name,
                        &ver.name,
                        &ver.description,
                        &ver.icon,
                        &ver.version_number,
                        &ver.download_url,
                        ver.downloads,
                        &ver.date_created,
                        &ver.website_url,
                        ver.is_active,
                        &ver.uuid4,
                        ver.file_size
                    ),
                )?;

                for dep in &ver.dependencies {
                    conn.execute(
                        "INSERT OR IGNORE INTO mod_dependencies (version_full_name, dependency_id) VALUES (?1, ?2)",
                        (&ver.full_name, dep),
                    )?;
                }
            }
        }

        conn.execute("COMMIT", [])?;
        Ok(())
    }
}
