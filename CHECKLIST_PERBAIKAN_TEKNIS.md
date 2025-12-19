# Checklist Perbaikan Teknis - Deftheim v2.0.0

Checklist ini disusun berdasarkan temuan audit untuk memandu tim dalam menstabilkan dan mengamankan aplikasi sebelum rilis.

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security vulnerabilities, critical bugs, data loss risks.

- [x] **[SECURITY] Sanitize `mod_id` input** di `mod_operations.rs`.
    -   *Action*: Pastikan `mod_id` tidak mengandung `..`, `/`, atau `\` sebelum digunakan dalam `Path::join`.
- [x] **[SECURITY] Whitelist URL Download** di `install_mod`.
    -   *Action*: Validasi `url` harus dimulai dengan `https://gcdn.thunderstore.io/` atau domain terpercaya lainnya. Atau lebih baik, hapus parameter `url` dan biarkan backend mengambilnya dari DB.
- [x] **[SECURITY] Perketat Scope FS** di `tauri.conf.json`.
    -   *Action*: Ubah `fs: { scope: ["**"] }` menjadi scope spesifik (misal: `$APP/*`, `$APPDATA/Deftheim/*`, dan path instalasi Valheim yang dideteksi).
- [x] **[SECURITY] Implement Content Security Policy (CSP)** di `tauri.conf.json`.
    -   *Action*: Set `csp` string untuk membatasi script source ke `'self'` dan connect source ke Thunderstore.

**Definition of Done untuk Priority 1:**
- [x] Semua celah Path Traversal tertutup (dibuktikan dengan test case gagal saat inject `../`).
- [x] Frontend tidak bisa lagi mengakses file sistem sembarangan (misal `/etc/passwd`).
- [x] `npm audit` dan `cargo audit` bersih.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture improvements, performance, type safety.

- [ ] **[CODE] Hapus `any` dari `src/lib/api/tauri.ts`**.
    -   *Action*: Import interface `ModInfo`, `Profile`, `AppSettings` dari shared types dan aplikasikan ke return type `invoke`.
- [ ] **[PERF] Optimalkan `scan_mods`**.
    -   *Action*: Ubah iterasi sinkron menjadi asinkron (`tokio::fs`) atau gunakan `walkdir` di thread pool terpisah. Implementasi caching hasil scan.
- [ ] **[REFACTOR] Unifikasi Logika Install**.
    -   *Action*: Gabungkan logika ekstraksi/install dari `install_mod` dan `install_mod_with_deps_parallel` ke satu service function yang reusable.
- [ ] **[DX] Tambahkan Unit Test Backend**.
    -   *Action*: Buat test untuk `verify_checksum`, parsing manifest, dan sanitasi path.

**Definition of Done untuk Priority 2:**
- [ ] Tidak ada lagi penggunaan `any` di layer API frontend.
- [ ] `scan_mods` tidak memblokir UI thread saat memuat >500 mod.
- [ ] Minimal 1 test case untuk setiap modul kritis backend.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** Code quality improvements, documentation, UI polish.

- [ ] **[CODE] Extract Types**.
    -   *Action*: Pindahkan interface dari `stores.ts` ke `src/types/index.ts`.
- [ ] **[CODE] Refactor Store State**.
    -   *Action*: Optimalkan `setActiveProfile` untuk menghindari loop O(N).
- [ ] **[DOCS] Lengkapi README & CONTRIBUTING**.
    -   *Action*: Tambahkan instruksi setup environment yang jelas dan arsitektur diagram.
- [ ] **[UX] Error Handling**.
    -   *Action*: Tampilkan pesan error yang lebih user-friendly di UI jika install gagal (bukan sekadar console log).

**Definition of Done untuk Priority 3:**
- [ ] Struktur kode lebih terorganisir.
- [ ] Dokumentasi lengkap untuk onboard developer baru < 30 menit.
- [ ] UX handling untuk kegagalan jaringan/disk lebih robust.

## Progress Tracking
- **Priority 1:** ✅ 4/4 completed
- **Priority 2:** ⬜ 0/4 completed
- **Priority 3:** ⬜ 0/4 completed

## Notes
- Perbaikan Priority 1 adalah **BLOCKER** untuk rilis Beta/Public.
- Pastikan backup database sebelum melakukan perubahan besar pada skema atau logika mod.
