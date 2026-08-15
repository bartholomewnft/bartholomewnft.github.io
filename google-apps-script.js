/**
 * TEMPEL KODE INI DI GOOGLE APPS SCRIPT (Extensions > Apps Script)
 * dari Google Sheet yang akan menampung data whitelist.
 *
 * Sheet pertama (paling kiri) akan dipakai untuk menyimpan data.
 * Header otomatis dibuat kalau sheet masih kosong:
 * Timestamp, X Handle, Wallet, Comment Link, Task1 Followed, Task2 Like&RT, Task3 Commented
 *
 * PENTING: karena tidak pakai API resmi X, kolom Task1/2/3 di sini
 * HANYA self-report dari user (mereka klik tombol centang sendiri).
 * Verifikasi asli (follow/like/RT/comment beneran atau tidak) harus
 * dicek MANUAL oleh admin lewat kolom "Comment Link" dan X Handle
 * yang mereka isi.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "X Handle",
        "Wallet",
        "Comment Link",
        "Task1 Followed (self-report)",
        "Task2 Like&RT (self-report)",
        "Task3 Commented (self-report)",
      ]);
    }

    const params = e.parameter;

    sheet.appendRow([
      new Date(),
      params.handle || "",
      params.wallet || "",
      params.commentLink || "",
      params.task1_followed || "no",
      params.task2_likeRT || "no",
      params.task3_comment || "no",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Web App aktif. Gunakan method POST." }))
    .setMimeType(ContentService.MimeType.JSON);
}
