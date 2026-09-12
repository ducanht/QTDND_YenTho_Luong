/**
 * =========================================================================
 * STAFF CONTROLLER - QUẢN LÝ HỒ SƠ NHÂN SỰ 360° & THÀNH VIÊN
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: DM_NS, LS_CONGTAC
 * =========================================================================
 */

function getStaffList() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_NS');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maNV: String(r[0] || '').trim(),
    hoTen: String(r[1] || '').trim(),
    chucDanh: String(r[2] || '').trim(),
    phongBan: String(r[3] || '').trim(),
    dienThoai: String(r[4] || '').trim(),
    email: String(r[5] || '').trim(),
    ngaySinh: r[6] instanceof Date ? Utilities.formatDate(r[6], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[6] || ''),
    gioiTinh: String(r[7] || '').trim(),
    cccd: String(r[8] || '').trim(),
    ngayCapCCCD: r[9] instanceof Date ? Utilities.formatDate(r[9], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[9] || ''),
    noiCapCCCD: String(r[10] || '').trim(),
    diaChi: String(r[11] || '').trim(),
    ngayVaoLam: r[12] instanceof Date ? Utilities.formatDate(r[12], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[12] || ''),
    trangThai: String(r[13] || 'ĐANG LÀM').trim(),
    soNPT: Number(r[14]) || 0,
    soTaiKhoanNH: String(r[15] || '').trim(),
    tenNganHang: String(r[16] || 'Agribank Quý Lộc').trim(),
    mst: String(r[17] || '').trim(),
    soSoBHXH: String(r[18] || '').trim(),
    linkAnhThe: String(r[19] || '').trim(),
    ghiChu: String(r[20] || '').trim()
  }));
}

function saveStaff(staffData) {
  if (!staffData || !staffData.maNV || !staffData.hoTen) {
    throw new Error('Dữ liệu nhân sự không hợp lệ: Thiếu Mã NV hoặc Họ tên.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_NS');
  if (!sh) throw new Error('Không tìm thấy Sheet DM_NS');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const lastRow = sh.getLastRow();
    let rowIndex = -1;

    if (lastRow > 1) {
      const ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]).trim().toUpperCase() === String(staffData.maNV).trim().toUpperCase()) {
          rowIndex = i + 2;
          break;
        }
      }
    }

    const rowData = [
      staffData.maNV,
      staffData.hoTen,
      staffData.chucDanh || '',
      staffData.phongBan || '',
      staffData.dienThoai || '',
      staffData.email || '',
      staffData.ngaySinh || '',
      staffData.gioiTinh || '',
      staffData.cccd || '',
      staffData.ngayCapCCCD || '',
      staffData.noiCapCCCD || '',
      staffData.diaChi || '',
      staffData.ngayVaoLam || '',
      staffData.trangThai || 'ĐANG LÀM',
      Number(staffData.soNPT) || 0,
      staffData.soTaiKhoanNH || '',
      staffData.tenNganHang || 'Agribank Quý Lộc',
      staffData.mst || '',
      staffData.soSoBHXH || '',
      staffData.linkAnhThe || '',
      staffData.ghiChu || ''
    ];

    if (rowIndex > 0) {
      sh.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sh.appendRow(rowData);
    }

    return { status: 'success', message: 'Đã lưu hồ sơ cán bộ thành công' };
  } finally {
    lock.releaseLock();
  }
}
