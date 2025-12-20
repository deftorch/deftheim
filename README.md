# 🎮 Deftheim

> Modern, performant, and user-friendly mod manager for Valheim built with **SolidJS**, **Tauri 2.9**, and **Rust**.

## ✨ Features

### 🎯 Core Features
- ✅ **Profile Management** - Create unlimited mod configurations
- ✅ **Smart Mod Scanner** - Auto-detect and parse mods
- ✅ **One-Click Installation** - Install mods from Thunderstore
- ✅ **Automatic Updates** - Keep mods up-to-date
- ✅ **Conflict Detection** - Identify and resolve conflicts
- ✅ **Backup & Restore** - Never lose your configurations
- ✅ **Beautiful UI** - Modern dark theme with smooth animations

### 🚀 Advanced Features
- ✅ **SQLite Database** - Fast and reliable data storage
- ✅ **Multi-Profile Support** - Switch between configurations instantly
- ✅ **Search & Filter** - Find mods quickly
- ✅ **Load Order Management** - Control mod loading sequence
- ✅ **BepInEx Integration** - Seamless mod framework support
- ✅ **Settings Sync** - Customizable preferences

---

## 📦 Installation

### Prerequisites
- **Windows 10/11** (64-bit)
- **Valheim** (installed via Steam)
- **~500MB** free disk space

### Quick Install
1. Download the latest release from [Releases](#)
2. Run `Deftheim-Setup.exe`
3. Follow the installation wizard
4. Launch and enjoy!

---

## 🏗️ Architecture

Deftheim uses a split-architecture approach ensuring security and performance:

```mermaid
graph TD
    UI[Frontend (SolidJS)] <-->|IPC| Core[Backend (Rust/Tauri)]
    Core <-->|SQL| DB[(SQLite)]
    Core <-->|HTTPS| API[Thunderstore API]
    Core <-->|FS| Game[Valheim Game Folder]

    subgraph Frontend
    UI --> Stores[Global Stores]
    Stores --> Components
    end

    subgraph Backend
    Core --> ModOps[Mod Operations]
    Core --> ProfileOps[Profile Operations]
    Core --> SystemOps[System Detection]
    end
```

## 🛠️ Development

For detailed development instructions, please refer to [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

### Prerequisites

- **Rust**: Latest stable version (install via rustup)
- **Node.js**: LTS version (v18+)
- **Build Tools**:
  - Linux: `libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - Windows: C++ Build Tools

### Tech Stack
```json
{
  "frontend": {
    "framework": "SolidJS 1.9.10",
    "language": "TypeScript 5.7.2",
    "styling": "Tailwind CSS 4.1.7",
    "ui": "Kobalte + Motion One",
    "build": "Vite 6.0.7"
  },
  "backend": {
    "framework": "Tauri 2.9",
    "language": "Rust 1.85 (2024 Edition)",
    "database": "SQLite 3",
    "async": "Tokio 1.42"
  }
}
```

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/deftorch/deftheim.git
cd deftheim

# Install dependencies
npm install

# Run development server
npm run tauri dev
```

### Build for Production

```bash
# Build optimized release
npm run tauri:build

# Output: src-tauri/target/release/
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/deftorch/deftheim/issues/new) with:

- **OS & Version**
- **App Version**
- **Steps to Reproduce**
- **Expected vs Actual Behavior**
- **Screenshots** (if applicable)

---

## 📄 License

MIT License © 2024 Deftheim Team

---

## 🙏 Acknowledgments

- **Valheim** by Iron Gate Studio
- **BepInEx** modding framework
- **Thunderstore** mod repository
- **SolidJS** & **Tauri** teams
- All mod authors in the community

---

**Built with ❤️ by Deftorch**
