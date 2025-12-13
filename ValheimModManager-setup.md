# Valheim Mod Manager - Complete Project Specification
## Version 2.0 - Updated December 2024

---

## 📋 PROJECT OVERVIEW

**Project Name:** Valheim Mod Manager  
**Version:** 2.0.0  
**License:** MIT  
**Target Platforms:** Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)

---

## 🛠️ TECH STACK (UPDATED)

### Frontend Stack
```json
{
  "framework": "solid-js@1.9.10",
  "language": "typescript@5.7.2",
  "styling": "tailwindcss@4.1.7",
  "ui_components": "@kobalte/core@0.13.7",
  "animations": "motion@11.15.0",
  "icons": "lucide-solid@0.469.0",
  "router": "@solidjs/router@0.15.2",
  "build_tool": "vite@6.0.7"
}
```

### Backend Stack
```toml
[dependencies]
tauri = "2.9"
tokio = { version = "1.42", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.32", features = ["bundled"] }
reqwest = { version = "0.12", features = ["json", "stream"] }
anyhow = "1.0"
thiserror = "2.0"
tracing = "0.1"
tracing-subscriber = "0.3"
sha2 = "0.10"
zip = "2.2"
walkdir = "2.5"
chrono = { version = "0.4", features = ["serde"] }
```

### Rust Edition
```toml
[package]
rust-version = "1.85"
edition = "2024"
```

### Development Tools
```json
{
  "typescript": "5.7.2",
  "eslint": "9.16.0",
  "@typescript-eslint/eslint-plugin": "8.18.2",
  "@typescript-eslint/parser": "8.18.2",
  "prettier": "3.4.2",
  "vitest": "3.0.5",
  "@vitest/ui": "3.0.5",
  "playwright": "1.49.1",
  "@tailwindcss/vite": "4.1.7",
  "postcss": "8.4.49",
  "autoprefixer": "10.4.20"
}
```

---

## 📁 PROJECT STRUCTURE

```
valheim-mod-manager/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── test.yml
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── CHANGELOG.md
│
├── src/                              # Frontend (SolidJS)
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileGrid.tsx
│   │   │   ├── ProfileDetail.tsx
│   │   │   ├── ProfileCreator.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── mod/
│   │   │   ├── ModCard.tsx
│   │   │   ├── ModList.tsx
│   │   │   ├── ModDetail.tsx
│   │   │   ├── ModInstaller.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── PathDetection.tsx
│   │   │   ├── BepInExSetup.tsx
│   │   │   ├── TemplateSelection.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── settings/
│   │       ├── GeneralSettings.tsx
│   │       ├── PathSettings.tsx
│   │       ├── UpdateSettings.tsx
│   │       └── index.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Profiles.tsx
│   │   ├── Repository.tsx
│   │   ├── Settings.tsx
│   │   ├── Updates.tsx
│   │   ├── Backup.tsx
│   │   └── Diagnostics.tsx
│   │
│   ├── stores/
│   │   ├── modStore.ts
│   │   ├── profileStore.ts
│   │   ├── settingsStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── tauri.ts
│   │   │   ├── thunderstore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── format.ts
│   │   │   ├── date.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useModOperations.ts
│   │   │   ├── useProfileOperations.ts
│   │   │   └── index.ts
│   │   │
│   │   └── types/
│   │       ├── mod.ts
│   │       ├── profile.ts
│   │       ├── settings.ts
│   │       └── index.ts
│   │
│   ├── styles/
│   │   ├── app.css              # Tailwind v4 imports
│   │   ├── tokens.css           # Design tokens
│   │   ├── components.css       # Component styles
│   │   └── utilities.css        # Custom utilities
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── src-tauri/                        # Backend (Rust)
│   ├── src/
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── mod_operations.rs
│   │   │   ├── profile_operations.rs
│   │   │   ├── system_operations.rs
│   │   │   ├── download_operations.rs
│   │   │   └── backup_operations.rs
│   │   │
│   │   ├── services/
│   │   │   ├── mod.rs
│   │   │   ├── mod_scanner.rs
│   │   │   ├── mod_installer.rs
│   │   │   ├── profile_manager.rs
│   │   │   ├── config_manager.rs
│   │   │   ├── update_checker.rs
│   │   │   ├── backup_service.rs
│   │   │   └── download_manager.rs
│   │   │
│   │   ├── models/
│   │   │   ├── mod.rs
│   │   │   ├── mod_info.rs
│   │   │   ├── profile.rs
│   │   │   ├── settings.rs
│   │   │   └── database.rs
│   │   │
│   │   ├── utils/
│   │   │   ├── mod.rs
│   │   │   ├── file_ops.rs
│   │   │   ├── validation.rs
│   │   │   └── hash.rs
│   │   │
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs
│   │   │   ├── migrations.rs
│   │   │   └── queries.rs
│   │   │
│   │   ├── error.rs
│   │   ├── main.rs
│   │   └── lib.rs
│   │
│   ├── icons/
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── icon.icns
│   │   └── icon.ico
│   │
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── tauri.conf.json
│   └── build.rs
│
├── tests/
│   ├── unit/
│   │   ├── mod_scanner.test.ts
│   │   ├── profile_manager.test.ts
│   │   └── ...
│   │
│   ├── integration/
│   │   ├── mod_operations.test.ts
│   │   ├── profile_switching.test.ts
│   │   └── ...
│   │
│   └── e2e/
│       ├── onboarding.spec.ts
│       ├── mod_installation.spec.ts
│       └── ...
│
├── scripts/
│   ├── setup.sh
│   ├── build.sh
│   ├── test.sh
│   └── release.sh
│
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
├── README.md
└── LICENSE
```

