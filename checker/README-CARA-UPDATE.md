# Cara Update Wallet Checker (Order of Bartholomew)

Halaman checker ini sengaja dibuat sesederhana mungkin: **satu-satunya file
yang perlu kamu ubah secara rutin adalah `eligible.json`.** Tidak perlu sentuh
HTML, CSS, atau JS sama sekali untuk update rutin.

## 1. Struktur file

```
bartholomewnft.github.io/          (repo GitHub Pages kamu)
├── index.html                     (situs utama, tidak diubah)
├── style.css                      (desain utama, dipakai ulang oleh checker)
├── assets/                        (logo & favicon, dipakai ulang oleh checker)
├── ui.js
├── script.js
└── checker/                       <-- FOLDER BARU, taruh di root repo
    ├── index.html                 (halaman checker)
    ├── style.css                  (import dari ../style.css, tinggal styling tambahan)
    ├── script.js                  (logic cek wallet)
    ├── eligible.json              <-- FILE YANG KAMU EDIT SETIAP UPDATE
    └── README-CARA-UPDATE.md      (file ini)
```

Cukup upload folder `checker/` ini ke root repo `bartholomewnft.github.io`
(sejajar dengan `index.html`, `style.css`, `assets/` yang sudah ada). Setelah
itu halaman otomatis aktif di:

**https://bartholomewnft.github.io/checker/**

## 2. Update daftar wallet yang eligible

1. Buka repo kamu di github.com → masuk ke folder `checker` → klik file `eligible.json`.
2. Klik ikon pensil (✏️ Edit this file) di kanan atas.
3. Tambahkan alamat wallet baru, masing-masing dalam tanda kutip `" "`,
   dipisahkan koma — **kecuali entri terakhir, tidak pakai koma**:

```json
[
  "0x0dae449b5dd1ea97a6b91a39295b513922c7feb3",
  "0xalamatwalletbarudisini",
  "0xalamatwalletlainnya"
]
```

4. Scroll ke bawah, klik **Commit changes** (langsung commit ke branch `main`).
5. Tunggu ± 30–60 detik, GitHub Pages otomatis rebuild. Refresh halaman
   `https://bartholomewnft.github.io/checker/` untuk lihat hasilnya.

**Catatan penting:**
- Huruf besar/kecil pada alamat wallet **tidak masalah** — sistem otomatis
  menyamakan ke huruf kecil saat mengecek, jadi cukup tempel alamatnya apa
  adanya.
- Pastikan format JSON tetap valid: setiap alamat diapit tanda kutip, dan
  ada koma di antara alamat (kecuali yang paling akhir). Kalau lupa koma,
  halaman checker akan gagal memuat data.
- Kalau mau kosongkan daftar (misal sebelum musim whitelist baru dimulai),
  cukup jadikan `[]` (array kosong).
- Angka "wallet inscribed" di bawah tombol checker otomatis mengikuti
  jumlah alamat di file ini — tidak perlu diedit manual.

## 3. (Opsional) Tambah link "Wallet Checker" di menu situs utama

Kalau kamu ingin ada tombol/menu di `index.html` utama yang mengarah ke
halaman checker ini, tambahkan satu baris ini di dalam `<nav class="primary-nav">`
pada `index.html` utama, misalnya sebelum tombol "Join the Order":

```html
<a href="/checker/">Wallet Checker</a>
```

Ini opsional — halaman checker tetap berfungsi penuh walau tidak ditautkan
dari menu, karena bisa diakses langsung lewat alamat
`https://bartholomewnft.github.io/checker/`.
