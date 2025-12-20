# Laporan Audit Teknis - Deftheim v2.0.0

## Ringkasan Eksekutif

Audit ini menemukan fondasi proyek yang kuat dalam penggunaan teknologi modern (Tauri v2, Rust, SolidJS), namun mengidentifikasi beberapa kerentanan keamanan kritis yang perlu segera ditangani sebelum rilis produksi.

- **Status Keamanan**: 🚨 **KRITIS**. Ditemukan celah Path Traversal dan Arbitrary File Write yang memungkinkan penyerang mengambil alih sistem pengguna jika dikombinasikan dengan serangan XSS atau input berbahaya.
- **Kualitas Kode**: ⚠️ **PERLU PERBAIKAN**. Frontend kehilangan manfaat TypeScript karena penggunaan `any` yang berlebihan. Backend memiliki operasi I/O sinkron yang berpotensi memblokir performa.
- **Arsitektur**: ✅ **BAIK**. Struktur database dan pemisahan frontend-backend sudah solid. Penggunaan SQLite dan `rusqlite` adalah keputusan tepat.

### Skor Kesehatan (1-10)
- **Keamanan**: 3/10 (Critical vulnerability found)
- **Kualitas Kode**: 6/10 (Mixed quality)
- **Arsitektur**: 8/10 (Solid foundation)
- **DX & Dokumentasi**: 6/10 (Basic docs, tests missing)

### Timeline Perbaikan Kritis
Estimasi waktu untuk menutup celah keamanan prioritas utama adalah **1-2 hari kerja**.

---

## 1. Keamanan & Bug Analysis

### Critical Issues (🚨 SEGERA PERBAIKI)

1.  **Path Traversal pada Mod Operations (`src-tauri/src/commands/mod_operations.rs`)**
    -   **Deskripsi**: Fungsi seperti `install_mod`, `uninstall_mod`, dan `scan_mods` menggunakan parameter `mod_id` langsung untuk menyusun path file: `Path::new(repository_path).join(mod_id)`.
    -   **Dampak**: Jika `mod_id` berisi `../../`, penyerang dapat mengakses atau memanipulasi file di luar direktori repositori (misalnya system files).
    -   **Rekomendasi**: Validasi `mod_id` untuk memastikan hanya berisi karakter alfanumerik atau sanitasi input menggunakan `Path::file_name()` sebelum digabungkan.

2.  **Arbitrary File Write / Download (`src-tauri/src/commands/mod_operations.rs`)**
    -   **Deskripsi**: `install_mod` menerima parameter `url` dari frontend dan mengunduh kontennya ke disk tanpa validasi domain.
    -   **Dampak**: Frontend yang terkompromi (XSS) dapat memaksa aplikasi mengunduh malware ke komputer pengguna.
    -   **Rekomendasi**: Validasi domain URL terhadap *whitelist* (misalnya hanya `thunderstore.io`) di sisi backend.

3.  **Konfigurasi Keamanan Tauri yang Permisif (`src-tauri/tauri.conf.json`)**
    -   **Deskripsi**:
        -   `app.security.csp` diset ke `null`.
        -   Plugin `fs` memiliki scope `["**"]` yang mengizinkan akses ke SELURUH file sistem.
    -   **Dampak**: XSS pada frontend memiliki akses penuh ke sistem file pengguna (RCE potential).
    -   **Rekomendasi**:
        -   Set CSP yang ketat (`default-src 'self'; ...`).
        -   Batasi scope `fs` hanya ke `$APP/*` dan direktori game Valheim yang spesifik.

### Medium Priority Issues

4.  **Sync I/O pada `scan_mods`**
    -   **Deskripsi**: `scan_mods` melakukan iterasi `fs::read_dir` dan membaca `manifest.json` secara sinkron untuk setiap mod.
    -   **Dampak**: UI dapat terasa lambat atau *hang* saat memuat repositori mod yang besar.
    -   **Rekomendasi**: Gunakan `tokio::fs` atau jalankan operasi ini di thread terpisah (`spawn_blocking`) dan optimalkan dengan caching database.

### Low Priority Issues