---

## 📦 PACKAGE.JSON

```json
{
  "name": "valheim-mod-manager",
  "version": "2.0.0",
  "description": "Modern, performant mod manager for Valheim",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "prepare": "husky install"
  },
  "dependencies": {
    "@kobalte/core": "^0.13.7",
    "@solidjs/router": "^0.15.2",
    "@tauri-apps/api": "^2.9.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tauri-apps/plugin-http": "^2.0.0",
    "@tauri-apps/plugin-notification": "^2.0.0",
    "@tauri-apps/plugin-os": "^2.0.0",
    "@tauri-apps/plugin-process": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "lucide-solid": "^0.469.0",
    "motion": "^11.15.0",
    "solid-js": "^1.9.10"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@tailwindcss/vite": "^4.1.7",
    "@tauri-apps/cli": "^2.9.0",
    "@typescript-eslint/eslint-plugin": "^8.18.2",
    "@typescript-eslint/parser": "^8.18.2",
    "@vitest/ui": "^3.0.5",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.16.0",
    "eslint-plugin-solid": "^0.14.3",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11",
    "postcss": "^8.4.49",
    "prettier": "^3.4.2",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.7.2",
    "vite": "^6.0.7",
    "vite-plugin-solid": "^2.10.2",
    "vitest": "^3.0.5"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 🦀 CARGO.TOML

```toml
[package]
name = "valheim-mod-manager"
version = "2.0.0"
description = "Modern, performant mod manager for Valheim"
authors = ["Your Name <your.email@example.com>"]
license = "MIT"
repository = "https://github.com/yourusername/valheim-mod-manager"
edition = "2024"
rust-version = "1.85"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.9", features = ["protocol-asset"] }
tauri-plugin-dialog = "2.0"
tauri-plugin-fs = "2.0"
tauri-plugin-http = "2.0"
tauri-plugin-notification = "2.0"
tauri-plugin-os = "2.0"
tauri-plugin-process = "2.0"
tauri-plugin-shell = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.42", features = ["full"] }
rusqlite = { version = "0.32", features = ["bundled"] }
reqwest = { version = "0.12", features = ["json", "stream", "rustls-tls"] }
anyhow = "1.0"
thiserror = "2.0"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
sha2 = "0.10"
zip = "2.2"
walkdir = "2.5"
chrono = { version = "0.4", features = ["serde"] }
regex = "1.11"
futures = "0.3"
async-trait = "0.1"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "z"
strip = true
```

---

## ⚙️ CONFIGURATION FILES

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@stores/*": ["./src/stores/*"],
      "@lib/*": ["./src/lib/*"],
      "@assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss()
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@assets": path.resolve(__dirname, "./src/assets")
    }
  },

  clearScreen: false,
  
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### src/styles/app.css (Tailwind v4)
```css
@import "tailwindcss";

