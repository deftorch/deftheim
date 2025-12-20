# Checklist Perbaikan Teknis - Deftheim

## ✅ Prioritas 1: Kritis (Timeline: 1-3 hari)
**Kriteria:** Security risks, Critical bugs, Stability

- [ ] [SECURITY] **Sanitasi Input Path:** Implementasikan validasi `mod_id` di `src-tauri/src/commands/mod_operations.rs` untuk mencegah karakter path traversal (`..`, `/`, `\`) sebelum digunakan dalam operasi file.
- [ ] [STABILITY] **Fix Startup Logic:** Ubah `Promise.all` di `src/App.tsx` menjadi `Promise.allSettled` atau handle error per-request agar kegagalan satu service tidak mematikan seluruh aplikasi.
- [ ] [BUG] **Safe Unwrap:** Hapus penggunaan `.unwrap()` pada `path.file_name()` di `scan_mods` (Rust) dan ganti dengan error handling yang aman (misal `.unwrap_or_default()`).

**Definition of Done untuk Priority 1:**
- [ ] Backend panic-free pada input invalid.
- [ ] Aplikasi tetap bisa dibuka (masuk ke UI) meskipun internet mati atau satu file config rusak.

## ✅ Prioritas 2: Fondasi (Timeline: 1-2 minggu)
**Kriteria:** Architecture, Refactoring, Type Safety

- [ ] [REFACTOR] **Split Stores:** Pecah file `src/stores/stores.ts` menjadi modul terpisah (`mods.ts`, `profiles.ts`, `settings.ts`, `ui.ts`) di dalam folder `src/stores/`.
- [ ] [TYPE] **Centralize Types:** Buat `src/types/index.ts`. Pindahkan interface dari `stores.ts` ke sana. Update `src/lib/api/tauri.ts` untuk menggunakan tipe generic yang benar (bukan `any`).
- [ ] [PERF] **Database Transaction:** Bungkus operasi insert/update majemuk (saat install mod) dalam satu transaksi SQLite di Rust untuk menjamin atomicity dan performa.
- [ ] [TEST] **Backend Unit Tests:** Tambahkan unit test untuk fungsi logika murni di backend: `verify_checksum`, parsing manifest, dan validasi input.

**Definition of Done untuk Priority 2:**
- [ ] Tidak ada lagi "God Object" di frontend.
- [ ] `npm run build` dan `cargo check` pass tanpa warning major.
- [ ] Coverage backend > 20%.

## ✅ Prioritas 3: Peningkatan (Timeline: 1-4 minggu)
**Kriteria:** DX, Documentation, Performance Optimization

- [ ] [PERF] **Lazy Folder Sizing:** Ubah kalkulasi ukuran folder di `scan_mods` menjadi *lazy* (hanya hitung saat diminta detail atau cache di DB) untuk mempercepat startup scan.
- [ ] [DOCS] **API Documentation:** Buat dokumen Markdown sederhana di `docs/API.md` yang mencantumkan nama command Tauri, parameter, dan return typenya.
- [ ] [DX] **Constants for Commands:** Buat file constants untuk string command Tauri di frontend untuk menghindari typo.
- [ ] [FEAT] **Windows Admin Check:** Tambahkan pengecekan di startup apakah aplikasi berjalan dengan hak akses yang cukup untuk membuat symlink (jika di Windows).

**Definition of Done untuk Priority 3:**
- [ ] Dokumen API tersedia.
- [ ] Startup time scanning folder besar berkurang.
- [ ] Developer experience lebih konsisten.

## Progress Tracking
- **Priority 1:** ⬜ 0/3 completed
- **Priority 2:** ⬜ 0/4 completed
- **Priority 3:** ⬜ 0/4 completed

## Notes
- Perlu koordinasi apakah `ts-rs` akan dikonfigurasi untuk auto-generate TypeScript types ke `src/types/` secara otomatis saat build Rust.
