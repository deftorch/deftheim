# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, Data integrity risks, Production blockers.

- [ ] **[SECURITY]** Batasi scope `fs` di `src-tauri/tauri.conf.json`. Ubah `["**"]` menjadi spesifik path (App Data & Game Directory).
- [ ] **[SECURITY]** Implementasikan CSP di `src-tauri/tauri.conf.json`. Jangan biarkan `null`.
- [ ] **[SECURITY]** Sanitasi input `mod_id` di `src-tauri/src/commands/mod_operations.rs` untuk mencegah path traversal (e.g., filter karakter `..`, `/`, `\`).
- [ ] **[PERF/STABILITY]** Perbaiki `scan_mods` di Rust untuk menggunakan `tokio::fs` atau `spawn_blocking` guna mencegah blocking pada async runtime.

**Definition of Done untuk Priority 1:**
- [ ] `npm run tauri:build` sukses.
- [ ] Aplikasi tidak bisa membaca file di luar direktori yang diizinkan (test manual).
- [ ] UI tidak freeze saat scan mod dalam jumlah banyak.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, Refactoring untuk maintainability.

- [ ] **[REFACTOR]** Pecah `src/stores/stores.ts` menjadi modul terpisah (`modStore.ts`, `profileStore.ts`, `types.ts`).
- [ ] **[ARCH]** Perbaiki inisialisasi aplikasi di `App.tsx`. Ganti `Promise.all` dengan strategi yang lebih resilien (misal `Promise.allSettled`) agar aplikasi tetap bisa buka meski satu service gagal.
- [ ] **[TEST]** Buat unit test dasar untuk backend Rust (`src-tauri/tests`), khususnya untuk fungsi `mod_operations`.
- [ ] **[UX]** Tambahkan Global Error Boundary di Frontend untuk menangkap crash rendering.

**Definition of Done untuk Priority 2:**
- [ ] Codebase terstruktur modular.
- [ ] Aplikasi tetap berjalan (dengan pesan error) jika database/settings corrupt.
- [ ] Minimal 1 test case berjalan untuk backend.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, DX, Documentation.

- [ ] **[DOCS]** Buat file `CONTRIBUTING.md` di root directory.
- [ ] **[DX]** Tambahkan script `lint:rs` atau konfigurasi `clippy` di pipeline CI/CD (jika ada) atau `package.json`.
- [ ] **[FEAT]** Implementasi parallel download untuk dependensi mod (sudah ada di roadmap kode, perlu finalisasi/testing).
- [ ] **[STYLE]** Pastikan konsistensi penamaan variabel (camelCase vs snake_case) antara Rust dan TS interface terjaga (gunakan `#[serde(rename_all = "camelCase")]`).

**Definition of Done untuk Priority 3:**
- [ ] Dokumentasi kontribusi tersedia.
- [ ] `cargo clippy` pass tanpa warning.

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed
- **Priority 2:** ⬜ 0/4 completed
- **Priority 3:** ⬜ 0/4 completed

## Notes
- Perbaikan Security (Prioritas 1) harus dilakukan SEBELUM rilis v2.0.0 publik.
- Refactoring Store (Prioritas 2) akan menyentuh banyak file UI, pastikan regression testing dilakukan.
