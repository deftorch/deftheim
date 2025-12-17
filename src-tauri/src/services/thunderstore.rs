use serde::{Deserialize, Serialize};
use crate::error::Result;
use reqwest::Client;
use std::time::Duration;

const API_BASE_URL: &str = "https://thunderstore.io/c/valheim/api/v1";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageVersion {
    pub name: String,
    pub full_name: String,
    pub description: String,
    pub icon: String,
    pub version_number: String,
    pub dependencies: Vec<String>,
    pub download_url: String,
    pub downloads: u64,
    pub date_created: String,
    pub website_url: String,
    pub is_active: bool,
    pub uuid4: String,
    pub file_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageListing {
    pub name: String,
    pub full_name: String,
    pub owner: String,
    pub package_url: String,
    pub donation_link: Option<String>,
    pub date_created: String,
    pub date_updated: String,
    pub uuid4: String,
    pub rating_score: u32,
    pub is_pinned: bool,
    pub is_deprecated: bool,
    pub has_nsfw_content: bool,
    pub categories: Vec<String>,
    pub versions: Vec<PackageVersion>,
}

pub async fn fetch_packages() -> Result<Vec<PackageListing>> {
    tracing::info!("Fetching packages from Thunderstore API...");
    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let url = format!("{}/package/", API_BASE_URL);
    let response = client.get(&url).send().await?;
    let packages: Vec<PackageListing> = response.json().await?;

    tracing::info!("Fetched {} packages", packages.len());
    Ok(packages)
}
