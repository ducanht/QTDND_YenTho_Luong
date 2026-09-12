/**
 * GOOGLE APPS SCRIPT BACKEND - QTDND YÊN THỌ: HỆ THỐNG LƯƠNG & CHẤM CÔNG 2027
 * CSDL lưu trữ lâu dài online trên Google Sheets (100% Miễn phí, Vĩnh cửu, An toàn)
 * Đơn vị: Quỹ tín dụng nhân dân Yên Thọ
 */

// >>>>> ID GOOGLE SHEET CHÍNH THỨC CỦA QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ <<<<<
const SPREADSHEET_ID = "1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("Lỗi mở bảng tính bằng SPREADSHEET_ID: " + e.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

const SHEET_NAMES = {
  CONFIG: 'CẤU HÌNH & CHỐT LƯƠNG',
  POSITIONS: 'KHUNG VỊ TRÍ & HỆ SỐ',
  GOVERNANCE: 'HĐQT & BKS',
  STAFF: 'DANH SÁCH CBNV',
  TIMESHEETS: 'CHẤM CÔNG & KPI THÁNG',
  PAYROLL_HISTORY: 'LỊCH SỬ BẢNG LƯƠNG'
};

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getData';
  
  if (action === 'ping') {
    return createJsonResponse({ status: 'success', message: 'Kết nối CSDL Google Sheets thành công', timestamp: new Date() });
  }

  if (action === 'setupDatabase' || action === 'initDatabase') {
    try {
      khoiTaoHeThongCSDL();
      return createJsonResponse({
        status: 'success',
        message: 'Đã tự động khởi tạo và đồng bộ 13 Sheets CSDL trên Google Sheet thành công',
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({ status: 'error', message: 'Lỗi khởi tạo 13 Sheets: ' + err.toString() });
    }
  }
  
  try {
    ensureDatabaseSchema();
    const data = loadAllData();
    return createJsonResponse({ status: 'success', data: data });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Khóa chống xung đột ghi đồng thời 15s
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'Hệ thống đang bận xử lý dữ liệu khác, vui lòng thử lại sau giây lát.' });
  }

  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'syncAll';

    if (action === 'setupDatabase' || action === 'initDatabase') {
      khoiTaoHeThongCSDL();
      return createJsonResponse({ status: 'success', message: 'Đã tự động cập nhật cấu trúc 13 Sheets CSDL thành công', timestamp: new Date() });
    }

    ensureDatabaseSchema();

    if (action === 'syncAll') {
      saveAllData(postData.payload);
      return createJsonResponse({ status: 'success', message: 'Đã lưu đồng bộ CSDL Online thành công', timestamp: new Date() });
    } else if (action === 'saveMonth') {
      saveMonthPayroll(postData.payload);
      return createJsonResponse({ status: 'success', message: 'Đã lưu bảng lương và chấm công tháng ' + postData.payload.period, timestamp: new Date() });
    }

    return createJsonResponse({ status: 'error', message: 'Hành động không hợp lệ: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tự động kiểm tra và khởi tạo các Sheet CSDL nếu chưa tồn tại
 */
function ensureDatabaseSchema() {
  const ss = getSpreadsheet();
  
  // 1. Cấu hình
  let shConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!shConfig) {
    shConfig = ss.insertSheet(SHEET_NAMES.CONFIG);
    shConfig.getRange(1, 1, 1, 2).setValues([['Mã tham số / Khóa', 'Giá trị cấu hình']]).setFontWeight('bold');
    shConfig.setFrozenRows(1);
  }

  // 2. Vị trí
  let shPos = ss.getSheetByName(SHEET_NAMES.POSITIONS);
  if (!shPos) {
    shPos = ss.insertSheet(SHEET_NAMES.POSITIONS);
    shPos.getRange(1, 1, 1, 14).setValues([[
      'Mã vị trí', 'Tên chức danh', 'Nhóm', 'Bậc', 'Số lượng',
      'PA1 Hệ số', 'PA2 Hệ số', 'PA3 Hệ số',
      'PA1 KPI', 'PA2 KPI', 'PA3 KPI',
      'PA1 Thưởng', 'PA2 Thưởng', 'PA3 Thưởng'
    ]]).setFontWeight('bold');
    shPos.setFrozenRows(1);
  }

  // 3. HĐQT / BKS
  let shGov = ss.getSheetByName(SHEET_NAMES.GOVERNANCE);
  if (!shGov) {
    shGov = ss.insertSheet(SHEET_NAMES.GOVERNANCE);
    shGov.getRange(1, 1, 1, 8).setValues([[
      'Mã', 'Chức danh quản trị', 'Khối', 'Mã vị trí', 'Số lượng',
      'Phụ cấp trách nhiệm', 'Thù lao quản trị', 'Khoản khác'
    ]]).setFontWeight('bold');
    shGov.setFrozenRows(1);
  }

  // 4. Danh sách CBNV
  let shStaff = ss.getSheetByName(SHEET_NAMES.STAFF);
  if (!shStaff) {
    shStaff = ss.insertSheet(SHEET_NAMES.STAFF);
    shStaff.getRange(1, 1, 1, 8).setValues([[
      'Mã NV', 'Họ và tên', 'Mã vị trí', 'Trạng thái hoạt động',
      'KPI % mặc định', 'Thưởng % mặc định', 'Số người phụ thuộc', 'Ghi chú'
    ]]).setFontWeight('bold');
    shStaff.setFrozenRows(1);
  }

  // 5. Chấm công & KPI tháng
  let shTimesheet = ss.getSheetByName(SHEET_NAMES.TIMESHEETS);
  if (!shTimesheet) {
    shTimesheet = ss.insertSheet(SHEET_NAMES.TIMESHEETS);
    shTimesheet.getRange(1, 1, 1, 12).setValues([[
      'Kỳ (YYYY-MM)', 'Mã NV', 'Họ và tên', 'Công chuẩn', 'Công thực tế',
      'Nghỉ phép', 'Nghỉ không lương', 'KPI %', 'Thưởng thêm ₫', 'Trừ phạt ₫', 'Ghi chú', 'Thời gian cập nhật'
    ]]).setFontWeight('bold');
    shTimesheet.setFrozenRows(1);
  }

  // 6. Lịch sử Bảng lương
  let shPayroll = ss.getSheetByName(SHEET_NAMES.PAYROLL_HISTORY);
  if (!shPayroll) {
    shPayroll = ss.insertSheet(SHEET_NAMES.PAYROLL_HISTORY);
    shPayroll.getRange(1, 1, 1, 16).setValues([[
      'Kỳ lương', 'Mã NV', 'Họ và tên', 'Chức danh', 'Công thực',
      'Lương ngạch bậc', 'Lương KPI', 'Tiền thưởng', 'Phụ cấp công vụ', 'Thù lao quản trị',
      'Tổng Gross', 'BHXH NLĐ (10.5%)', 'Thuế TNCN', 'Thực Lĩnh (Net)', 'BHXH Đơn vị (21.5%)', 'Ngày chốt'
    ]]).setFontWeight('bold');
    shPayroll.setFrozenRows(1);
  }
}

/**
 * Đọc toàn bộ dữ liệu cấu hình và dữ liệu tháng từ Google Sheets
 */
function loadAllData() {
  const ss = getSpreadsheet();
  const result = {
    meta: {},
    params: {},
    officialFramework: {},
    positions: [],
    governance: [],
    staff: [],
    monthlyData: {}
  };

  // Đọc Cấu hình
  const shConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (shConfig && shConfig.getLastRow() > 1) {
    const configRows = shConfig.getRange(2, 1, shConfig.getLastRow() - 1, 2).getValues();
    configRows.forEach(row => {
      const key = String(row[0]);
      let val = row[1];
      try {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch (e) {}
      if (key.startsWith('param_')) {
        result.params[key.replace('param_', '')] = Number(val) || val;
      } else if (key === 'officialFramework') {
        result.officialFramework = val;
      } else if (key.startsWith('meta_')) {
        result.meta[key.replace('meta_', '')] = val;
      }
    });
  }

  // Đọc Vị trí
  const shPos = ss.getSheetByName(SHEET_NAMES.POSITIONS);
  if (shPos && shPos.getLastRow() > 1) {
    result.positions = shPos.getRange(2, 1, shPos.getLastRow() - 1, 14).getValues();
  }

  // Đọc HĐQT
  const shGov = ss.getSheetByName(SHEET_NAMES.GOVERNANCE);
  if (shGov && shGov.getLastRow() > 1) {
    result.governance = shGov.getRange(2, 1, shGov.getLastRow() - 1, 8).getValues();
  }

  // Đọc Staff
  const shStaff = ss.getSheetByName(SHEET_NAMES.STAFF);
  if (shStaff && shStaff.getLastRow() > 1) {
    result.staff = shStaff.getRange(2, 1, shStaff.getLastRow() - 1, 8).getValues();
  }

  // Đọc Timesheets tháng
  const shTimesheet = ss.getSheetByName(SHEET_NAMES.TIMESHEETS);
  if (shTimesheet && shTimesheet.getLastRow() > 1) {
    const rows = shTimesheet.getRange(2, 1, shTimesheet.getLastRow() - 1, 12).getValues();
    rows.forEach(r => {
      const period = String(r[0]);
      const staffCode = String(r[1]);
      if (!result.monthlyData[period]) {
        result.monthlyData[period] = { period: period, standardDays: Number(r[3]) || 22, timesheets: {} };
      }
      result.monthlyData[period].timesheets[staffCode] = {
        workDays: Number(r[4]) || 0,
        paidLeave: Number(r[5]) || 0,
        unpaidLeave: Number(r[6]) || 0,
        kpiPercent: Number(r[7]) || 100,
        extraBonus: Number(r[8]) || 0,
        penalty: Number(r[9]) || 0,
        note: String(r[10] || '')
      };
    });
  }

  return result;
}

/**
 * Lưu toàn bộ cấu hình hệ thống
 */
function saveAllData(data) {
  const ss = getSpreadsheet();

  // 1. Lưu Cấu hình & Chốt Khung
  const shConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  shConfig.getRange(2, 1, Math.max(1, shConfig.getLastRow() - 1), 2).clearContent();
  const configData = [];
  if (data.params) {
    for (const [k, v] of Object.entries(data.params)) {
      configData.push(['param_' + k, v]);
    }
  }
  if (data.meta) {
    for (const [k, v] of Object.entries(data.meta)) {
      configData.push(['meta_' + k, typeof v === 'object' ? JSON.stringify(v) : v]);
    }
  }
  if (data.officialFramework) {
    configData.push(['officialFramework', JSON.stringify(data.officialFramework)]);
  }
  if (configData.length > 0) {
    shConfig.getRange(2, 1, configData.length, 2).setValues(configData);
  }

  // 2. Lưu Vị trí
  if (data.positions && data.positions.length > 0) {
    const shPos = ss.getSheetByName(SHEET_NAMES.POSITIONS);
    shPos.getRange(2, 1, Math.max(1, shPos.getLastRow() - 1), 14).clearContent();
    shPos.getRange(2, 1, data.positions.length, data.positions[0].length).setValues(data.positions);
  }

  // 3. Lưu HĐQT
  if (data.governance && data.governance.length > 0) {
    const shGov = ss.getSheetByName(SHEET_NAMES.GOVERNANCE);
    shGov.getRange(2, 1, Math.max(1, shGov.getLastRow() - 1), 8).clearContent();
    shGov.getRange(2, 1, data.governance.length, data.governance[0].length).setValues(data.governance);
  }

  // 4. Lưu Nhân viên
  if (data.staff && data.staff.length > 0) {
    const shStaff = ss.getSheetByName(SHEET_NAMES.STAFF);
    shStaff.getRange(2, 1, Math.max(1, shStaff.getLastRow() - 1), 8).clearContent();
    shStaff.getRange(2, 1, data.staff.length, data.staff[0].length).setValues(data.staff);
  }
}

/**
 * Lưu bảng chấm công & bảng tính lương của 1 tháng cụ thể
 */
function saveMonthPayroll(payload) {
  const ss = getSpreadsheet();
  const period = payload.period;
  const standardDays = payload.standardDays || 22;
  const timesheetData = payload.timesheetData || [];
  const payrollRows = payload.payrollRows || [];

  // 1. Cập nhật Sheet Chấm công
  const shTimesheet = ss.getSheetByName(SHEET_NAMES.TIMESHEETS);
  if (shTimesheet.getLastRow() > 1) {
    const existing = shTimesheet.getRange(2, 1, shTimesheet.getLastRow() - 1, 1).getValues();
    for (let i = existing.length - 1; i >= 0; i--) {
      if (String(existing[i][0]) === period) {
        shTimesheet.deleteRow(i + 2);
      }
    }
  }

  if (timesheetData.length > 0) {
    const rowsToInsert = timesheetData.map(t => [
      period, t.code, t.name, standardDays, t.workDays,
      t.paidLeave, t.unpaidLeave, t.kpiPercent, t.extraBonus, t.penalty, t.note, new Date()
    ]);
    shTimesheet.getRange(shTimesheet.getLastRow() + 1, 1, rowsToInsert.length, 12).setValues(rowsToInsert);
  }

  // 2. Cập nhật Sheet Lịch sử Bảng lương
  if (payrollRows.length > 0) {
    const shPayroll = ss.getSheetByName(SHEET_NAMES.PAYROLL_HISTORY);
    if (shPayroll.getLastRow() > 1) {
      const existing = shPayroll.getRange(2, 1, shPayroll.getLastRow() - 1, 1).getValues();
      for (let i = existing.length - 1; i >= 0; i--) {
        if (String(existing[i][0]) === period) {
          shPayroll.deleteRow(i + 2);
        }
      }
    }

    const payrollToInsert = payrollRows.map(p => [
      period, p.code, p.name, p.posName, p.workDays,
      p.salaryFixed, p.salaryKpi, p.salaryBonus, p.allowanceWork, p.remunerationGov,
      p.gross, p.insuranceEmp, p.pit, p.net, p.insuranceOrg, new Date()
    ]);
    shPayroll.getRange(shPayroll.getLastRow() + 1, 1, payrollToInsert.length, 16).setValues(payrollToInsert);
  }
}
