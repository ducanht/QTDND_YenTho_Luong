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

function saveAllowances(allowancesList) {
  if (!Array.isArray(allowancesList) || allowancesList.length === 0) {
    throw new Error('Dữ liệu phụ cấp không hợp lệ.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_PHU_CAP');
  if (!sh) throw new Error('Không tìm thấy Sheet DM_PHU_CAP');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const lastRow = sh.getLastRow();
    const existing = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 1).getValues() : [];
    const rowMap = new Map();

    for (let i = 0; i < existing.length; i++) {
      rowMap.set(String(existing[i][0]).trim(), i + 2);
    }

    const appendRows = [];
    allowancesList.forEach(a => {
      const maKhoan = String(a.maKhoan || '').trim();
      const row = [
        maKhoan,
        a.tenKhoan || '',
        a.phanLoaiChi || 'KHOAN_CONG_VU',
        a.cotBangLuong || '',
        a.tinhBHXH || 'KHÔNG',
        a.tinhThueTNCN || 'CÓ',
        Number(a.mucMienThueToiDa) || 0,
        a.phuongThucTinh || 'THEO_NGAY_CONG',
        a.canCuPhapLy || '',
        a.ghiChu || ''
      ];

      if (rowMap.has(maKhoan)) {
        sh.getRange(rowMap.get(maKhoan), 1, 1, row.length).setValues([row]);
      } else {
        appendRows.push(row);
      }
    });

    if (appendRows.length > 0) {
      sh.getRange(sh.getLastRow() + 1, 1, appendRows.length, appendRows[0].length).setValues(appendRows);
    }

    return { status: 'success', message: `Đã lưu cập nhật ${allowancesList.length} khoản phụ cấp thành công.` };
  } finally {
    lock.releaseLock();
  }
}

function saveAllowanceHistory(historyRecord) {
  if (!historyRecord || !historyRecord.maKhoan) {
    throw new Error('Dữ liệu lịch sử thay đổi định mức khoán không hợp lệ.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('LS_KHOAN');
  if (!sh) throw new Error('Không tìm thấy Sheet LS_KHOAN');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const maBanGhi = historyRecord.maBanGhi || ('LSK_' + Date.now());
    const row = [
      maBanGhi,
      historyRecord.maKhoan,
      historyRecord.tenKhoan || '',
      historyRecord.doiTuong || 'Toàn bộ CBNV',
      Number(historyRecord.mucCu) || 0,
      Number(historyRecord.mucMoi) || 0,
      historyRecord.donViTinh || '₫/tháng',
      historyRecord.tuNgay || Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
      historyRecord.denNgay || '31/12/2099',
      historyRecord.soQuyetDinh || '',
      historyRecord.ngayQuyetDinh || Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
      historyRecord.nguoiKy || '',
      historyRecord.lyDo || '',
      historyRecord.trangThai || 'ĐANG_HIỆU_LỰC'
    ];

    sh.appendRow(row);
    return { status: 'success', message: 'Đã lưu lịch sử thay đổi định mức khoán thành công (SCD-2).' };
  } finally {
    lock.releaseLock();
  }
}

