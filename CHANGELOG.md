# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-05-22

### Added
- **Backend**: Implemented core system operations (`detect_valheim_path`, `check_bepinex`) using `dirs` and `winreg` for reliable cross-platform detection.
- **Backend**: Implemented mod operations (`scan_mods`, `install_mod`, `uninstall_mod`) using `walkdir` and `zip`.
- **Backend**: Added file-based logging using `tracing-appender` (logs rotate daily).
- **Frontend**: Added `@tanstack/solid-virtual` for performant rendering of large mod lists in the Repository view.
- **Frontend**: Added a proper loading state with `createResource` in `App.tsx` to prevent startup white-screening.
- **Testing**: Added unit testing infrastructure for Frontend (Vitest + JSDOM) and Backend (Cargo Test).

### Changed
- **Security**: Enforced strict Content Security Policy (CSP) in `tauri.conf.json`.
- **Security**: Restricted file system access scope from global (`**`) to specific application and user configuration directories.
- **Refactor**: Split monolithic `src/stores/stores.ts` into modular stores (`mod.store.ts`, `profile.store.ts`, `settings.store.ts`, `ui.store.ts`).
- **Types**: Replaced `any` types in `src/lib/api/tauri.ts` with strict TypeScript interfaces (`ModInfo`, `Profile`).
- **Docs**: Updated `README.md` with detailed architecture and development setup instructions.

### Fixed
- Fixed "God Store" anti-pattern in frontend state management.
- Fixed insecure default Tauri configuration.
