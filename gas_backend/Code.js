/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT BACKEND - ROUTER TRUNG TÂM DUAL-PLATFORM
 * HỆ THỐNG QUẢN TRỊ LƯƠNG, NHÂN SỰ, CHẤM CÔNG & KPI 2027 PRO V2
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ (Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá)
 * =========================================================================================
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

/**
 * Đóng gói toàn bộ 13 Sheets CSDL thành Bundle dữ liệu duy nhất
 * Dùng cho Zero-Latency Bootstrapping khi nạp Web App và cho API getData/getAllData
 */
function getAllDataBundle(period = '', maNV = '') {
  ensureDatabaseSchema();
  return {
    staffList: getStaffList(),
    positions: getPositions(),
    timesheets: getTimesheets(period),
    kpiDictionary: getKpiDictionary(),
    kpiEvaluations: getKpiEvaluations(period),
    allowances: getAllowances(),
    allowanceHistory: getAllowanceHistory(),
    payrollHistory: getPayrollHistory(period),
    feedbacks: getFeedbacks(maNV),
    params: getSystemParams(),
    scenarios: getScenarios(),
    serverTime: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss')
  };
}

/**
 * UNIVERSAL DISPATCHER - ĐIỀU PHỐI MỌI YÊU CẦU TỪ CLIENT
 * Được gọi bởi:
 * 1. google.script.run.executeGasAction(action, payload) khi chạy nhúng trong Google Workspace
 * 2. doPost(e) khi chạy ngoài Vercel / Localhost
 * 3. doGet(e) khi gọi API qua GET URL
 */
function executeGasAction(action, payload) {
  payload = payload || {};

  switch (action) {
    case 'ping':
      return { status: 'success', message: 'Kết nối CSDL Google Sheets thành công', timestamp: new Date() };

    case 'setupDatabase':
    case 'initDatabase': {
      khoiTaoHeThongCSDL();
      return {
        status: 'success',
        message: 'Đã tự động khởi tạo và chuẩn hóa 13 Sheets CSDL trên Google Sheet thành công',
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date()
      };
    }

    case 'getData':
    case 'getAllData': {
      const data = getAllDataBundle(payload.period || '', payload.maNV || '');
      return { status: 'success', data: data };
    }

    case 'login': {
      const res = loginUser(payload.username, payload.password);
      logAuditAction(payload.username || 'Client', 'Web Client', 'ĐĂNG_NHẬP', res.status);
      return res;
    }

    case 'saveStaff': {
      const res = saveStaff(payload.payload || payload);
      logAuditAction(payload.user || 'Admin', 'Web Client', 'LƯU_HỒ_SƠ_CBNV', (payload.payload || payload).maNV || '');
      return res;
    }

    case 'savePositions': {
      const res = savePositions(payload.payload || payload);
      logAuditAction(payload.user || 'HĐQT', 'Web Client', 'CẬP_NHẬT_CHỨC_DANH_HỆ_SỐ', 'Số lượng: ' + (payload.payload || payload).length);
      return res;
    }

    case 'saveTimesheets': {
      const res = saveTimesheets(payload.period, payload.payload || payload.timesheetList);
      logAuditAction(payload.user || 'Kế toán', 'Web Client', 'CHẤM_CÔNG_THÁNG', payload.period);
      return res;
    }

    case 'saveAllowances': {
      const res = saveAllowances(payload.payload || payload);
      logAuditAction(payload.user || 'Admin', 'Web Client', 'CẬP_NHẬT_DANH_MỤC_PHỤ_CẤP', 'Số lượng: ' + (payload.payload || payload).length);
      return res;
    }

    case 'saveAllowanceHistory': {
      const res = saveAllowanceHistory(payload.payload || payload);
      logAuditAction(payload.user || 'Admin', 'Web Client', 'THAY_ĐỔI_ĐỊNH_MỨC_KHOÁN_SCD2', (payload.payload || payload).maKhoan);
      return res;
    }

    case 'lockPayroll': {
      const res = lockMonthlyPayroll(payload.period, payload.payload || payload.payrollRows);
      logAuditAction(payload.user || 'Lãnh đạo', 'Web Client', 'KHÓA_SỔ_BẢNG_LƯƠNG', payload.period);
      return res;
    }

    case 'submitFeedback': {
      const res = submitFeedback(payload.payload || payload);
      logAuditAction((payload.payload || payload).maNV || 'CBNV', 'Web Client', 'GỬI_PHẢN_HỒI_LƯƠNG', (payload.payload || payload).kyLuong);
      return res;
    }

    case 'getScenarios': {
      return { status: 'success', data: getScenarios() };
    }

    case 'saveScenario': {
      const res = saveScenario(payload.payload || payload);
      logAuditAction(payload.user || 'Thành viên HĐQT', 'Web Client', 'LƯU_KỊCH_BẢN_MÔ_PHỎNG', (payload.payload || payload).name);
      return res;
    }

    default:
      return { status: 'error', message: 'Hành động không hợp lệ: ' + action };
  }
}

/**
 * Xử lý yêu cầu HTTP GET
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';

  // Nếu có tham số action -> Xử lý API REST
  if (action) {
    let payload = {};
    if (e.parameter.payload) {
      try { payload = JSON.parse(e.parameter.payload); } catch (err) { payload = e.parameter; }
    } else {
      payload = e.parameter;
    }
    const result = executeGasAction(action, payload);
    return createJsonResponse(result);
  }

  // Mặc định: Phục vụ Giao diện Web App Single-file HTML với ZERO-LATENCY BOOTSTRAPPING
  try {
    const template = HtmlService.createTemplateFromFile('Index');
    const initialBundle = getAllDataBundle();
    template.initialData = JSON.stringify(initialBundle);
    
    return template.evaluate()
      .setTitle('QTDND Yên Thọ - Quản Trị Lương & Chấm Công 2027 Pro V2')
      .setFaviconUrl('https://img.icons8.com/color/48/bank.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // Nếu chưa có file Index.html, trả về JSON API mặc định
    ensureDatabaseSchema();
    return createJsonResponse({
      status: 'success',
      message: 'Hệ thống Quản trị Lương QTDND Yên Thọ - Backend API sẵn sàng hoạt động',
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date(),
      error: err.toString()
    });
  }
}

/**
 * Xử lý yêu cầu HTTP POST (Có bọc LockService bảo toàn tính nguyên tố tài chính)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Khóa chống xung đột ghi 15 giây
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Hệ thống đang bận ghi nhận dữ liệu khác, vui lòng thử lại sau giây lát.'
    });
  }

  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || '';
    const payload = postData.payload || postData;

    const result = executeGasAction(action, payload);
    return createJsonResponse(result);
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
