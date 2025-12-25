# Checklist Perbaikan Teknis - Deftheim v2.0.0

## ✅ Prioritas 1: Kritis (Timeline: 1-3 Hari)
**Kriteria:** Security vulnerabilities, Data Integrity risks, Production Blockers.

- [ ] **[SECURITY] Fix Path Traversal in `uninstall_mod` & `enable_mod`**
    - Lokasi: `src-tauri/src/commands/mod_operations.rs`
    - Aksi: Tambahkan validasi `mod_id` (hanya alfanumerik, `_`, `-`, `.`). Tolak jika mengandung `/` atau `\`.
- [ ] **[SECURITY] Restrict FS Scope in `tauri.conf.json`**
    - Lokasi: `src-tauri/tauri.conf.json`
    - Aksi: Ubah `scope: ["**"]` menjadi list spesifik (e.g., `$APPDATA/deftheim/*`, direktori instalasi Valheim).
- [ ] **[SECURITY] Implement Content Security Policy (CSP)**
    - Lokasi: `src-tauri/tauri.conf.json`
    - Aksi: Set `csp` string yang ketat. Contoh: `"default-src 'self'; connect-src 'self' https://thunderstore.io https://valheim.thunderstore.io; img-src 'self' https://cdn.thunderstore.io asset: https://asset.localhost"`.
- [ ] **[STABILITY] Fix Panic on `scan_mods`**
    - Lokasi: `src-tauri/src/commands/mod_operations.rs`
    - Aksi: Ganti `path.file_name().unwrap()` dengan handling `None` yang aman.

**Definition of Done Priority 1:**
- [ ] Vulnerability path traversal tidak bisa dieksploitasi (test dengan input `../../test`).
- [ ] Aplikasi tetap berjalan normal dengan FS scope terbatas.
- [ ] Tidak ada panic saat scanning folder kosong/root.

---

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 Minggu)
**Kriteria:** Architecture Refactoring, Performance Stability, Technical Debt.

- [ ] **[REFACTOR] Split "God Object" Store**
    - Lokasi: `src/stores/stores.ts`
    - Aksi: Pecah menjadi `mod.store.ts`, `profile.store.ts`, `settings.store.ts`. Pindahkan interface ke `src/types`.
- [ ] **[PERF] Non-blocking File I/O in Rust**
    - Lokasi: `src-tauri/src/commands/mod_operations.rs` (terutama `install_single_mod`)
    - Aksi: Bungkus operasi `zip::ZipArchive` dan `fs::copy` ke dalam `tauri::async_runtime::spawn_blocking`.
- [ ] **[TEST] Fix Frontend Tests**
    - Lokasi: `src/stores/stores.test.ts`
    - Aksi: Perbaiki test yang gagal ("should handle load mods error") dan pastikan `npm test` pass.

**Definition of Done Priority 2:**
- [ ] Kode frontend termodularisasi, impor store lebih spesifik.
- [ ] UI tidak freeze saat instalasi mod besar.
- [ ] Semua existing test pass.

---

## ✅ Prioritas 3: Peningkatan (Timeline: 2-4 Minggu)
**Kriteria:** DX improvements, Documentation, Minor Refactoring.

- [ ] **[DX] Backend Unit Tests**
    - Aksi: Buat unit test di Rust untuk fungsi parsing manifest dan validasi checksum.
- [ ] **[ARCH] Input Validation Layer**
    - Aksi: Buat struct input dengan validasi (menggunakan crate `validator`) untuk semua command Tauri, jangan pass raw String.
- [ ] **[DOCS] Update API Documentation**
    - Aksi: Dokumentasikan payload request/response untuk setiap Tauri command di `docs/API.md`.

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed
- **Priority 2:** ⬜ 0/3 completed
- **Priority 3:** ⬜ 0/3 completed

## Notes & Dependencies
- [ ] **Dependencies:**
    - Perlu koordinasi dengan tim produk untuk definisi scope FS yang valid.
    - `validator` crate perlu ditambahkan ke `Cargo.toml`.
- [ ] **Resources:**
    - 1 Backend Engineer (Rust) untuk perbaikan security & performa.
    - 1 Frontend Engineer (SolidJS) untuk refactoring store.
- [ ] **Risks:**
    - Refactoring store berpotensi memecah fitur existing jika tidak ada regression test yang kuat. Pastikan test coverage frontend ditingkatkan sebelum refactor.
