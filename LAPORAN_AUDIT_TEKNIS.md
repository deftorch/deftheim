# Laporan Audit Teknis - Deftheim

## Ringkasan Eksekutif
Proyek **Deftheim** (v2.0.0) memiliki fondasi teknologi yang modern dengan stack SolidJS dan Tauri v2 (Rust). Secara umum, struktur proyek bersih dan mengikuti praktik modern. Namun, audit ini menemukan **celah keamanan kritis** dalam konfigurasi Tauri yang harus segera ditangani sebelum rilis produksi. Selain itu, terdapat peluang signifikan untuk meningkatkan kualitas kode (refactoring "God Object") dan performa backend (blocking I/O).

### Temuan Paling Kritis
1.  **[SECURITY] Izin File System Tidak Terbatas:** Scope `fs` pada `tauri.conf.json` diatur ke `["**"]`, memberikan aplikasi akses baca/tulis ke seluruh disk pengguna. Ini adalah risiko keamanan tingkat tinggi.
2.  **[SECURITY] Content Security Policy (CSP) Absen:** Konfigurasi `csp` bernilai `null`, membuka potensi serangan XSS.
3.  **[PERFORMANCE] Blocking I/O pada Async Runtime:** Fungsi `scan_mods` menggunakan `std::fs` (blocking) di dalam fungsi `async` tanpa `spawn_blocking`, yang dapat memblokir thread runtime Tokio dan membekukan UI saat memuat banyak mod.
4.  **[QUALITY] "God Object" State Management:** `src/stores/stores.ts` menggabungkan semua logika bisnis, tipe data, dan UI state, membuatnya sulit dipelihara dan diuji.

### Health Score
- **Security:** 4/10 (Risiko Kritis Terdeteksi)
- **Code Quality:** 6/10 (Perlu Refactoring Struktur)
- **Architecture:** 7/10 (Stack Modern, namun ada implementasi yang perlu diperbaiki)
- **Developer Experience:** 6/10 (Dokumentasi baik, namun kurang testing di backend)

### Timeline Estimasi Fix
- **Critical Fixes:** 2-3 Hari
- **Refactoring & Stabilization:** 1-2 Minggu

---

## 1. Keamanan & Bug Analysis

### Critical Issues
*   **Tauri Allowlist Scope (`fs: ["**"]`):** Konfigurasi ini melanggar prinsip *Least Privilege*. Jika aplikasi dikompromikan (misal via XSS dari deskripsi mod jahat), penyerang memiliki akses penuh ke sistem file pengguna.
    *   *Rekomendasi:* Batasi scope ke `$APPDATA/deftheim/*` dan direktori instalasi Valheim saja.
*   **Missing CSP:** `security: { csp: null }` di `tauri.conf.json`.
    *   *Rekomendasi:* Terapkan CSP ketat, misal: `default-src 'self'; img-src 'self' https://cdn.thunderstore.io asset:; connect-src 'self' https://thunderstore.io;`.
*   **Path Traversal Risk:** Pada `src-tauri/src/commands/mod_operations.rs`, variabel `mod_id` digunakan langsung dalam konstruksi path (misal `Path::new(repository_path).join(mod_id)`). Meskipun `zip` extraction aman, operasi file lain (enable/disable) mungkin rentan jika `mod_id` dimanipulasi (berisi `../`).
    *   *Rekomendasi:* Sanitasi `mod_id` sebelum digunakan untuk path joining.

### Medium Priority Issues
*   **Unhandled Startup Errors:** Di `App.tsx`, `Promise.all` digunakan untuk memuat settings, mods, dan profiles. Jika satu gagal (misal file corrupt), aplikasi mungkin gagal memuat sepenuhnya tanpa feedback yang jelas ke user.
    *   *Rekomendasi:* Gunakan `Promise.allSettled` atau wrap individual calls dengan error handling yang menampilkan UI Fallback.

## 2. Kualitas Kode & Refactoring

### Code Smells Identified
*   **God Object (`src/stores/stores.ts`):** File ini memiliki tanggung jawab ganda: definisi Tipe Global (`ModInfo`, `Profile`), Logika Store (`modStore`, `profileStore`, `settingsStore`), dan UI State. Ini melanggar *Single Responsibility Principle*.
*   **Blocking I/O in Async (`mod_operations.rs`):** Penggunaan `std::fs::read_dir` dan `fs::read_to_string` di dalam fungsi `async fn scan_mods`. Dalam Rust/Tokio, operasi blocking file system harus menggunakan `tokio::fs` atau dijalankan di dalam `task::spawn_blocking` agar tidak memblokir thread executor.

### Refactoring Opportunities
*   **Pecah Store:** Refactor `stores.ts` menjadi:
    *   `src/stores/modStore.ts`
    *   `src/stores/profileStore.ts`
    *   `src/stores/settingsStore.ts`
    *   `src/types/index.ts` (Shared Types)
*   **Abstraction Layer:** Penggunaan `import("@lib/api/tauri")` secara dinamis di dalam method store agak tidak konvensional. Sebaiknya inject dependency atau import statis jika memungkinkan untuk type safety yang lebih baik.

## 3. Arsitektur & Performance

### Performance Bottlenecks
*   **Sync Mod Scanning:** `scan_mods` membaca `manifest.json` satu per satu secara sekuensial dan sinkron. Untuk ratusan mod, ini akan lambat.
    *   *Solusi:* Gunakan `WalkDir` dengan iterator parallel (misal `rayon` jika CPU bound, atau `tokio` async tasks jika I/O bound) untuk scanning.
*   **Bundle Size:** Penggunaan library UI penuh mungkin perlu dievaluasi, namun saat ini belum menjadi isu kritis mengingat ini adalah aplikasi desktop (Tauri) dimana aset diload lokal.

### Architecture Improvements
*   **Database Layer:** Penggunaan SQLite sudah tepat. Pastikan index ditambahkan pada kolom yang sering di-query (seperti `mod_id`).
*   **Error Handling:** Implementasi `AppError` di Rust sudah baik, namun perlu dipastikan semua error propagate ke Frontend dengan pesan yang user-friendly.

## 4. Developer Experience & Documentation

### Testing Gaps
*   **Backend Testing:** Direktori `src-tauri/tests` tampaknya kosong atau minimal. Logika kritis seperti instalasi mod dan manipulasi file tidak memiliki unit test otomatis.
*   **Frontend Testing:** `src/stores/stores.test.ts` ada, namun perlu dipastikan mencakup edge cases (network failure, corrupt data).

### Documentation Quality
*   **CONTRIBUTING.md:** File ini direferensikan di README tetapi tidak ditemukan di root directory (berdasarkan `list_files`). Ini menyulitkan kontributor baru.
*   **README:** Cukup jelas dan informatif.

## Metrics Summary
- **Security:** 2 Vulnerabilities Critical (Scope FS, CSP)
- **Quality:** 1 Major Code Smell (God Object)
- **Performance:** Potential UI Freeze pada `scan_mods`
- **DX:** Missing Backend Tests, Missing CONTRIBUTING.md
