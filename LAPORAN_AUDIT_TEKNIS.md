# Laporan Audit Teknis - Deftheim

## Ringkasan Eksekutif
Audit menyeluruh telah dilakukan pada basis kode Deftheim (v2.0.0). Proyek ini menunjukkan fondasi yang baik dengan penggunaan teknologi modern (Tauri 2, SolidJS, Rust), namun ditemukan kerentanan keamanan kritis yang memerlukan perhatian segera sebelum rilis produksi.

- **Temuan Paling Kritis:**
  1. **Keamanan Konfigurasi Tauri (Critical):** Izin sistem file tidak terbatas (`fs: ["**"]`) dan CSP tidak aktif (`null`), membuka celah eksploitasi penuh jika terjadi injeksi skrip.
  2. **Path Traversal (Critical):** Logika instalasi mod di backend (`mod_operations.rs`) tidak memvalidasi `mod_id`, memungkinkan penulisan/penghapusan file di luar direktori yang diizinkan.
  3. **Blocking I/O (High):** Operasi file sinkron (`std::fs`) digunakan di dalam `async fn` tanpa `spawn_blocking`, yang berpotensi memblokir runtime Tauri dan menyebabkan UI freeze.

- **Skor Kesehatan Keseluruhan:**
  - **Keamanan:** 4/10 (Perlu perbaikan segera)
  - **Kualitas Kode:** 7/10 (Solid, tapi perlu refactoring "God Object")
  - **Arsitektur:** 7/10 (Modern, terstruktur, ada technical debt di state management)
  - **Developer Experience:** 8/10 (Dokumentasi baik, tooling standar)

- **Timeline Estimasi Fix:** 3-5 hari untuk critical fixes.

---

## 1. Keamanan & Bug Analysis

### Critical Issues
1.  **Unrestricted File System Scope (`tauri.conf.json`)**
    -   **Impact:** Aplikasi memiliki akses baca/tulis ke seluruh sistem file pengguna. Jika kode frontend dikompromikan (misal via XSS di deskripsi mod), penyerang dapat mencuri atau menghapus file apa pun di sistem.
    -   **Lokasi:** `plugins.fs.scope: ["**"]`
    -   **Rekomendasi:** Batasi scope hanya ke direktori `$APPDATA`, `$GAMEDIR`, dan direktori mod repository yang spesifik.

2.  **Missing Content Security Policy (CSP)**
    -   **Impact:** Tidak ada perlindungan terhadap XSS. `security.csp: null` mengizinkan pemuatan skrip eksternal, inline styles, dan koneksi jaringan ke mana saja.
    -   **Lokasi:** `tauri.conf.json`
    -   **Rekomendasi:** Implementasikan CSP ketat, misal: `default-src 'self'; img-src 'self' https://cdn.thunderstore.io asset:; connect-src 'self' https://thunderstore.io;`.

3.  **Path Traversal Vulnerability**
    -   **Impact:** `mod_id` digunakan langsung dalam konstruksi path (`Path::new(repo).join(mod_id)`). Jika penyerang menyisipkan payload `../../system32` sebagai ID mod (misal via API response palsu atau input manual), aplikasi akan menulis ke direktori sistem.
    -   **Lokasi:** `src-tauri/src/commands/mod_operations.rs` (`install_single_mod`, `enable_mod`)
    -   **Rekomendasi:** Validasi `mod_id` dengan regex (hanya alfanumerik + `_` + `-`) sebelum digunakan dalam operasi file.

### Medium Priority Issues
1.  **Frontend-Driven Repository Path**
    -   **Impact:** Backend mempercayai `repository_path` yang dikirim dari frontend. Frontend yang dikompromikan dapat mengarahkan operasi file ke lokasi sensitif.
    -   **Rekomendasi:** Simpan path konfigurasi di sisi backend (state/database) dan jangan menerimanya sebagai parameter perintah dari frontend.

### Low Priority Issues
1.  **Zip Extraction Logic**
    -   Meski `zip` crate digunakan dengan `file.enclosed_name()` (mitigasi Zip Slip), penanganan ekstraksi manual agak rentan kesalahan. Disarankan menggunakan library ekstraksi yang lebih high-level atau audit ulang loop ekstraksi.

---

## 2. Kualitas Kode & Refactoring

