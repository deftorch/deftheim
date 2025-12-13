#!/bin/bash

# Valheim Mod Manager - Automated Setup Script
# Version: 2.0.0
# Platform: Linux/macOS/WSL

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="valheim-mod-manager"
PROJECT_VERSION="2.0.0"

# Print functions
print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║         VALHEIM MOD MANAGER - SETUP SCRIPT v2.0           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 20 ]; then
            print_success "Node.js $(node --version) found"
        else
            print_error "Node.js version must be >= 20.0.0 (found: $(node --version))"
            missing_deps+=("node>=20")
        fi
    else
        print_error "Node.js not found"
        missing_deps+=("node>=20")
    fi
    
    # Check npm
    if command_exists npm; then
        print_success "npm $(npm --version) found"
    else
        print_error "npm not found"
        missing_deps+=("npm")
    fi
    
    # Check Rust
    if command_exists rustc; then
        RUST_VERSION=$(rustc --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        print_success "Rust $(rustc --version) found"
    else
        print_error "Rust not found"
        missing_deps+=("rust>=1.85")
    fi
    
    # Check Cargo
    if command_exists cargo; then
        print_success "Cargo $(cargo --version | cut -d' ' -f2) found"
    else
        print_error "Cargo not found"
        missing_deps+=("cargo")
    fi
    
    # Check git
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) found"
    else
        print_error "Git not found"
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo ""
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        print_info "Please install the missing dependencies:"
        echo "  - Node.js: https://nodejs.org/ (v20+)"
        echo "  - Rust: https://rustup.rs/ (v1.85+)"
        echo "  - Git: https://git-scm.com/"
        exit 1
    fi
    
    echo ""
}

# Create project structure
create_structure() {
    print_step "Creating project structure..."
    
    # Create main directories
    mkdir -p .github/workflows
    mkdir -p docs
    mkdir -p src/{assets/{fonts,images,icons},components/{common,layout,profile,mod,onboarding,settings},pages,stores,lib/{api,utils,hooks,types},styles}
    mkdir -p src-tauri/{src/{commands,services,models,utils,db},icons}
    mkdir -p tests/{unit,integration,e2e}
    mkdir -p scripts
    mkdir -p .vscode
    
    print_success "Project structure created"
}

# Create package.json
create_package_json() {
    print_step "Creating package.json..."
    
    cat > package.json << 'EOF'
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
    "test:e2e": "playwright test"
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
EOF
    
    print_success "package.json created"
}

# Create Cargo.toml
create_cargo_toml() {
    print_step "Creating Cargo.toml..."
    
    cat > src-tauri/Cargo.toml << 'EOF'
[package]
name = "valheim-mod-manager"
version = "2.0.0"
description = "Modern, performant mod manager for Valheim"
authors = ["Valheim Mod Manager Team"]
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
EOF
    
    print_success "Cargo.toml created"
}

# Create TypeScript config
create_tsconfig() {
    print_step "Creating TypeScript configuration..."
    
    cat > tsconfig.json << 'EOF'
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
EOF

    cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
    
    print_success "TypeScript configuration created"
}

# Create Vite config
create_vite_config() {
    print_step "Creating Vite configuration..."
    
    cat > vite.config.ts << 'EOF'
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
EOF
    
    print_success "Vite configuration created"
}

