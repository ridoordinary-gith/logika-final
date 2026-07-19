# LOGIKA POS — Kopi Masuk Logika

Sistem kasir, stok, laporan penjualan & monitor profit untuk coffeeshop Logika.

## Fitur
- **Kasir**: pilih menu, nama pemesan, metode bayar (Cash/QRIS/Transfer), stok otomatis berkurang
- **Stok**: monitoring stok per item, alert stok menipis, restock cepat
- **Laporan**: omzet, HPP, laba kotor, pengeluaran, laba bersih; filter Hari Ini / 7 Hari / 30 Hari / rentang tanggal custom; profit per menu; export CSV
- **Profit**: HPP per menu, fix cost bulanan, monitor BEP bulan berjalan dengan progress bar & estimasi

## Teknis
- Single file `index.html` — vanilla HTML/CSS/JS, tanpa build step
- Data tersimpan di `localStorage` browser (per perangkat)

## Deploy
Bisa langsung di-hosting di Vercel, Netlify, atau GitHub Pages tanpa konfigurasi.

## Backup ke Google Sheets (opsional)
1. Buat Spreadsheet baru → Extensions → Apps Script
2. Paste isi file `google-apps-script.gs` → Deploy → New deployment → Web app (Execute as: Me, Access: Anyone)
3. Copy Web app URL → buka aplikasi → klik ikon ☁︎ → paste URL → Simpan
4. Data offline otomatis antri (ada badge merah di ikon ☁︎) dan terkirim saat online
