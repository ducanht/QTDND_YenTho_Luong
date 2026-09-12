/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT BACKEND - ROUTER TRUNG TÂM
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
 * Xử lý yêu cầu HTTP GET
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';

  if (action === 'ping') {
    return createJsonResponse({ status: 'success', message: 'Kết nối CSDL Google Sheets thành công', timestamp: new Date() });
  }

  if (action === 'setupDatabase' || action === 'initDatabase') {
    try {
      khoiTaoHeThongCSDL();
      return createJsonResponse({
        status: 'success',
        message: 'Đã tự động khởi tạo và chuẩn hóa 13 Sheets CSDL trên Google Sheet thành công',
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({ status: 'error', message: 'Lỗi khởi tạo 13 Sheets: ' + err.toString() });
    }
  }

  // Tải toàn bộ dữ liệu CSDL cho Frontend
  if (action === 'getData' || action === 'getAllData') {
    try {
      ensureDatabaseSchema();
      const period = (e && e.parameter && e.parameter.period) || '';
      const maNV = (e && e.parameter && e.parameter.maNV) || '';

      const data = {
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
        serverTime: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss')
      };
      return createJsonResponse({ status: 'success', data: data });
    } catch (err) {
      return createJsonResponse({ status: 'error', message: err.toString() });
    }
  }

  // Mặc định: Phục vụ Giao diện Web App Single-file HTML nếu người dùng truy cập trực tiếp bằng trình duyệt
  try {
    const template = HtmlService.createTemplateFromFile('Index');
    template.initialData = JSON.stringify({
      appName: 'QTDND Yên Thọ - Lương & Chấm Công 2027 Pro',
      serverTime: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss')
    });
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
      timestamp: new Date()
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
      postData = JSON.parse(e.postData.contents);
    }
    const action = postData.action || '';

    // Khởi tạo CSDL
    if (action === 'setupDatabase' || action === 'initDatabase') {
      khoiTaoHeThongCSDL();
      return createJsonResponse({ status: 'success', message: 'Đã cập nhật cấu trúc 13 Sheets CSDL thành công' });
    }

    ensureDatabaseSchema();

    // Xác thực đăng nhập
    if (action === 'login') {
      const res = loginUser(postData.username, postData.password);
      logAuditAction(postData.username, 'Web Client', 'ĐĂNG_NHẬP', res.status);
      return createJsonResponse(res);
    }

    // Lưu hồ sơ nhân sự
    if (action === 'saveStaff') {
      const res = saveStaff(postData.payload);
      logAuditAction(postData.user || 'Admin', 'Web Client', 'LƯU_HỒ_SƠ_CBNV', postData.payload.maNV);
      return createJsonResponse(res);
    }

    // Lưu chấm công tháng
    if (action === 'saveTimesheets') {
      const res = saveTimesheets(postData.period, postData.payload);
      logAuditAction(postData.user || 'Kế toán', 'Web Client', 'CHẤM_CÔNG_THÁNG', postData.period);
      return createJsonResponse(res);
    }

    // Khóa sổ bảng lương vĩnh viễn
    if (action === 'lockPayroll') {
      const res = lockMonthlyPayroll(postData.period, postData.payload);
      logAuditAction(postData.user || 'Lãnh đạo', 'Web Client', 'KHÓA_SỔ_BẢNG_LƯƠNG', postData.period);
      return createJsonResponse(res);
    }

    // Gửi phản hồi thắc mắc lương
    if (action === 'submitFeedback') {
      const res = submitFeedback(postData.payload);
      logAuditAction(postData.payload.maNV || 'CBNV', 'Web Client', 'GỬI_PHẢN_HỒI_LƯƠNG', postData.payload.kyLuong);
      return createJsonResponse(res);
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
