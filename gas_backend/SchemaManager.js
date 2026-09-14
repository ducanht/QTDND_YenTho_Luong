/**
 * =========================================================================
 * SCHEMA MANAGER - SELF-HEALING DATABASE ENGINE (ZERO DATA LOSS)
 * Dự án: QTDND Yên Thọ - Quản trị Lương, Nhân sự, Chấm công & KPI 2027 Pro V2
 * Tự động kiểm tra tính toàn vẹn của 13 Sheets CSDL
 * Tự động bổ sung cột mới nếu thiếu mà bảo toàn 100% dữ liệu cũ
 * =========================================================================
 */

const SHEET_DEFINITIONS = {
  DM_NS: {
    name: 'DM_NS',
    createFn: 'taoSheet_DM_NS',
    headers: [
      'Mã NV', 'Họ và tên', 'Chức danh', 'Khối phòng ban', 'Điện thoại', 'Email',
      'Ngày sinh', 'Giới tính', 'Số CCCD', 'Ngày cấp CCCD', 'Nơi cấp CCCD',
      'Địa chỉ thường trú', 'Ngày vào làm', 'Trạng thái', 'Số NPT',
      'Số tài khoản NH', 'Tên ngân hàng', 'Mã số thuế', 'Số sổ BHXH', 'Link ảnh thẻ', 'Ghi chú', 'Mức đóng BHXH'
    ]
  },
  LS_CONGTAC: {
    name: 'LS_CONGTAC',
    createFn: 'taoSheet_LS_CONGTAC',
    headers: [
      'Mã bản ghi', 'Mã NV', 'Họ và tên', 'Số Quyết định', 'Ngày quyết định',
      'Từ ngày', 'Đến ngày', 'Mã vị trí', 'Chức danh công tác', 'Bậc',
      'Hệ số lương', 'Tỷ lệ KPI trần', 'Tỷ lệ Thưởng trần', 'Phụ cấp trách nhiệm',
      'Thù lao quản trị', 'Lý do điều chỉnh', 'Trạng thái'
    ]
  },
  DM_CHUCDANH: {
    name: 'DM_CHUCDANH',
    createFn: 'taoSheet_DM_CHUCDANH',
    headers: [
      'Mã vị trí', 'Tên vị trí chức danh', 'Khối', 'Bậc', 'Số lượng',
      'PA1 Hệ số', 'PA2 Hệ số (Chuẩn)', 'PA3 Hệ số',
      'PA1 KPI', 'PA2 KPI', 'PA3 KPI',
      'PA1 Thưởng', 'PA2 Thưởng', 'PA3 Thưởng',
      'Phụ cấp TN ₫', 'Thù lao QT ₫', 'Ngày hiệu lực', 'Quyết định phê duyệt'
    ]
  },
  DM_KPI: {
    name: 'DM_KPI',
    createFn: 'taoSheet_DM_KPI',
    headers: [
      'Mã KPI', 'Tên chỉ số KPI', 'Khối áp dụng', 'Đơn vị tính', 'Trọng số mặc định', 'Tiêu chuẩn đánh giá / Công thức'
    ]
  },
  CHAM_CONG: {
    name: 'CHAM_CONG',
    createFn: 'taoSheet_CHAM_CONG',
    headers: [
      'Kỳ (YYYY-MM)', 'Mã NV', 'Họ và tên', 'Công chuẩn', 'Công thực tế',
      'Nghỉ phép', 'Nghỉ không lương', 'Nghỉ chế độ', 'Tổng công tính lương', 'Ghi chú', 'Thời gian cập nhật'
    ]
  },
  DG_KPI: {
    name: 'DG_KPI',
    createFn: 'taoSheet_DG_KPI',
    headers: [
      'Mã đánh giá', 'Kỳ (YYYY-MM)', 'Mã NV', 'Họ và tên', 'Mã KPI',
      'Chỉ tiêu giao', 'Thực tế thực hiện', 'Tỷ lệ đạt %', 'Điểm trọng số', 'Xếp loại tháng'
    ]
  },
  BL_LICHSU: {
    name: 'BL_LICHSU',
    createFn: 'taoSheet_BL_LICHSU',
    headers: [
      'Kỳ lương', 'Mã NV', 'Họ và tên', 'Chức danh', 'Hệ số lương',
      'Công chuẩn', 'Công thực', 'Lương ngạch bậc', 'Hệ số KPI', 'Lương KPI',
      'Tiền thưởng', 'Phụ cấp trách nhiệm', 'Thù lao quản trị', 'Ăn trưa',
      'Xăng xe', 'Điện thoại', 'Trang phục', 'Khoán khác', 'Tổng thu nhập Gross',
      'BHXH NLĐ (10.5%)', 'Giảm trừ gia cảnh', 'Thu nhập tính thuế', 'Thuế TNCN',
      'Thực Lĩnh (Net)', 'BHXH Đơn vị (21.5%)', 'Ngày chốt & Khóa sổ'
    ]
  },
  TAIKHOAN: {
    name: 'TAIKHOAN',
    createFn: 'taoSheet_TAIKHOAN',
    headers: [
      'Mã tài khoản', 'Tên đăng nhập / Mã NV', 'Họ và tên', 'Mật khẩu mã hóa',
      'Email', 'Vai trò RBAC', 'Trạng thái', 'Lần đăng nhập cuối', 'Ghi chú'
    ]
  },
  AUDIT_LOG: {
    name: 'AUDIT_LOG',
    createFn: 'taoSheet_AUDIT_LOG',
    headers: [
      'Mã log', 'Thời gian (GMT+7)', 'Người thực hiện', 'Địa chỉ IP / Thiết bị',
      'Hành động', 'Chi tiết thao tác', 'Trạng thái'
    ]
  },
  PHAN_HOI: {
    name: 'PHAN_HOI',
    createFn: 'taoSheet_PHAN_HOI',
    headers: [
      'Mã phản hồi', 'Kỳ lương thắc mắc', 'Mã NV', 'Họ và tên', 'Nội dung câu hỏi',
      'Thời gian gửi', 'Người tiếp nhận', 'Nội dung giải trình', 'Trạng thái xử lý'
    ]
  },
  THAM_SO: {
    name: 'THAM_SO',
    createFn: 'taoSheet_THAM_SO',
    headers: [
      'Mã tham số', 'Tên tham số', 'Giá trị', 'Đơn vị tính', 'Ghi chú & Căn cứ'
    ]
  },
  DM_PHU_CAP: {
    name: 'DM_PHU_CAP',
    createFn: 'taoSheet_DM_PHU_CAP',
    headers: [
      'Mã khoản', 'Tên khoản phụ cấp / khoán', 'Phân loại chi', 'Cột bảng lương',
      'Tính BHXH?', 'Tính Thuế TNCN?', 'Mức miễn thuế tối đa ₫', 'Phương thức tính',
      'Căn cứ pháp lý & Quy chế', 'Ghi chú nghiệp vụ'
    ]
  },
  LS_KHOAN: {
    name: 'LS_KHOAN',
    createFn: 'taoSheet_LS_KHOAN',
    headers: [
      'Mã bản ghi', 'Mã khoản', 'Tên khoản khoán / phụ cấp', 'Đối tượng áp dụng',
      'Mức khoán cũ ₫', 'Mức khoán mới ₫', 'Đơn vị tính', 'Từ ngày', 'Đến ngày',
      'Số quyết định', 'Ngày quyết định', 'Người ký', 'Lý do thay đổi', 'Trạng thái'
    ]
  }
};

