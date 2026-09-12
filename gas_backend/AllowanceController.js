/**
 * =========================================================================
 * ALLOWANCE CONTROLLER - PHỤ CẤP KHOÁN & LỊCH SỬ THAY ĐỔI ĐỊNH MỨC (SCD-2)
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: DM_PHU_CAP, LS_KHOAN
 * =========================================================================
 */

function getAllowances() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_PHU_CAP');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maKhoan: String(r[0] || '').trim(),
    tenKhoan: String(r[1] || '').trim(),
    phanLoaiChi: String(r[2] || '').trim(),
    cotBangLuong: String(r[3] || '').trim(),
    tinhBHXH: String(r[4] || 'KHÔNG').trim(),
    tinhThueTNCN: String(r[5] || 'CÓ').trim(),
    mucMienThueToiDa: Number(r[6]) || 0,
    phuongThucTinh: String(r[7] || '').trim(),
    canCuPhapLy: String(r[8] || '').trim(),
    ghiChu: String(r[9] || '').trim()
  }));
}

function getAllowanceHistory() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('LS_KHOAN');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maBanGhi: String(r[0] || '').trim(),
    maKhoan: String(r[1] || '').trim(),
    tenKhoan: String(r[2] || '').trim(),
    doiTuong: String(r[3] || '').trim(),
    mucCu: Number(r[4]) || 0,
    mucMoi: Number(r[5]) || 0,
    donViTinh: String(r[6] || '').trim(),
    tuNgay: r[7] instanceof Date ? Utilities.formatDate(r[7], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[7] || ''),
    denNgay: r[8] instanceof Date ? Utilities.formatDate(r[8], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[8] || ''),
    soQuyetDinh: String(r[9] || '').trim(),
    ngayQuyetDinh: r[10] instanceof Date ? Utilities.formatDate(r[10], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[10] || ''),
    nguoiKy: String(r[11] || '').trim(),
    lyDo: String(r[12] || '').trim(),
    trangThai: String(r[13] || '').trim()
  }));
}
