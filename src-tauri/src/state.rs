use std::sync::{Arc, Mutex};
use rusqlite::Connection;

pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}