# Create Tailwind CSS config
create_tailwind_config() {
    print_step "Creating Tailwind CSS configuration..."
    
    cat > src/styles/app.css << 'EOF'
@import "tailwindcss";

/* Design Tokens */
@theme {
  /* Colors - Background */
  --color-background-primary: oklch(0.098 0 0);
  --color-background-secondary: oklch(0.137 0 0);
  --color-background-tertiary: oklch(0.176 0 0);
  
  /* Colors - Surface */
  --color-surface-elevated: oklch(0.216 0 0);
  
  /* Colors - Text */
  --color-text-primary: oklch(1 0 0);
  --color-text-secondary: oklch(0.725 0 0);
  --color-text-tertiary: oklch(0.549 0 0);
  
  /* Colors - Accent */
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
EOF
    
    print_success "Tailwind CSS configuration created"
}

# Create ESLint config
create_eslint_config() {
    print_step "Creating ESLint configuration..."
    
    cat > .eslintrc.json << 'EOF'
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
EOF
    
    print_success "ESLint configuration created"
}

# Create Prettier config
create_prettier_config() {
    print_step "Creating Prettier configuration..."
    
    cat > .prettierrc.json << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
EOF
    
    print_success "Prettier configuration created"
}

# Create Tauri config
create_tauri_config() {
    print_step "Creating Tauri configuration..."
    
    cat > src-tauri/tauri.conf.json << 'EOF'
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
    "longDescription": "Modern, performant, and user-friendly mod manager for Valheim.",
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
EOF
    
    print_success "Tauri configuration created"
}

# Create main source files
create_source_files() {
    print_step "Creating source files..."
    
    # index.html
    cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Valheim Mod Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
    
    # src/main.tsx
    cat > src/main.tsx << 'EOF'
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
EOF
    
    # src/App.tsx
    cat > src/App.tsx << 'EOF'
import { Component } from "solid-js";

const App: Component = () => {
  return (
    <div class="w-full h-full flex items-center justify-center bg-[var(--color-background-primary)]">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
          Valheim Mod Manager
        </h1>
        <p class="text-lg text-[var(--color-text-secondary)]">
          Setup complete! Ready for development.
        </p>
        <div class="mt-8 p-6 bg-[var(--color-background-secondary)] rounded-lg max-w-md">
          <h2 class="text-xl font-semibold text-[var(--color-accent-primary)] mb-4">
            Next Steps:
          </h2>
          <ul class="text-left space-y-2 text-[var(--color-text-secondary)]">
            <li>✓ Project structure created</li>
            <li>✓ Dependencies installed</li>
            <li>✓ Configuration files ready</li>
            <li>→ Start building amazing features!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
EOF
    
    # src/vite-env.d.ts
    cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF
    
    # src-tauri/src/main.rs
    cat > src-tauri/src/main.rs << 'EOF'
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod utils;
mod db;
mod error;

use tracing_subscriber;

fn main() {
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF
    
    # src-tauri/build.rs
    cat > src-tauri/build.rs << 'EOF'
fn main() {
    tauri_build::build()
}
EOF
    
    # Create module files
    touch src-tauri/src/{commands,services,models,utils,db,error}/mod.rs
    
    # Create index files for frontend
    touch src/components/{common,layout,profile,mod,onboarding,settings}/index.ts
    touch src/lib/{api,utils,hooks,types}/index.ts
    
    print_success "Source files created"
}

# Create additional config files
create_additional_configs() {
    print_step "Creating additional configuration files..."
    
    # .gitignore
    cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/launch.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Tauri
src-tauri/target

# Rust
Cargo.lock
**/*.rs.bk

# Environment
.env
.env.local
.env.*.local

# Testing
coverage
.nyc_output

# Build
build
EOF
    
    # .env.example
    cat > .env.example << 'EOF'
# Environment variables for Valheim Mod Manager

# Application
NODE_ENV=development
VITE_APP_VERSION=2.0.0

# API (if needed)
# VITE_API_URL=https://api.example.com
EOF
    
    # README.md
    cat > README.md << 'EOF'
# Valheim Mod Manager

Modern, performant, and user-friendly mod manager for Valheim.

## Features

- 🚀 Fast and responsive UI with SolidJS
- 🎨 Beautiful modern design with Tailwind CSS v4
- 📦 Profile-based mod management
- 🔄 Automatic mod updates
- 🔧 Built-in conflict resolution
- 💾 Automatic backups
- 🌐 Thunderstore integration

## Prerequisites

- Node.js >= 20.0.0
- Rust >= 1.85
- npm >= 10.0.0

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### Building

```bash
# Build for production
npm run tauri:build
```

## Tech Stack

- **Frontend:** SolidJS 1.9.10 + TypeScript 5.7.2
- **Styling:** Tailwind CSS 4.1.7
- **Build Tool:** Vite 6.0.7
- **Desktop:** Tauri 2.9
- **Backend:** Rust 1.85 (2024 Edition)

## Project Structure

```
valheim-mod-manager/
├── src/              # Frontend (SolidJS)
├── src-tauri/        # Backend (Rust)
├── tests/            # Tests
└── docs/             # Documentation
```

## License

MIT License - see LICENSE file for details
EOF
    
    # VSCode settings
    mkdir -p .vscode
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer",
    "editor.formatOnSave": true
  },
  "rust-analyzer.cargo.features": "all"
}
EOF
    
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "tauri-apps.tauri-vscode",
    "rust-lang.rust-analyzer",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF
    
    print_success "Additional configuration files created"
}

# Install dependencies
install_dependencies() {
    print_step "Installing Node.js dependencies..."
    
    if npm install; then
        print_success "Node.js dependencies installed"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
    
    echo ""
}

# Initialize git
init_git() {
    print_step "Initializing git repository..."
    
    if [ -d .git ]; then
        print_info "Git repository already exists"
    else
        git init
        git add .
        git commit -m "Initial commit: Project setup with Tauri 2.9, SolidJS 1.9, Tailwind v4"
        print_success "Git repository initialized"
    fi
    
    echo ""
}

# Create placeholder icons
create_placeholder_icons() {
    print_step "Creating placeholder icons..."
    
    # Create simple placeholder files
    touch src-tauri/icons/{32x32.png,128x128.png,128x128@2x.png,icon.icns,icon.ico}
    
    print_info "Placeholder icons created (replace with actual icons later)"
    echo ""
}

# Print final instructions
print_final_instructions() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║              🎉