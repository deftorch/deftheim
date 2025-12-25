# Laporan Audit Teknis - Deftheim v2.0.0

## Ringkasan Eksekutif

Deftheim v2.0.0 menunjukkan fondasi yang kuat dengan stack teknologi modern (Tauri v2, Rust, SolidJS, SQLite). Namun, audit ini menemukan **celah keamanan kritis** yang harus segera ditangani sebelum rilis produksi, terutama terkait konfigurasi Tauri dan validasi input di sisi backend.

Secara arsitektur, aplikasi ini fungsional tetapi memiliki beberapa utang teknis ("God Object" di frontend) dan masalah performa potensial (blocking I/O di async Rust) yang perlu direfaktor untuk skalabilitas jangka panjang.

- [ ] **3-5 Temuan Paling Kritis:**
    1.  [SECURITY] Unrestricted File System Access (`fs: ["**"]` + No CSP).
    2.  [SECURITY] Path Traversal di `mod_operations.rs`.
    3.  [QUALITY] "God Object" State Pattern.
- [ ] **Overall Health Score:**
    -   **Security:** 3/10 (Kritis)
    -   **Code Quality:** 6/10 (Cukup)
    -   **Architecture:** 7/10 (Baik)
    -   **DX & Docs:** 7/10 (Baik)
- [ ] **Timeline estimasi untuk critical fixes:** 3 Hari (Prioritas 1 selesai).

---

## 1. Keamanan & Bug Analysis

### Critical Issues (Priority 1)
-   **Unrestricted FS Scope:** Konfigurasi `plugins.fs.scope: ["**"]` di `tauri.conf.json` memberikan aplikasi (dan potensi kode berbahaya via XSS) akses penuh ke file system pengguna.
    -   *Rekomendasi:* Batasi scope hanya ke `$APPCONFIG`, `$APPDATA`, dan direktori game Valheim yang spesifik.
-   **Missing CSP:** `app.security.csp: null` membuat aplikasi rentan terhadap serangan XSS jika konten eksternal dimuat.
    -   *Rekomendasi:* Implementasikan CSP ketat, misal: `default-src 'self'; img-src 'self' https://cdn.thunderstore.io; connect-src 'self' https://thunderstore.io`.
-   **Path Traversal di `mod_operations.rs`:**
    ```rust
    // Vulnerable Code
    pub async fn uninstall_mod(repository_path: String, mod_id: String) -> Result<()> {
        let target_dir = Path::new(&repository_path).join(&mod_id); // mod_id bisa berisi "../"
        fs::remove_dir_all(target_dir)?;
        // ...
    }
    ```
    -   *Impact:* Penyerang bisa mengirim `mod_id` = `../../Windows/System32` (secara teoritis) untuk menghapus file sistem.
    -   *Rekomendasi:* Sanitasi `mod_id` untuk hanya mengizinkan karakter alfanumerik, titik, strip, dan underscore.

### Medium Priority Issues
-   **Unvalidated Input:** `repository_path` diterima mentah-mentah dari frontend di banyak command.
    -   *Rekomendasi:* Validasi bahwa path tersebut memang mengarah ke direktori yang diizinkan atau dikonfigurasi di backend, bukan sembarang path dari user input.

---

## 2. Kualitas Kode & Refactoring

### Code Smells Identified
-   **God Object (`src/stores/stores.ts`):** File ini mencampur definisi tipe, logika fetching API, manajemen state UI, dan business logic untuk 4 domain berbeda (Mods, Profile, Settings, UI).
    -   *Lines:* ~300+ baris (masih manageable tapi akan membengkak cepat).
    -   *Risiko:* Merge conflict tinggi, testing sulit karena dependency yang erat.
-   **Unwrap Usage in Rust:** Penggunaan `.unwrap()` pada `path.file_name().unwrap()` di `scan_mods` bisa menyebabkan *panic* jika path tidak valid (misal root path).
-   **Duplikasi Logika Install:** Terdapat `install_mod` (rekursif lama), `install_single_mod`, dan `install_mod_with_deps_parallel`. Logika installasi inti sebaiknya disatukan.

### Refactoring Opportunities
-   **Split Stores:** Pecah `src/stores/stores.ts` menjadi:
    -   `src/stores/mod.store.ts`
    -   `src/stores/profile.store.ts`
    -   `src/stores/settings.store.ts`
    -   `src/stores/ui.store.ts`
    -   `src/types/index.ts` (Shared types)
-   **Rust Error Handling:** Ganti semua `.unwrap()` dengan proper error handling (`?` operator atau `match`) dan konversi ke `AppError`.

---

## 3. Arsitektur & Performance

### Performance Bottlenecks
-   **Blocking Async Runtime:**
    Di `mod_operations.rs`, operasi berat seperti `zip::ZipArchive` dan `fs::copy` dijalankan langsung di thread async.
    -   *Impact:* Jika file mod besar (misal 100MB+), UI bisa freeze atau request lain (seperti cancel download) terhambat.
    -   *Solusi:* Bungkus operasi blocking dengan `tauri::async_runtime::spawn_blocking`.
-   **Sequential Scanning:** `scan_mods` melakukan iterasi `fs::read_dir` dan parsing JSON satu per satu. Untuk ribuan mod, ini akan lambat.
    -   *Solusi:* Gunakan `Rayon` (paralel iterator) untuk scanning direktori jika jumlah mod sangat banyak.

### Scalability Concerns
-   **Database Locking:** Penggunaan `Arc<Mutex<Connection>>` berarti akses database sepenuhnya serial. Jika fitur bertambah (background sync + user interaction), ini bisa jadi bottleneck.
    -   *Rekomendasi:* Pertimbangkan connection pooling (`r2d2_sqlite`) atau mode WAL di SQLite untuk concurrency yang lebih baik.

---

## 4. Developer Experience & Documentation

### Documentation Quality
-   **README:** Cukup lengkap dan informatif.
-   **API Docs:** Kurang dokumentasi untuk Rust Commands. Developer frontend harus membaca kode Rust untuk tahu parameter.
    -   *Rekomendasi:* Gunakan `specta` atau komentar dokumentasi yang men-generate TS types otomatis (sudah ada `ts-rs` tapi perlu dipastikan sync).

### Testing Gaps
-   **Backend Tests:** Minim/Tidak ada unit test untuk fungsi logika bisnis di Rust (seperti parsing manifest, path logic).
-   **Frontend Tests:** Ada setup `vitest`, tapi coverage perlu dicek (dari memori: ada test failure di `stores.test.ts`).

## Metrics Summary
-   **Security:** 2 Critical Vulnerabilities (FS Scope, Path Traversal)
-   **Quality:** 1 Major Code Smell (God Object Store)
-   **Performance:** Blocking I/O di Async Path
-   **DX:** Testing coverage rendah untuk Backend