### Code Smells Identified
1.  **"God Object" State Management (`src/stores/stores.ts`)**
    -   File tunggal 300+ baris mengelola 3 domain berbeda (Mod, Profile, Settings) beserta definisi tipe. Ini melanggar *Single Responsibility Principle*.
    -   Mengubah satu bagian store berisiko memecah bagian lain karena coupling di satu file.

2.  **Duplikasi Logika Loading/Error**
    -   Setiap store (`modStore`, `profileStore`, `settingsStore`) mengulang pola `loading`, `error`, `setLoading`, `setError`.
    -   **Rekomendasi:** Buat *Higher Order Store* atau *composable* `createResourceStore` untuk menangani state async standar.

### Refactoring Opportunities
1.  **Split Stores:**
    -   `src/stores/mod.store.ts`
    -   `src/stores/profile.store.ts`
    -   `src/stores/settings.store.ts`
    -   `src/lib/types/index.ts` (Pindahkan semua interface ke sini)

2.  **Backend Mod Operations:**
    -   `mod_operations.rs` mencampur logika database (`update_db_from_manifest`) dengan logika file system.
    -   Ekstrak logika DB ke `src-tauri/src/services/mod_service.rs` atau `db/mod.rs`.

### Style & Consistency Issues
1.  **Rust Blocking I/O:**
    -   Penggunaan `std::fs` di dalam fungsi `async` (seperti `install_single_mod`) akan memblokir thread worker Tokio. Ini buruk untuk performa aplikasi GUI.
    -   **Rekomendasi:** Gunakan `tokio::fs` atau bungkus operasi blocking dengan `tauri::async_runtime::spawn_blocking`.

---

## 3. Arsitektur & Performance

### Performance Bottlenecks
1.  **UI Blocking pada Heavy IO:**
    -   Operasi scan mod atau install mod yang menggunakan `std::fs` secara sinkron akan membuat UI terasa "berat" atau laggy karena thread backend sibuk.

2.  **State Monolith:**
    -   Memuat seluruh daftar mod ke dalam memori frontend (objek raksasa di `stores.ts`) bisa menjadi masalah performa jika jumlah mod mencapai ribuan.
    -   **Rekomendasi:** Implementasikan virtualisasi di UI (sudah direncanakan/ada) dan pagination di sisi data store.

### Scalability Concerns
1.  **Database Queries:**
    -   Query seperti `get_dependencies_from_db` dilakukan dalam loop (N+1 query problem) saat instalasi rekursif.
    -   **Rekomendasi:** Batch query atau optimalkan join SQL.

### Architecture Improvements
1.  **Repository Management:**
    -   Pindahkan *Source of Truth* konfigurasi path dari frontend ke backend. Frontend hanya meminta "aksi", backend tahu "di mana" aksi itu dilakukan berdasarkan setting yang tersimpan aman.

---

## 4. Developer Experience & Documentation

### API Design Issues
1.  **Untyped IPC Bridge:**
    -   Interaksi frontend-backend (`tauriCommands` di test, likely `invoke` calls) seringkali tidak memiliki type safety yang ketat di runtime.
    -   **Rekomendasi:** Gunakan `tauri-specta` atau `ts-rs` secara menyeluruh untuk men-generate TypeScript types langsung dari Rust structs (sudah terlihat ada `#[derive(TS)]`, perlu dipastikan pipeline generasinya otomatis).

### Testing Gaps
1.  **Missing Backend Tests:**
    -   Direktori `src-tauri/tests` belum dimanfaatkan maksimal. Logika kritis seperti instalasi mod dan parsing manifest belum memiliki unit test otomatis.
    -   **Risiko:** Regresi mudah terjadi saat refactoring backend.

### Documentation Quality
1.  **Good Coverage:**
    -   `README.md` jelas dan informatif.
    -   `docs/DEVELOPMENT.md` tersedia.
    -   **Improvement:** Tambahkan dokumentasi arsitektur (diagram alur data) untuk menjelaskan hubungan Frontend <-> Rust <-> DB <-> Filesystem.

---

## Metrics Summary
- **Security:** 2 Critical Vulnerabilities (FS Scope, CSP), 1 Critical Logic Flaw (Path Traversal).
- **Quality:** 0 npm vulnerabilities. Codebase bersih tapi perlu modularisasi store.
- **Performance:** Potensi blocking thread pada operasi file besar.
- **DX:** Setup mudah, dokumentasi ada, testing backend perlu ditingkatkan.
