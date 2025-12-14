# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 Hari)
**Kriteria:** Security vulnerabilities & Functional Blockers.

- [x] **[SECURITY] Perbaiki `tauri.conf.json` CSP**
  - Set `csp` string yang ketat (`default-src 'self'; img-src 'self' asset: https://cdn.thunderstore.io; style-src 'self' 'unsafe-inline'; script-src 'self';`).
- [x] **[SECURITY] Batasi Scope Plugin `fs`**
  - Ubah scope `["**"]` menjadi path spesifik (`$APP/*`, `$HOME/.config/deftheim/*`, `$TEMP/*`).
- [x] **[BACKEND] Implementasi Dasar `system_operations`**
  - Implementasi `detect_valheim_path` dan `check_bepinex` agar aplikasi bisa mengenali environment user saat startup.
- [x] **[FRONTEND] Fix Startup Blocking**
  - Refactor `App.tsx` agar tidak memblokir render UI saat loading data (`onMount` -> `createResource` dengan `Suspense` fallback atau loading UI).

**Definition of Done:**
- Security scan manual pada config file passed.
- Aplikasi bisa start tanpa blank screen lama.
- Path Valheim terdeteksi.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 Minggu)
**Kriteria:** Architecture & Core Features Implementation.

- [x] **[REFACTOR] Split `src/stores/stores.ts`**
  - Pecah menjadi `stores/modStore.ts`, `stores/profileStore.ts`, dll.
- [x] **[BACKEND] Implementasi `mod_operations`**
  - Implementasi `scan_mods` (baca folder), `install_mod` (download & unzip), `uninstall_mod`.
- [x] **[BACKEND] Error Handling**
  - Ganti `unwrap()` (jika ada nanti) dengan proper `Result<?>` handling dan kirim error code yang jelas ke frontend.
- [x] **[DX] Setup Testing Framework**
  - Buat 1 contoh unit test untuk Frontend (Store) dan 1 untuk Backend (Service).

**Definition of Done:**
- Store terpecah dan import diupdate.
- Mod management dasar (Install/Uninstall) berfungsi.
- `npm test` dan `cargo test` jalan.

## ✅ Prioritas 3: Peningkatan (Timeline: 2-4 Minggu)
**Kriteria:** DX, Docs, Polish.

- [x] **[DOCS] Update README & CONTRIBUTING**
  - Jelaskan arsitektur folder dan cara run test.
- [x] **[FE] Implementasi Virtual Scroller**
  - Gunakan `@tanstack/solid-virtual` untuk list mod di `Repository.tsx`.
- [x] **[BE] Logging System**
  - Implementasi `tracing-appender` di `main.rs` untuk menyimpan logs ke file.
- [x] **[TYPE] Perbaiki `any` di `tauri.ts`**
  - Gunakan interface TypeScript yang sesuai (`ModInfo`, `Profile`) menggantikan `any`.

**Definition of Done:**
- Dokumentasi lengkap.
- UI responsif dengan banyak mod.
- Logs tersedia untuk debugging.

## Progress Tracking
- **Priority 1:** ✅ 4/4 completed
- **Priority 2:** ✅ 4/4 completed
- **Priority 3:** ✅ 4/4 completed
