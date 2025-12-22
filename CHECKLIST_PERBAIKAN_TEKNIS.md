# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, critical bugs, data integrity risks.

- [ ] **[SECURITY]** Fix `tauri.conf.json` FS Scope
  - Batasi `plugins.fs.scope` hanya ke direktori yang benar-benar dibutuhkan (App Data, Game Directory). Hapus `["**"]`.
- [ ] **[SECURITY]** Implementasi Content Security Policy (CSP)
  - Set `app.security.csp` di `tauri.conf.json` dengan policy ketat (hanya allow thunderstore CDN dan local assets).
- [ ] **[SECURITY]** Fix Path Traversal di `mod_operations.rs`
  - Tambahkan validasi regex pada `mod_id` (hanya `a-zA-Z0-9_-`) sebelum digunakan di `Path::new().join()`.
  - Terapkan validasi ini di `install_single_mod`, `enable_mod`, dan `uninstall_mod`.
- [ ] **[ARCH]** Hapus ketergantungan `repository_path` dari Frontend
  - Backend harus membaca path repository dari database/config internal, bukan dari parameter parameter command frontend (untuk mencegah manipulasi lokasi).

**Definition of Done untuk Priority 1:**
- [ ] `tauri.conf.json` tidak lagi memiliki scope `**` atau CSP `null`.
- [ ] Unit test ditambahkan untuk memverifikasi `mod_id` invalid (misal: `../evil`) ditolak.
- [ ] `npm run tauri:build` sukses dengan konfigurasi baru.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, code stability, refactoring major technical debt.

- [ ] **[REFACTOR]** Pecah "God Object" `stores.ts`
  - Extract `src/stores/mod.store.ts`
  - Extract `src/stores/profile.store.ts`
  - Extract `src/stores/settings.store.ts`
  - Pindahkan interface types ke `src/lib/types/`.
- [ ] **[PERF]** Migrasi Blocking I/O ke Async I/O di Rust
  - Ganti penggunaan `std::fs` dengan `tokio::fs` di dalam `async fn` commands.
  - Atau bungkus blok sinkron dengan `tauri::async_runtime::spawn_blocking`.
- [ ] **[TEST]** Tambahkan Backend Unit Tests
  - Buat test case di `src-tauri/src/commands/mod_operations.rs` (atau file test terpisah) untuk logika instalasi dan dependensi.

**Definition of Done untuk Priority 2:**
- [ ] Frontend tetap berjalan normal setelah refactoring store.
- [ ] UI tidak freeze saat instalasi mod besar.
- [ ] Backend test coverage > 40%.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, DX, documentation.

- [ ] **[DX]** Automasi Type Generation
  - Pastikan `ts-rs` dijalankan otomatis saat build/dev untuk sinkronisasi tipe Rust -> TS.
- [ ] **[DOCS]** Lengkapi JSDoc/TSDoc
  - Tambahkan komentar dokumentasi pada fungsi-fungsi publik di Store dan API wrapper.
- [ ] **[STYLE]** Setup Git Hooks (Husky)
  - Pasang pre-commit hook untuk menjalankan `npm run type-check` dan `cargo fmt`.

**Definition of Done untuk Priority 3:**
- [ ] Tipe data frontend otomatis update saat struct Rust berubah.
- [ ] Kode terformat otomatis sebelum commit.

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed
- **Priority 2:** ⬜ 0/3 completed
- **Priority 3:** ⬜ 0/3 completed

## Notes
- Perbaikan Prioritas 1 wajib dilakukan sebelum rilis versi produksi (v2.0.0 Stable).
- Refactoring `stores.ts` (Prio 2) disarankan dilakukan sebelum menambah fitur fitur baru untuk menghindari merge conflict yang kompleks.
