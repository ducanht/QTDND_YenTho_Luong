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

  // Đọc danh sách quá trình công tác & hệ số lương từ LS_CONGTAC
  const shLs = ss.getSheetByName('LS_CONGTAC');
  const salaryMap = {};
  if (shLs && shLs.getLastRow() > 1) {
    const lsValues = shLs.getRange(2, 1, shLs.getLastRow() - 1, shLs.getLastColumn()).getValues();
    lsValues.forEach(r => {
      const maNV = String(r[1] || '').trim();
      const trangThai = String(r[16] || '').trim();
      // Ưu tiên bản ghi HIỆN TẠI hoặc bản ghi mới nhất
      if (maNV && (!salaryMap[maNV] || trangThai === 'HIỆN TẠI')) {
        salaryMap[maNV] = {
          maViTri: String(r[7] || '').trim(),
          chucDanh: String(r[8] || '').trim(),
          bac: Number(r[9]) || 1,
          heSoLuong: Number(r[10]) || 0,
          tranKpi: Number(r[11]) || 0,
          tranThuong: Number(r[12]) || 0,
          phuCapTN: Number(r[13]) || 0,
          thuLaoQT: Number(r[14]) || 0,
          soQD: String(r[3] || '').trim(),
          ngayQD: r[4] instanceof Date ? Utilities.formatDate(r[4], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[4] || '')
        };
      }
    });
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const colIndexMap = {};
  headers.forEach((h, idx) => { colIndexMap[h] = idx; });

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => {
    const maNV = String(r[0] || '').trim();
    const sal = salaryMap[maNV] || {};

    const getVal = (colName) => {
      const idx = colIndexMap[colName];
      return (idx !== undefined && idx < r.length) ? r[idx] : undefined;
    };

    const fmtDate = (val) => {
      if (!val) return '';
      if (val instanceof Date) return Utilities.formatDate(val, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
      return String(val).trim();
    };

    const bhxhVal = Number(getVal('Mức đóng BHXH')) || Number(r[21]) || Number(sal.mucDongBhxh) || 0;
    const bacVal = Number(getVal('Bậc lương')) || Number(sal.bac) || 1;
    const namVKVal = Number(getVal('Năm vượt khung')) || 0;
    const ngayDamNhiemVal = fmtDate(getVal('Ngày đảm nhiệm chức vụ'));
    const thamNienQuyDoiVal = Number(getVal('Thâm niên CV quy đổi (năm)')) || 0;
    const linkHDLDVal = String(getVal('Link File HĐLĐ') || '').trim();
    const linkPhuLucVal = String(getVal('Link File Phụ lục HĐLĐ') || '').trim();
    const linkQDVal = String(getVal('Link File Quyết định') || '').trim();

    return {
      maNV: maNV,
      hoTen: String(r[1] || '').trim(),
      chucDanh: String(r[2] || sal.chucDanh || '').trim(),
      phongBan: String(r[3] || '').trim(),
      dienThoai: String(r[4] || '').trim(),
      email: String(r[5] || '').trim(),
      ngaySinh: fmtDate(r[6]),
      gioiTinh: String(r[7] || '').trim(),
      cccd: String(r[8] || '').trim(),
      ngayCapCCCD: fmtDate(r[9]),
      noiCapCCCD: String(r[10] || '').trim(),
      diaChi: String(r[11] || '').trim(),
      ngayVaoLam: fmtDate(r[12]),
      trangThai: String(r[13] || 'ĐANG LÀM').trim(),
      soNPT: Number(r[14]) || 0,
      soTaiKhoanNH: String(r[15] || '').trim(),
      tenNganHang: String(r[16] || 'Agribank Quý Lộc').trim(),
      mst: String(r[17] || '').trim(),
      soSoBHXH: String(r[18] || '').trim(),
      linkAnhThe: String(r[19] || '').trim(),
      ghiChu: String(r[20] || '').trim(),
      // Các trường lương & phụ cấp & chức vụ V3
      bac: bacVal,
      heSoLuong: Number(sal.heSoLuong) || 0,
      maViTri: sal.maViTri || '',
      phuCapTN: Number(sal.phuCapTN) || 0,
      mucDongBhxh: bhxhVal,
      soQD: sal.soQD || '',
      ngayQD: sal.ngayQD || '',
      ngayDamNhiemCV: ngayDamNhiemVal,
      thamNienQuyDoi: thamNienQuyDoiVal,
      namVuotKhung: namVKVal,
      linkHDLD: linkHDLDVal,
      linkPhuLuc: linkPhuLucVal,
      linkQD: linkQDVal
    };
  });
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
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
    const colIndexMap = {};
    headers.forEach((h, idx) => { colIndexMap[h] = idx + 1; });

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

    // Nếu tạo mới, thêm hàng mới
    if (rowIndex === -1) {
      rowIndex = lastRow + 1;
      sh.getRange(rowIndex, 1, 1, headers.length).clearContent();
    }

    // Ghi từng trường theo đúng cột header
    const fieldMapping = {
      'Mã NV': staffData.maNV,
      'Họ và tên': staffData.hoTen,
      'Chức danh': staffData.chucDanh || '',
      'Khối phòng ban': staffData.phongBan || '',
      'Điện thoại': staffData.dienThoai || '',
      'Email': staffData.email || '',
      'Ngày sinh': staffData.ngaySinh || '',
      'Giới tính': staffData.gioiTinh || '',
      'Số CCCD': staffData.cccd || '',
      'Ngày cấp CCCD': staffData.ngayCapCCCD || '',
      'Nơi cấp CCCD': staffData.noiCapCCCD || '',
      'Địa chỉ thường trú': staffData.diaChi || '',
      'Ngày vào làm': staffData.ngayVaoLam || '',
      'Trạng thái': staffData.trangThai || 'ĐANG LÀM',
      'Số NPT': Number(staffData.soNPT) || 0,
      'Số tài khoản NH': staffData.soTaiKhoanNH || '',
      'Tên ngân hàng': staffData.tenNganHang || 'Agribank Quý Lộc',
      'Mã số thuế': staffData.mst || '',
      'Số sổ BHXH': staffData.soSoBHXH || '',
      'Link ảnh thẻ': staffData.linkAnhThe || '',
      'Ghi chú': staffData.ghiChu || '',
      'Mức đóng BHXH': Number(staffData.mucDongBhxh) || 0,
      'Ngày đảm nhiệm chức vụ': staffData.ngayDamNhiemCV || staffData.ngayDamNhiemChucVu || '',
      'Thâm niên CV quy đổi (năm)': Number(staffData.thamNienQuyDoi) || 0,
      'Bậc lương': Number(staffData.bac) || 1,
      'Năm vượt khung': Number(staffData.namVuotKhung) || 0,
      'Link File HĐLĐ': staffData.linkHDLD || staffData.linkFileHDLD || '',
      'Link File Phụ lục HĐLĐ': staffData.linkPhuLuc || staffData.linkFilePhuLuc || '',
      'Link File Quyết định': staffData.linkQD || staffData.linkFileQD || ''
    };

    Object.keys(fieldMapping).forEach(colName => {
      const colNum = colIndexMap[colName];
      if (colNum) {
        sh.getRange(rowIndex, colNum).setValue(fieldMapping[colName]);
      }
    });

    // Nếu có cập nhật hệ số lương / chức danh -> Đồng bộ sang LS_CONGTAC
    if (staffData.heSoLuong !== undefined && staffData.heSoLuong !== null) {
      const shLs = ss.getSheetByName('LS_CONGTAC');
      if (shLs) {
        const lastLsRow = shLs.getLastRow();
        let lsRowIndex = -1;
        if (lastLsRow > 1) {
          const lsIds = shLs.getRange(2, 2, lastLsRow - 1, 1).getValues(); // Cột B: Mã NV
          for (let j = 0; j < lsIds.length; j++) {
            if (String(lsIds[j][0]).trim().toUpperCase() === String(staffData.maNV).trim().toUpperCase()) {
              lsRowIndex = j + 2;
              break;
            }
          }
        }

        const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
        const lsRowData = [
          `LS_${staffData.maNV}_${new Date().getFullYear()}`,
          staffData.maNV,
          staffData.hoTen,
          staffData.soQD || 'QĐ/NQ-HĐQT',
          staffData.ngayQD || nowStr,
          nowStr,
          '31/12/2099',
          staffData.maViTri || '',
          staffData.chucDanh || '',
          Number(staffData.bac) || 1,
          Number(staffData.heSoLuong) || 0,
          0.20,
          0.10,
          Number(staffData.phuCapTN) || 0,
          0,
          staffData.ghiChu || 'Cập nhật từ hồ sơ cán bộ',
          'HIỆN TẠI',
          staffData.linkQD || staffData.linkFileQD || ''
        ];

        if (lsRowIndex > 0) {
          shLs.getRange(lsRowIndex, 1, 1, lsRowData.length).setValues([lsRowData]);
        } else {
          shLs.appendRow(lsRowData);
        }
      }
    }

    return { status: 'success', message: 'Đã lưu hồ sơ cán bộ thành công' };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Cập nhật hàng loạt mức đóng BHXH cho nhiều cán bộ cùng lúc
 * Dùng khi HĐQT chốt phương án mô phỏng lương và phân bổ BHXH
 */
function updateBatchStaffBhxh(bhxhList) {
  if (!Array.isArray(bhxhList) || bhxhList.length === 0) {
    throw new Error('Danh sách cập nhật BHXH không hợp lệ hoặc rỗng.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_NS');
  if (!sh || sh.getLastRow() <= 1) throw new Error('Không tìm thấy Sheet DM_NS hoặc chưa có dữ liệu');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    let bhxhColIdx = headers.findIndex(h => String(h).trim() === 'Mức đóng BHXH');
    
    if (bhxhColIdx === -1) {
      bhxhColIdx = lastCol;
      sh.getRange(1, bhxhColIdx + 1).setValue('Mức đóng BHXH')
        .setFontWeight('bold')
        .setBackground('#17365d')
        .setFontColor('#ffffff');
      sh.setColumnWidth(bhxhColIdx + 1, 130);
    }

    const colToUpdate = bhxhColIdx + 1;
    const ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
    const bhxhMap = {};
    bhxhList.forEach(item => {
      if (item && item.maNV) {
        bhxhMap[String(item.maNV).trim().toUpperCase()] = Number(item.mucDongBhxh) || 0;
      }
    });

    let count = 0;
    for (let i = 0; i < ids.length; i++) {
      const maNV = String(ids[i][0]).trim().toUpperCase();
      if (bhxhMap[maNV] !== undefined) {
        const val = bhxhMap[maNV];
        sh.getRange(i + 2, colToUpdate).setValue(val).setNumberFormat('#,##0 "₫"');
        count++;
      }
    }

    return { 
      status: 'success', 
      message: `Đã lưu thành công mức đóng BHXH cho ${count} cán bộ vào CSDL DM_NS`,
      updatedCount: count
    };
  } finally {
    lock.releaseLock();
  }
}