5.  **Hardcoded Fallback untuk Windows Symlinks**
    -   **Deskripsi**: `enable_mod` menggunakan hardlink (`link_dir_contents`) jika symlink gagal. Ini sulit dibersihkan secara atomik dibandingkan symlink.

---

## 2. Kualitas Kode & Refactoring

### Code Smells Identified

1.  **TypeScript "Any" Pollution (`src/lib/api/tauri.ts`)**
    -   Hampir semua fungsi API menggunakan `any` (contoh: `invoke<any[]>`).
    -   **Masalah**: Menghilangkan manfaat *type safety*. Perubahan struktur data di Rust tidak akan terdeteksi di Frontend sampai *runtime error*.
    -   **Saran**: Gunakan *shared types* (misalnya generate dari Rust structs menggunakan `ts-rs` atau definisikan interface secara manual).

2.  **Logic Duplication di Backend**
    -   `install_mod` (sequential) dan `install_mod_with_deps_parallel` memiliki logika instalasi inti yang serupa namun terpisah.
    -   **Saran**: Refactor logika ekstraksi ZIP dan update DB ke dalam fungsi helper `install_package_internal` yang digunakan kedua command.

3.  **Frontend Store Complexity**
    -   `profileStore.setActiveProfile` melakukan iterasi O(N) untuk menonaktifkan profile lain.
    -   **Saran**: Simpan hanya `activeProfileId` string di state, dan gunakan *derived state* (getter) untuk menentukan status aktif item.

### Style & Consistency Issues

-   **Backend**: Error handling menggunakan `unwrap` di beberapa tempat (contoh: `path.file_name().unwrap()`). Sebaiknya gunakan `?` atau handle `None` secara eksplisit untuk mencegah *panic*.
-   **Frontend**: Definisi tipe interface bercampur dengan logika store di `stores.ts`. Sebaiknya dipisah ke `src/types/`.

---

## 3. Arsitektur & Performance

### Performance Bottlenecks

1.  **Mod Scanning (`scan_mods`)**
    -   Saat ini memindai disk setiap kali dipanggil.
    -   **Solusi**: Gunakan database sebagai *source of truth*. Lakukan sinkronisasi disk-ke-DB hanya saat startup atau diminta user (Re-scan), bukan setiap kali membuka halaman mod.

### Architecture Improvements

1.  **State Management - API Layer Decoupling**
    -   Store saat ini mengimpor `tauriCommands` secara langsung. Ini membuat unit testing store sulit tanpa mocking global Tauri.
    -   **Saran**: Gunakan pola *Dependency Injection* atau *Repository Pattern* untuk membungkus panggilan API, sehingga store bisa dites dengan mock service.

2.  **Modularisasi Backend**
    -   `mod_operations.rs` mulai menjadi "God Module" yang menangani parsing manifest, download file, database insert, dan file system operations.
    -   **Saran**: Pisahkan logic:
        -   `services/installer.rs`: Logika download & ekstrak.
        -   `services/scanner.rs`: Logika scan disk.
        -   `commands/mod_operations.rs`: Hanya sebagai *controller* yang memanggil services.

---

## 4. Developer Experience & Documentation

### API Design Issues

-   Parameter `install_mod` yang menerima `url` mentah agak tidak biasa untuk command "install by ID". Sebaiknya command hanya menerima `mod_id`, dan backend yang mencari URL dari database Thunderstore yang sudah di-cache.

### Testing Gaps

-   **Backend**: Tidak ditemukan unit test untuk logic Rust (`#[test]`). Logika parsing manifest dan kalkulasi path sangat butuh unit test.
-   **Frontend**: Test `stores.test.ts` perlu diperbarui untuk mencakup *edge cases* error handling.

### Documentation Quality

-   `README.md` ada tetapi perlu dilengkapi dengan diagram arsitektur.
-   Komentar kode di Rust cukup membantu, namun dokumentasi fungsi publik (doc comments `///`) bisa ditingkatkan.

---

## Metrics Summary

-   **Security**: 2 Critical Vulnerabilities (Path Traversal, Arbitrary File Write), 2 High Risks (CSP, FS Scope).
-   **Quality**: ~40% effective Type Safety (karena penggunaan `any`).
-   **Performance**: Potensi blocking I/O pada list mod > 100 item.
-   **DX**: Testing coverage backend 0%.
