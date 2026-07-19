# LOGIKA POS — Kopi Masuk Logika

Sistem kasir, stok, laporan penjualan & monitor profit untuk coffeeshop Logika.

## Fitur
- Kasir: menu, nama pemesan, Cash/QRIS/Transfer, stok otomatis berkurang
- Stok: monitoring per item, alert stok menipis, restock cepat
- Laporan: omzet, HPP, laba kotor, pengeluaran, laba bersih; filter periode + rentang tanggal custom; profit per menu; export CSV
- Profit: HPP per menu, fix cost bulanan, monitor BEP bulan berjalan
- Backup & data master (HPP, fix cost) tersinkron via Google Sheets (Apps Script)

## Backup ke Google Sheets
1. Buat Spreadsheet → Extensions → Apps Script → paste `google-apps-script.gs`
2. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone) → copy URL
3. Di aplikasi: ikon ☁︎ → paste URL → Simpan
4. HP dengan data HPP terlengkap: tekan "⇧ Kirim data master". HP lain: "⟳ Tarik data terbaru"
5. Update kode berikutnya: Manage deployments → Edit → New version

## Deploy
Static single file `index.html` — langsung jalan di Vercel/Netlify/GitHub Pages.