/* Design Tokens */
@theme {
  /* Colors */
  --color-background-primary: oklch(0.098 0 0);
  --color-background-secondary: oklch(0.137 0 0);
  --color-background-tertiary: oklch(0.176 0 0);
  
  --color-surface-elevated: oklch(0.216 0 0);
  
  --color-text-primary: oklch(1 0 0);
  --color-text-secondary: oklch(0.725 0 0);
  --color-text-tertiary: oklch(0.549 0 0);
  
  --color-accent-primary: oklch(0.608 0.191 255.3);
  --color-accent-secondary: oklch(0.639 0.233 293.7);
  --color-accent-success: oklch(0.659 0.176 158.7);
  --color-accent-warning: oklch(0.745 0.182 75.5);
  --color-accent-error: oklch(0.608 0.238 27.3);
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
}

/* Custom Utilities */
.card-hover {
  transition: transform var(--transition-normal), 
              box-shadow var(--transition-normal);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-background-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-surface-elevated);
}
```

### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:solid/typescript"
  ],
  "plugins": ["@typescript-eslint", "solid"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "solid/reactivity": "warn",
    "solid/no-destructure": "warn"
  }
}
```

### .prettierrc.json
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

---

## 🔧 TAURI CONFIGURATION

### src-tauri/tauri.conf.json
```json
{
  "$schema": "https://schema.tauri.app/config/2.0.0",
  "productName": "Valheim Mod Manager",
  "version": "2.0.0",
  "identifier": "com.valheim.modmanager",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    },
    "longDescription": "Modern, performant, and user-friendly mod manager for Valheim. Features profile management, automatic updates, conflict resolution, and seamless BepInEx integration.",
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "11.0"
    },
    "linux": {
      "deb": {
        "depends": []
      }
    }
  },
  "app": {
    "windows": [
      {
        "title": "Valheim Mod Manager",
        "width": 1280,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "plugins": {
    "dialog": {
      "all": true
    },
    "fs": {
      "scope": ["**"]
    },
    "http": {
      "scope": [
        "https://thunderstore.io/*",
        "https://valheim.thunderstore.io/*",
        "https://cdn.thunderstore.io/*"
      ]
    },
    "notification": {
      "all": true
    },
    "os": {
      "all": true
    },
    "process": {
      "all": true
    },
    "shell": {
      "open": true
    }
  }
}
```

---

## 📚 KEY FILES CONTENT

### src/main.tsx
```typescript
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App";
import "./styles/app.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root
);
```

### src-tauri/src/main.rs
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use tracing_subscriber;

fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("valheim_mod_manager=debug")
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::mod_operations::scan_mods,
            commands::mod_operations::install_mod,
            commands::mod_operations::uninstall_mod,
            commands::profile_operations::create_profile,
            commands::profile_operations::switch_profile,
            commands::system_operations::detect_valheim_path,
            commands::system_operations::check_bepinex,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 🎯 SUMMARY

This complete specification includes:

✅ **Updated Tech Stack**
- Tauri 2.9
- SolidJS 1.9.10
- Tailwind CSS 4.1.7 (with new CSS-based config)
- Vite 6.0.7
- Rust 1.85 (2024 Edition)
- TypeScript 5.7.2

✅ **Complete File Structure**
- All necessary folders and files
- Proper organization
- Clear separation of concerns

✅ **Configuration Files**
- package.json with all dependencies
- Cargo.toml with Rust dependencies
- TypeScript, Vite, ESLint configs
- Tailwind v4 CSS setup

✅ **Build & Development Setup**
- Development scripts
- Build pipelines
- Testing configurations

✅ **Documentation Structure**
- README, ARCHITECTURE, API docs
- Contributing guidelines
- Changelog

Ready for the automated setup script!