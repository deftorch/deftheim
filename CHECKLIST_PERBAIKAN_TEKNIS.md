# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 Hari)
**Kriteria:** Security vulnerabilities & Functional Blockers.

- [ ] **[SECURITY] Perbaiki `tauri.conf.json` CSP**
  - Set `csp` string yang ketat (e.g., `default-src 'self'; img-src 'self' asset: https://cdn.thunderstore.io; style-src 'self' 'unsafe-inline';`).
- [ ] **[SECURITY] Batasi Scope Plugin `fs`**
  - Ubah scope `["**"]` menjadi path spesifik saja (misal `$APP/*`, `$DOCUMENT/Valheim/*`). Gunakan variable path Tauri.
- [ ] **[BACKEND] Implementasi Dasar `system_operations`**
  - Implementasi `detect_valheim_path` dan `check_bepinex` agar aplikasi bisa mengenali environment user saat startup.
- [ ] **[FRONTEND] Fix Startup Blocking**
  - Refactor `App.tsx` agar tidak memblokir render UI saat loading data (`onMount` -> `createResource` atau handle loading state di UI).

**Definition of Done:**
- Security scan manual pada config file passed.
- Aplikasi bisa start tanpa blank screen lama.
- Path Valheim terdeteksi.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 Minggu)
**Kriteria:** Architecture & Core Features Implementation.

- [ ] **[REFACTOR] Split `src/stores/stores.ts`**
  - Pecah menjadi `stores/modStore.ts`, `stores/profileStore.ts`, dll.
- [ ] **[BACKEND] Implementasi `mod_operations`**
  - Implementasi `scan_mods` (baca folder), `install_mod` (download & unzip), `uninstall_mod`.
- [ ] **[BACKEND] Error Handling**
  - Ganti `unwrap()` (jika ada nanti) dengan proper `Result<?>` handling dan kirim error code yang jelas ke frontend.
- [ ] **[DX] Setup Testing Framework**
  - Buat 1 contoh unit test untuk Frontend (Store) dan 1 untuk Backend (Service).

**Definition of Done:**
- Store terpecah dan import diupdate.
- Mod management dasar (Install/Uninstall) berfungsi.
- `npm test` dan `cargo test` jalan.

## ✅ Prioritas 3: Peningkatan (Timeline: 2-4 Minggu)
**Kriteria:** DX, Docs, Polish.

- [ ] **[DOCS] Update README & CONTRIBUTING**
  - Jelaskan arsitektur folder dan cara run test.
- [ ] **[FE] Implementasi Virtual Scroller**
  - Jika list mod mencapai ratusan, gunakan virtual scroller di UI.
- [ ] **[BE] Logging System**
  - Pastikan logs disimpan ke file (menggunakan `tracing-appender`) untuk debugging user issue.
- [ ] **[TYPE] Perbaiki `any` di `tauri.ts`**
  - Buat interface TypeScript yang sesuai dengan Struct Rust.

**Definition of Done:**
- Dokumentasi lengkap.
- UI responsif dengan banyak mod.
- Logs tersedia untuk debugging.

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed
- **Priority 2:** ⬜ 0/4 completed
- **Priority 3:** ⬜ 0/4 completed
