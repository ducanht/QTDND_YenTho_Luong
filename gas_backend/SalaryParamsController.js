/**
 * =========================================================================
 * SALARY PARAMS CONTROLLER V3.0
 * CRUD cho DM_THAM_SO_LUONG (tham số pháp lý BHXH/TNCN/thâm niên)
 * CRUD cho DM_BAC_LUONG (bảng lương bậc bậc 5 bậc × N chức danh)
 * =========================================================================
 */

/**
 * Lưu tham số lương (upsert theo mã tham số)
 */
function saveSalaryParams(paramsList) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {
    return { status: 'error', message: 'Hệ thống bận.' };
  }
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('DM_THAM_SO_LUONG');
    if (!sheet) {
      sheet = ss.insertSheet('DM_THAM_SO_LUONG');
      sheet.getRange(1,1,1,10).setValues([[
        'Nhóm tham số','Mã tham số','Tên tham số','Giá trị số',
        'Giá trị chuỗi','Đơn vị','Từ ngày hiệu lực','Đến ngày','Căn cứ pháp lý','Ghi chú'
      ]]);
    }
    
    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1 ? sheet.getRange(2,1,lastRow-1,10).getValues() : [];
    const existMap = {};
    existing.forEach((row, idx) => { existMap[String(row[1]).trim()] = idx + 2; });
    
    (paramsList || []).forEach(param => {
      const maThamSo = String(param.maThamSo || '').trim();
      if (!maThamSo) return;
      const row = [
        param.nhomThamSo || '', maThamSo, param.tenThamSo || '',
        param.giaTriSo !== undefined ? param.giaTriSo : '',
        param.giaTriChuoi || '', param.donVi || '',
        param.tuNgay || '', param.denNgay || '',
        param.canCuPhapLy || '', param.ghiChu || ''
      ];
      if (existMap[maThamSo]) {
        sheet.getRange(existMap[maThamSo], 1, 1, 10).setValues([row]);
      } else {
        sheet.getRange(sheet.getLastRow() + 1, 1, 1, 10).setValues([row]);
      }
    });
    
    return { status: 'success', message: `Đã lưu ${(paramsList||[]).length} tham số lương` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Lấy bảng lương bậc bậc đầy đủ
 */
function getSalaryScaleData() {
  return getSalaryScale(); // Đã định nghĩa trong PayrollEngine.js
}

/**
 * Lưu bảng lương bậc bậc
 */
function saveSalaryScale(scaleList) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {
    return { status: 'error', message: 'Hệ thống bận.' };
  }
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('DM_BAC_LUONG');
    if (!sheet) sheet = ss.insertSheet('DM_BAC_LUONG');
    
    // Xóa hết và viết lại toàn bộ
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    
    const rows = (scaleList || []).map(s => [
      s.maViTri, s.tenChucDanh, s.bac, s.loaiBac || 'BAC_THUONG',
      s.heSo, s.luongNgachBac || 0, s.ghiChu || '',
      s.ngayHieuLuc || ''
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 8).setValues(rows);
    }
    
    return { status: 'success', message: `Đã lưu ${rows.length} dòng bảng lương bậc` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Tự động sinh bảng lương bậc từ DM_CHUCDANH + tham số
 */
function autoGenerateSalaryScale(luongCoSo) {
  luongCoSo = luongCoSo || 2340000;
  const positions = getPositions();
  const rows = [];
  
  (positions || []).forEach(pos => {
    // Bậc 1-5 từ hệ số bậc cấu hình trong DM_CHUCDANH
    const heSoBacs = [
      Number(pos.heSoBac1) || Number(pos.pa1HeSo) || 0,
      Number(pos.heSoBac2) || Number(pos.pa2HeSo) || 0,
      Number(pos.heSoBac3) || Number(pos.pa3HeSo) || 0,
      Number(pos.heSoBac4) || (Number(pos.pa3HeSo) * 1.05) || 0,
      Number(pos.heSoBac5) || (Number(pos.pa3HeSo) * 1.10) || 0
    ];
    heSoBacs.forEach((heSo, idx) => {
      if (!heSo) return;
      rows.push({
        maViTri: pos.maViTri,
        tenChucDanh: pos.tenChucDanh,
        bac: idx + 1,
        loaiBac: 'BAC_THUONG',
        heSo: Math.round(heSo * 100) / 100,
        luongNgachBac: Math.round(luongCoSo * heSo),
        ghiChu: `Bậc ${idx+1}`,
        ngayHieuLuc: '01/01/2027'
      });
    });
  });
  
  return rows;
}