/**
 * Tự động kiểm tra và chữa lành cấu trúc 13 sheets (Self-Healing)
 */
function ensureDatabaseSchema() {
  const ss = getSpreadsheet();
  if (!ss) return;

  Object.keys(SHEET_DEFINITIONS).forEach(sheetKey => {
    const def = SHEET_DEFINITIONS[sheetKey];
    let sheet = ss.getSheetByName(def.name);

    if (!sheet) {
      // Nếu sheet chưa tồn tại, gọi hàm tạo mới kèm định dạng & dữ liệu mẫu
      Logger.log(`Tạo mới Sheet: ${def.name}`);
      if (typeof this[def.createFn] === 'function') {
        this[def.createFn](ss);
      } else {
        sheet = ss.insertSheet(def.name);
        sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
        sheet.setFrozenRows(1);
      }
    } else {
      // Nếu sheet đã tồn tại, kiểm tra xem có cột nào mới chưa có không (Zero Data Loss)
      const lastCol = Math.max(sheet.getLastColumn(), 1);
      const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

      const missingHeaders = [];
      def.headers.forEach(h => {
        if (!existingHeaders.includes(h)) {
          missingHeaders.push(h);
        }
      });

      if (missingHeaders.length > 0) {
        Logger.log(`Sheet ${def.name}: Bổ sung ${missingHeaders.length} cột mới: ${missingHeaders.join(', ')}`);
        const startNewCol = existingHeaders.length + 1;
        const newColRange = sheet.getRange(1, startNewCol, 1, missingHeaders.length);
        newColRange.setValues([missingHeaders]);
        newColRange.setBackground('#17365d')
                    .setFontColor('#ffffff')
                    .setFontWeight('bold')
                    .setFontSize(10)
                    .setVerticalAlignment('middle');
      }
    }
  });
}
