# 🎮 Deftheim

> Modern, performant, and user-friendly mod manager for Valheim built with **SolidJS**, **Tauri 2.9**, and **Rust**.

## ✨ Features

- **Profile Management** - Create unlimited mod configurations
- **Smart Mod Scanner** - Auto-detect and parse mods
- **One-Click Installation** - Install mods from Thunderstore
- **Safe & Secure** - Strict CSP and scoped filesystem access
- **Performant** - Virtualized lists for large mod collections

---

## 🏗️ Architecture

### Folder Structure
- **`src/`** - Frontend (SolidJS)
  - **`components/`** - Reusable UI components
  - **`pages/`** - Application routes
  - **`stores/`** - State management (Split into modular stores: `mod.store.ts`, `profile.store.ts`, etc.)
  - **`lib/`** - Utilities and API wrappers (`tauri.ts`)
- **`src-tauri/`** - Backend (Rust)
  - **`src/commands/`** - Tauri command handlers (Business logic)
  - **`src/models/`** - Shared data structures
  - **`src/services/`** - Core business logic services
  - **`src/utils/`** - Helper functions

### Key Design Decisions
- **Stores**: Global state is managed via SolidJS stores, split by domain to improve maintainability.
- **Security**: `tauri.conf.json` enforces strict security policies.
- **Logging**: Rust backend uses `tracing` and `tracing-appender` for rotating file logs.

---

## 🛠️ Development

### Prerequisites
- Node.js >= 20
- Rust >= 1.85
- System dependencies: `libwebkit2gtk-4.0-dev` (Linux only), `build-essential`

### Setup
```bash
git clone https://github.com/deftorch/deftheim.git
cd deftheim
npm install
```

### Running Tests
We use **Vitest** for frontend logic and **Cargo Test** for backend.

```bash
# Run Frontend Tests (Stores, Utils)
npm test

# Run Backend Tests (Rust logic)
cd src-tauri && cargo test
```

### Running the App
```bash
# Development Mode
npm run tauri:dev

# Build for Production
npm run tauri:build
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a branch (`feature/my-feature`).
3. Commit your changes.
4. Open a Pull Request.

Please ensure all tests pass before submitting.

---

## 📄 License
MIT License
