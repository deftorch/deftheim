# Checklist Perbaikan Teknis - deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, critical bugs, production blockers

- [ ] **[SECURITY] Fix Path Traversal in Mod Operations**
  - **File:** `src-tauri/src/commands/mod_operations.rs`
  - **Action:** Implementasi validasi ketat pada `mod_id` di fungsi `install_single_mod`, `scan_mods`, `enable_mod`, dll. Tolak input yang mengandung `..`, `/`, `\`.
- [ ] **[BUG] Fix Race Condition in App Startup**
  - **File:** `src/App.tsx`
  - **Action:** Ganti `Promise.all` dengan `Promise.allSettled` atau wrap individual calls dengan try-catch agar kegagalan satu service tidak mematikan seluruh aplikasi.
- [ ] **[SECURITY] Audit & Pin Dependencies**
  - **Action:** Jalankan `npm audit fix` dan pastikan `Cargo.lock` terkomit.

**Definition of Done untuk Priority 1:**
- [ ] Validasi input `mod_id` terimplementasi dan di-test dengan unit test (mencoba path traversal).
- [ ] Aplikasi dapat start meskipun offline (Load Mods gagal).
- [ ] Tidak ada vulnerability high/critical di dependensi.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, significant refactoring, infrastructure

- [ ] **[REFACTOR] Split Global Store**
  - **File:** `src/stores/stores.ts`
  - **Action:** Pecah menjadi `modStore.ts`, `profileStore.ts`, `settingsStore.ts`.
- [ ] **[TEST] Add Backend Unit Tests**
  - **Folder:** `src-tauri/src/`
  - **Action:** Tambahkan unit tests untuk `mod_operations.rs` (terutama logic checksum dan install) dan `thunderstore.rs`.
- [ ] **[TS] Improve Type Safety in API Bridge**
  - **File:** `src/lib/api/tauri.ts`
  - **Action:** Ganti return type `any` dengan interface konkret (`ModInfo[]`, `Profile[]`, dll) yang di-import dari `types/index.ts` (perlu dibuat/dipastikan).

**Definition of Done untuk Priority 2:**
- [ ] State management termodularisasi.
- [ ] Coverage backend > 40%.
- [ ] `ts-ignore` dan `any` berkurang signifikan.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, developer experience, documentation

- [ ] **[DX] Add Component Tests**
  - **Action:** Tambahkan tes untuk komponen UI utama (`Sidebar`, `ModList`) menggunakan Vitest/Testing Library.
- [ ] **[PERF] Implement Virtual Scrolling**
  - **Action:** Pastikan `@tanstack/solid-virtual` terimplementasi dengan benar untuk daftar mod yang panjang.
- [ ] **[DOCS] Add RustDoc**
  - **Action:** Tambahkan dokumentasi komentar pada fungsi `pub` di backend Rust.

**Definition of Done untuk Priority 3:**
- [ ] Komponen utama memiliki snapshot/logic tests.
- [ ] Dokumentasi kode backend lengkap.

## Progress Tracking
- **Priority 1:** ⬜ 0/3 completed (Target: [Date])
- **Priority 2:** ⬜ 0/3 completed (Target: [Date])
- **Priority 3:** ⬜ 0/3 completed (Target: [Date])

## Notes & Dependencies
- [ ] **Dependencies:**
  - Membutuhkan akses ke repo upstream jika ada perubahan API Thunderstore.
  - Memerlukan `cargo-tarpaulin` untuk mengukur coverage Rust (opsional).
- [ ] **Resources:**
  - 1 Backend Engineer (Rust) untuk security fixes & tests.
  - 1 Frontend Engineer (SolidJS) untuk store refactoring.
- [ ] **Risk Mitigation:**
  - Backup database pengguna sebelum menerapkan perubahan schema atau logika store baru.
  - Test path traversal fix secara ekstensif dengan payload berbahaya dummy.
