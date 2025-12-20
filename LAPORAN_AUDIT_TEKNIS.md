# Laporan Audit Teknis - Deftheim

## Ringkasan Eksekutif
Audit teknis komprehensif telah dilakukan terhadap proyek Deftheim. Proyek ini berada dalam kondisi yang cukup baik sebagai aplikasi Tauri v2 modern, namun terdapat beberapa area kritis yang perlu perhatian segera, terutama terkait keamanan input dan struktur kode frontend.

- **Kesehatan Kode:** 7/10 (Frontend perlu modularisasi)
- **Keamanan:** 8/10 (Validasi input path perlu diperketat)
- **Performa:** 8/10 (Rust backend efisien, namun startup frontend berisiko bottleneck)
- **Dokumentasi:** 6/10 (Dokumentasi API dan arsitektur kurang mendalam)

**Temuan Paling Kritis:**
1.  **Risiko Path Traversal (Low/Medium):** Logika `scan_mods` dan instalasi di backend Rust perlu memastikan sanitasi `mod_id` yang ketat agar tidak keluar dari direktori yang diizinkan, meskipun Tauri `fs` scope membatasi ini, validasi eksplisit tetap diperlukan.
2.  **God Object `stores.ts`:** State management frontend terkonsentrasi dalam satu file besar (~300 baris dan akan terus tumbuh), menyulitkan maintenance dan testing parsial.
3.  **Type Safety Frontend:** Penggunaan `any` pada wrapper API Tauri (`src/lib/api/tauri.ts`) menghilangkan manfaat TypeScript dan berisiko runtime error.
4.  **Startup Race Condition:** Penggunaan `Promise.all` pada `App.tsx` untuk memuat data kritis dapat menyebabkan aplikasi gagal total jika satu service (misal Thunderstore API) down.

**Timeline Estimasi Perbaikan:**
- Critical Fixes: 2-3 hari
- Refactoring & Architecture: 1-2 minggu

---

## 1. Keamanan & Bug Analysis

### Critical Issues
- **Missing Strict Path Validation:** Fungsi `scan_mods` dan `install_single_mod` di `src-tauri/src/commands/mod_operations.rs` memproses file berdasarkan input path. Meskipun `tauri-plugin-fs` memiliki scope protection, kode backend Rust yang menggunakan `std::fs` langsung (seperti `WalkDir` atau `File::create`) perlu memastikan path yang dibentuk dari `mod_id` tidak mengandung karakter traversal (`..`).
  - *Mitigasi:* Implementasi fungsi `sanitize_filename` sebelum join path.

### Medium Priority Issues
- **Zip Extraction Security:** Meskipun ada pengecekan `enclosed_name()` (bagus untuk mencegah Zip Slip), logika ekstraksi manual di `install_single_mod` masih cukup kompleks.
  - *Saran:* Pastikan semua error handling saat ekstraksi membersihkan file sampah yang mungkin terlanjur terekstrak sebagian.
- **Race Condition pada Startup:** `App.tsx` menggunakan `Promise.all` tanpa error handling granular per-request. Jika `modStore.loadMods()` gagal (misal API Thunderstore down), `settingsStore` mungkin juga dianggap gagal atau UI tidak merender apa-apa.

### Low Priority Issues
- **Symlink Privileges on Windows:** Fungsi `enable_mod` menggunakan symlink. Pada Windows, ini sering memerlukan Developer Mode atau Run as Admin.
  - *Saran:* Pastikan UI memberikan feedback jika operasi gagal karena permission denied.

---

## 2. Kualitas Kode & Refactoring

### Code Smells Identified
- **God Object (Frontend):** `src/stores/stores.ts` menggabungkan `ModStore`, `ProfileStore`, `SettingsStore`, dan `UIStore`. Ini melanggar *Single Responsibility Principle*.
- **Loss of Type Safety:** `src/lib/api/tauri.ts` menggunakan `any` untuk return type dan parameter (e.g., `invoke<any[]>`). Interface sebenarnya sudah ada di `stores.ts` tapi tidak di-share dengan baik.
- **Magic Strings:** String command Tauri (misal `"scan_mods"`, `"install_mod"`) tersebar di `tauri.ts` dan mock tests. Sebaiknya dijadikan konstanta.

### Refactoring Opportunities
- **Split Stores:** Pecah `src/stores/stores.ts` menjadi `src/stores/mods.ts`, `src/stores/profiles.ts`, dll.
- **Shared Types:** Pindahkan interface (`ModInfo`, `Profile`) ke `src/types/index.ts` (file ini belum ada) dan import di frontend maupun generate dari Rust menggunakan `ts-rs`.
- **Backend Command Unification:** Terdapat `install_mod` (recursive sequential) dan `install_mod_with_deps_parallel`. Sebaiknya logika disatukan agar maintainable.

### Style & Consistency Issues
- **Mixed Error Handling:** Beberapa command Rust mengembalikan `Result`, beberapa mungkin panic (unwrap pada `path.file_name()` di `scan_mods` baris 48 berisiko panic jika path berakhir dengan `..`).

---

## 3. Arsitektur & Performance

### Performance Bottlenecks
- **Synchronous File Scan:** `scan_mods` melakukan iterasi `fs::read_dir` dan `WalkDir` (untuk size) secara sinkron (walaupun di thread command). Untuk ribuan mod, kalkulasi size folder (`WalkDir`) bisa sangat lambat.
  - *Saran:* Cache ukuran folder di DB atau hitung secara *lazy*.
- **Frontend Startup:** Memuat semua data di awal (`App.tsx`).

### Scalability Concerns
- **Database Query:** Query di `mod_operations.rs` (misal insert) dilakukan satu per satu. Untuk bulk operations, sebaiknya gunakan transaksi (`conn.transaction()`).

### Architecture Improvements
- **Dependency Injection:** Frontend stores hardcode dependency ke `import("@lib/api/tauri")`. Ini menyulitkan testing tanpa mocking module global (seperti yang dilakukan di `stores.test.ts`).
- **Parallel Downloads:** Implementasi `install_mod_with_deps_parallel` sudah bagus (menggunakan `futures::stream`), ini harus menjadi standar untuk semua operasi network.

---

## 4. Developer Experience & Documentation

### API Design Issues
- **Inconsistent Naming:** Backend `install_mod` vs `install_mod_recursive_sequential`.
- **Missing Docs:** Tidak ada dokumentasi API (Swagger/OpenAPI style) untuk command Tauri. Developer baru harus membaca source code Rust untuk tahu parameter.

### Testing Gaps
- **Backend Tests:** Tidak ditemukan unit test atau integration test di folder `src-tauri/tests` atau inline test di `src-tauri/src/commands/*.rs` (kecuali komentar). Logika kritis seperti `verify_checksum` sebaiknya di-test.
- **Frontend Tests:** Ada test untuk store, tapi UI component testing masih minim.

### Documentation Quality
- **Type Definitions:** Kurangnya sentralisasi tipe mempersulit intellisense di IDE.

---

## Metrics Summary
- **Security:** 0 High Vulnerabilities (npm audit clean), 1 Potential Path Traversal Risk.
- **Quality:** Code Coverage (est) < 50% (Backend 0%, Frontend Store ~80%).
- **Performance:** Startup time bergantung IO disk. Bundle size optimal (Vite).
- **DX:** Setup mudah (npm/cargo standard), tapi testing backend kurang.
