/**
 * LOGIKA POS — Penerima data ke Google Spreadsheet
 * ------------------------------------------------
 * CARA SETUP (sekali saja, ±5 menit):
 * 1. Buat Google Spreadsheet baru, beri nama misal "Data Logika POS"
 * 2. Menu: Extensions → Apps Script
 * 3. Hapus semua kode, paste seluruh file ini, lalu Save
 * 4. Klik Deploy → New deployment → pilih type "Web app"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik Deploy → izinkan akses (Authorize) → copy "Web app URL"
 * 6. Buka aplikasi LOGIKA POS → klik ikon awan ☁︎ di pojok atas →
 *    paste URL tadi → Simpan
 *
 * Selesai. Setiap transaksi & pengeluaran otomatis masuk ke sheet:
 * - "Penjualan"   : 1 baris per item terjual (lengkap HPP & profit)
 * - "Pengeluaran" : 1 baris per pengeluaran
 * - "Log Hapus"   : catatan kalau ada transaksi/pengeluaran dihapus
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.type === 'tx') {
      var sh = getSheet(ss, 'Penjualan', [
        'ID Transaksi','Tanggal','Waktu','Nama Pemesan','Metode Bayar',
        'Item','Kategori','Qty','Harga','HPP/pcs','Subtotal','Profit Item','Total Transaksi'
      ]);
      var t = payload.data;
      var d = new Date(t.ts);
      t.items.forEach(function(i){
        var hpp = i.hpp || 0;
        sh.appendRow([
          t.id,
          Utilities.formatDate(d, 'Asia/Jakarta', 'dd/MM/yyyy'),
          Utilities.formatDate(d, 'Asia/Jakarta', 'HH:mm:ss'),
          t.cust || '-',
          t.pay,
          i.name, i.cat, i.qty, i.price, hpp,
          i.qty * i.price,
          i.qty * (i.price - hpp),
          t.total
        ]);
      });
      // salinan JSON untuk sinkronisasi antar perangkat
      var shTx = getSheet(ss, 'DataTx', ['ID', 'ts', 'JSON']);
      shTx.appendRow([t.id, t.ts, JSON.stringify(t)]);

    } else if (payload.type === 'exp') {
      var sh2 = getSheet(ss, 'Pengeluaran', ['ID','Tanggal','Waktu','Keterangan','Nominal']);
      var x = payload.data;
      var d2 = new Date(x.ts);
      sh2.appendRow([
        x.id,
        Utilities.formatDate(d2, 'Asia/Jakarta', 'dd/MM/yyyy'),
        Utilities.formatDate(d2, 'Asia/Jakarta', 'HH:mm:ss'),
        x.name, x.amount
      ]);
      var shEx = getSheet(ss, 'DataExp', ['ID', 'ts', 'JSON']);
      shEx.appendRow([x.id, x.ts, JSON.stringify(x)]);

    } else if (payload.type === 'master') {
      // Data master (HPP & fix cost) — satu sumber untuk semua perangkat
      var sh4 = getSheet(ss, 'Master', ['Data JSON', 'Terakhir Update']);
      sh4.getRange(2, 1).setValue(JSON.stringify(payload.data));
      sh4.getRange(2, 2).setValue(
        Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss')
      );

    } else if (payload.type === 'hapus_tx' || payload.type === 'hapus_exp') {
      var sh3 = getSheet(ss, 'Log Hapus', ['Waktu','Jenis','ID yang Dihapus']);
      sh3.appendRow([
        Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss'),
        payload.type === 'hapus_tx' ? 'Transaksi' : 'Pengeluaran',
        payload.data.id
      ]);
    }

    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERROR: ' + err);
  }
}

/**
 * doGet: dipanggil aplikasi saat dibuka / tombol "Tarik data terbaru".
 * Mengembalikan data master (HPP & fix cost) terakhir.
 */
function doGet(e) {
  var out = { master: null, tx: [], exp: [], del: { tx: [], exp: [] } };
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var shM = ss.getSheetByName('Master');
    if (shM) {
      var raw = shM.getRange(2, 1).getValue();
      if (raw) out.master = JSON.parse(raw);
    }

    out.tx  = readJsonSheet(ss, 'DataTx');
    out.exp = readJsonSheet(ss, 'DataExp');

    // daftar ID yang pernah dihapus (dari Log Hapus)
    var shL = ss.getSheetByName('Log Hapus');
    if (shL && shL.getLastRow() > 1) {
      var rows = shL.getRange(2, 2, shL.getLastRow() - 1, 2).getValues();
      rows.forEach(function(r){
        if (r[0] === 'Transaksi') out.del.tx.push(String(r[1]));
        else if (r[0] === 'Pengeluaran') out.del.exp.push(String(r[1]));
      });
    }
  } catch (err) {
    out.error = String(err);
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Baca kolom JSON dari sheet DataTx/DataExp */
function readJsonSheet(ss, name) {
  var sh = ss.getSheetByName(name);
  var arr = [];
  if (sh && sh.getLastRow() > 1) {
    var vals = sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues();
    vals.forEach(function(v){
      try { if (v[0]) arr.push(JSON.parse(v[0])); } catch (e) {}
    });
  }
  return arr;
}

/** Ambil sheet, buat otomatis + header kalau belum ada */
function getSheet(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
