# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, critical bugs, production blockers

- [ ] [SECURITY] Update `tauri.conf.json`: Set CSP string yang ketat (bukan `null`).
- [ ] [SECURITY] Update `tauri.conf.json`: Batasi scope `fs` hanya ke direktori aplikasi/game yang diperlukan (bukan `["**"]`).
- [ ] [SECURITY] Refactor `uninstall_mod` dan command lain di Rust untuk **tidak menerima** `repository_path` dari frontend. Gunakan path dari internal state/database.
- [ ] [SECURITY] Tambahkan validasi regex untuk `mod_id` (hanya `[a-zA-Z0-9_-]+`) di backend sebelum operasi file.

**Definition of Done untuk Priority 1:**
- [ ] `npm audit` dan manual security review pass.
- [ ] Input validasi terpasang di semua command Rust yang menyentuh file system.
- [ ] CSP aktif dan tidak memblokir fungsi utama.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, significant refactoring

- [ ] [REFACTOR] Pecah `src/stores/stores.ts` menjadi file terpisah: `src/stores/modStore.ts`, `src/stores/profileStore.ts`, dll.
- [ ] [REFACTOR] Pindahkan business logic kompleks dari store ke `src/services/`.
- [ ] [TEST] Refactor frontend tests (`stores.test.ts`) untuk menggunakan `reconcile` pada `beforeEach` agar reset state lebih robust.
- [ ] [ARCH] Implementasikan pattern "Service Layer" di frontend untuk komunikasi ke Tauri, menggantikan direct import di komponen.

**Definition of Done untuk Priority 2:**
- [ ] Tidak ada file > 300 baris.
- [ ] Test suite frontend berjalan stabil tanpa leak state.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, DX

- [ ] [TEST] Tambahkan unit test untuk Rust commands (terutama validasi logic).
- [ ] [DOCS] Buat dokumentasi internal untuk flow instalasi mod (`docs/MOD_INSTALLATION.md`).
- [ ] [PERF] Evaluasi penggunaan virtual scrolling di list mod jika jumlah mod > 100.

**Definition of Done untuk Priority 3:**
- [ ] Code review standards updated
- [ ] Documentation review completed
- [ ] Developer onboarding time <15 minutes
- [ ] Team training completed

## Progress Tracking
- **Priority 1:** ⬜ 0/4 completed
- **Priority 2:** ⬜ 0/4 completed
- **Priority 3:** ⬜ 0/3 completed

## Notes & Dependencies
- [ ] **Dependency:** Perbaikan keamanan backend (Rust) harus dilakukan sebelum rilis v2.0.0 ke publik.
- [ ] **Resource:** Membutuhkan setidaknya 1 Senior Backend Rust engineer untuk audit final path traversal.
- [ ] **Risk:** Perubahan pada `stores.ts` akan memecah banyak file, pastikan backup dilakukan sebelum refactoring besar.
