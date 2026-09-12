/**
 * =========================================================================
 * PAYROLL CONTROLLER - ĐỘNG CƠ TÍNH LƯƠNG 4 TẦNG & KHÓA SỔ BẤT BIẾN
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: BL_LICHSU
 * =========================================================================
 */

function getPayrollHistory(period) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('BL_LICHSU');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  const filtered = period ? values.filter(r => String(r[0]).trim() === String(period).trim()) : values;

  return filtered.map(r => ({
    kyLuong: String(r[0] || '').trim(),
    maNV: String(r[1] || '').trim(),
    hoTen: String(r[2] || '').trim(),
    chucDanh: String(r[3] || '').trim(),
    heSoLuong: Number(r[4]) || 0,
    congChuan: Number(r[5]) || 22,
    congThuc: Number(r[6]) || 0,
    luongNgachBac: Number(r[7]) || 0,
    heSoKpi: Number(r[8]) || 0,
    luongKpi: Number(r[9]) || 0,
    tienThuong: Number(r[10]) || 0,
    phuCapTN: Number(r[11]) || 0,
    thuLaoQT: Number(r[12]) || 0,
    anTrua: Number(r[13]) || 0,
    xangXe: Number(r[14]) || 0,
    dienThoai: Number(r[15]) || 0,
    trangPhuc: Number(r[16]) || 0,
    khoanKhac: Number(r[17]) || 0,
    tongGross: Number(r[18]) || 0,
    bhxhNld: Number(r[19]) || 0,
    giamTruGiaCanh: Number(r[20]) || 0,
    thuNhapTinhThue: Number(r[21]) || 0,
    thueTNCN: Number(r[22]) || 0,
    thucLinh: Number(r[23]) || 0,
    bhxhDonVi: Number(r[24]) || 0,
    ngayChot: r[25] instanceof Date ? Utilities.formatDate(r[25], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') : String(r[25] || '')
  }));
}

/**
 * Khóa sổ bảng lương tháng - Bọc trong LockService chống xung đột
 */
function lockMonthlyPayroll(period, payrollRows) {
  if (!period || !Array.isArray(payrollRows) || payrollRows.length === 0) {
    throw new Error('Dữ liệu bảng lương không hợp lệ để khóa sổ.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('BL_LICHSU');
  if (!sh) throw new Error('Không tìm thấy Sheet BL_LICHSU');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // 15s atomicity lock

  try {
    const lastRow = sh.getLastRow();
    const existing = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 2).getValues() : [];
    const rowMap = new Map();

    for (let i = 0; i < existing.length; i++) {
      const key = `${String(existing[i][0]).trim()}_${String(existing[i][1]).trim()}`;
      rowMap.set(key, i + 2);
    }

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const appendRows = [];

    payrollRows.forEach(item => {
      const key = `${String(period).trim()}_${String(item.maNV).trim()}`;
      const row = [
        period,
        item.maNV,
        item.hoTen || '',
        item.chucDanh || '',
        Number(item.heSoLuong) || 0,
        Number(item.congChuan) || 22,
        Number(item.congThuc) || 0,
        Number(item.luongNgachBac) || 0,
        Number(item.heSoKpi) || 0,
        Number(item.luongKpi) || 0,
        Number(item.tienThuong) || 0,
        Number(item.phuCapTN) || 0,
        Number(item.thuLaoQT) || 0,
        Number(item.anTrua) || 0,
        Number(item.xangXe) || 0,
        Number(item.dienThoai) || 0,
        Number(item.trangPhuc) || 0,
        Number(item.khoanKhac) || 0,
        Number(item.tongGross) || 0,
        Number(item.bhxhNld) || 0,
        Number(item.giamTruGiaCanh) || 0,
        Number(item.thuNhapTinhThue) || 0,
        Number(item.thueTNCN) || 0,
        Number(item.thucLinh) || 0,
        Number(item.bhxhDonVi) || 0,
        nowStr
      ];

      if (rowMap.has(key)) {
        const rowIdx = rowMap.get(key);
        sh.getRange(rowIdx, 1, 1, row.length).setValues([row]);
      } else {
        appendRows.push(row);
      }
    });

    if (appendRows.length > 0) {
      sh.getRange(sh.getLastRow() + 1, 1, appendRows.length, appendRows[0].length).setValues(appendRows);
    }

    return { status: 'success', message: `Đã khóa sổ bảng lương kỳ ${period} thành công (${payrollRows.length} CBNV).` };
  } finally {
    lock.releaseLock();
  }
}
