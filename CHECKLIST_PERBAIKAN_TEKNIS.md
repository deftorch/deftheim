# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, critical bugs, production blockers

- [ ] **[SECURITY]** Implementasi Sanitasi Input pada Backend
    - Validasi `mod_id` agar hanya alphanumeric + hyphen/underscore.
    - Validasi `repository_path` untuk mencegah traversal.
    - Lokasi: `src-tauri/src/commands/mod_operations.rs`
- [ ] **[SECURITY]** Perbaiki Konfigurasi `fs` Scope
    - Batasi scope di `tauri.conf.json` hanya ke folder yang diperlukan (App Data, Game Path).
    - Hapus `["**"]` yang memberikan akses penuh ke file system.
- [ ] **[SECURITY]** Implementasi Content Security Policy (CSP)
    - Set CSP di `tauri.conf.json` untuk memblokir script eksternal yang tidak dikenal.
- [ ] **[BUG]** Perbaiki Blocking I/O di Rust Async
    - Bungkus operasi berat (`fs::copy`, `zip::extract`) dengan `spawn_blocking` di `mod_operations.rs`.

**Definition of Done untuk Priority 1:**
- [ ] Code telah diperbaiki dan tested
- [ ] Security audit ulang (manual check) lulus
- [ ] Tidak ada blocking operation warning di log saat install mod besar
- [ ] Validasi input teruji dengan unit test (misal: input `../../` ditolak)

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, significant refactoring, infrastructure

- [ ] **[REFACTOR]** Pecah "God Object" `stores.ts`
    - Extract `modStore`, `profileStore`, `settingsStore` ke file terpisah di `src/stores/`.
- [ ] **[TEST]** Tambahkan Unit Test Backend
    - Buat test case untuk `install_single_mod` (mocking FS jika perlu) dan logika dependensi.
    - Lokasi: `src-tauri/tests/mod_tests.rs`.
- [ ] **[ARCH]** Sinkronisasi Type Otomatis
    - Pastikan `ts-rs` dikonfigurasi untuk generate TypeScript interfaces dari Rust structs secara otomatis ke `src/types/bindings.ts`.
- [ ] **[DX]** Setup Pre-commit Hooks
    - Tambahkan husky/lint-staged untuk menjalankan `cargo fmt` dan `eslint` sebelum commit.

**Definition of Done untuk Priority 2:**
- [ ] Architecture documented in ADR
- [ ] Frontend code terstruktur modular per domain
- [ ] Backend test coverage meningkat (target: cover happy path instalasi)
- [ ] CI/CD pipeline updated

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, developer experience, documentation

- [ ] **[PERF]** Optimalkan `scan_mods`
    - Hindari re-scanning full directory jika metadata di DB masih valid/baru.
- [ ] **[UX]** Real-time Progress Bar
    - Implementasi Tauri Events untuk mengirim progress download/extract mod ke frontend.
- [ ] **[DOCS]** Lengkapi JSDoc/RustDoc
    - Tambahkan dokumentasi pada fungsi publik di `mod_operations.rs` dan stores frontend.
- [ ] **[FEAT]** Validasi Checksum yang Lebih Kuat
    - Pastikan semua file yang di-download diverifikasi hash-nya sebelum diekstrak (saat ini sudah ada tapi opsional/tergantung parameter).

**Definition of Done untuk Priority 3:**
- [ ] Code review standards updated
- [ ] Documentation review completed
- [ ] Developer onboarding time <15 minutes
- [ ] Team training completed

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed (Target: [Date])
- **Priority 2:** ⬜ 0/4 completed (Target: [Date])
- **Priority 3:** ⬜ 0/4 completed (Target: [Date])

## Notes & Dependencies
- [ ] External dependencies: None identified.
- [ ] Resource requirements: Backend engineer familiarity with Tauri v2 security model.
- [ ] Risk mitigation: Perform backups of user `mod_profiles` before deploying DB schema changes.
