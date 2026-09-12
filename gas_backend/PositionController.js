/**
 * =========================================================================
 * POSITION CONTROLLER - KHUNG VỊ TRÍ CHỨC DANH & HỆ SỐ LƯƠNG
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: DM_CHUCDANH
 * =========================================================================
 */

function getPositions() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_CHUCDANH');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maViTri: String(r[0] || '').trim(),
    tenChucDanh: String(r[1] || '').trim(),
    khoi: String(r[2] || '').trim(),
    bac: Number(r[3]) || 1,
    soLuong: Number(r[4]) || 1,
    pa1HeSo: Number(r[5]) || 0,
    pa2HeSo: Number(r[6]) || 0,
    pa3HeSo: Number(r[7]) || 0,
    pa1Kpi: Number(r[8]) || 0,
    pa2Kpi: Number(r[9]) || 0,
    pa3Kpi: Number(r[10]) || 0,
    pa1Thuong: Number(r[11]) || 0,
    pa2Thuong: Number(r[12]) || 0,
    pa3Thuong: Number(r[13]) || 0,
    phuCapTN: Number(r[14]) || 0,
    thuLaoQT: Number(r[15]) || 0,
    ngayHieuLuc: r[16] instanceof Date ? Utilities.formatDate(r[16], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[16] || ''),
    quyetDinh: String(r[17] || '').trim()
  }));
}
