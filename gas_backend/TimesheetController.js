/**
 * =========================================================================
 * TIMESHEET CONTROLLER - CHẤM CÔNG & QUẢN LÝ NGHỈ PHÉP THÁNG
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: CHAM_CONG
 * =========================================================================
 */

function getTimesheets(period) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('CHAM_CONG');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  const filtered = period 
    ? values.filter(r => String(r[0]).trim() === String(period).trim())
    : values;

  return filtered.map(r => ({
    ky: String(r[0] || '').trim(),
    maNV: String(r[1] || '').trim(),
    hoTen: String(r[2] || '').trim(),
    congChuan: Number(r[3]) || 22,
    congThucTe: Number(r[4]) || 0,
    nghiPhep: Number(r[5]) || 0,
    nghiKhongLuong: Number(r[6]) || 0,
    nghiCheDo: Number(r[7]) || 0,
    tongCongTinhLuong: Number(r[8]) || (Number(r[4]) || 0) + (Number(r[5]) || 0),
    ghiChu: String(r[9] || '').trim(),
    thoiGianCapNhat: r[10] instanceof Date ? Utilities.formatDate(r[10], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') : String(r[10] || '')
  }));
}

function saveTimesheets(period, timesheetList) {
  if (!period || !Array.isArray(timesheetList) || timesheetList.length === 0) {
    throw new Error('Dữ liệu chấm công không hợp lệ.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('CHAM_CONG');
  if (!sh) throw new Error('Không tìm thấy Sheet CHAM_CONG');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const lastRow = sh.getLastRow();
    const existing = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 2).getValues() : [];
    const rowMap = new Map();

    for (let i = 0; i < existing.length; i++) {
      const key = `${String(existing[i][0]).trim()}_${String(existing[i][1]).trim()}`;
      rowMap.set(key, i + 2);
    }

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const newRows = [];

    timesheetList.forEach(item => {
      const key = `${String(period).trim()}_${String(item.maNV).trim()}`;
      const totalWork = (Number(item.congThucTe) || 0) + (Number(item.nghiPhep) || 0);
      const rowData = [
        period,
        item.maNV,
        item.hoTen || '',
        Number(item.congChuan) || 22,
        Number(item.congThucTe) || 0,
        Number(item.nghiPhep) || 0,
        Number(item.nghiKhongLuong) || 0,
        Number(item.nghiCheDo) || 0,
        totalWork,
        item.ghiChu || '',
        nowStr
      ];

      if (rowMap.has(key)) {
        const rowIdx = rowMap.get(key);
        sh.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
      } else {
        newRows.push(rowData);
      }
    });

    if (newRows.length > 0) {
      sh.getRange(sh.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }

    return { status: 'success', message: `Đã lưu bảng chấm công kỳ ${period} thành công` };
  } finally {
    lock.releaseLock();
  }
}
