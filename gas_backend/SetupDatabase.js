/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG KHỞI TẠO CSDL GOOGLE SHEETS CHUẨN HÓA
 * HỆ THỐNG QUẢN TRỊ LƯƠNG, NHÂN SỰ & CHẤM CÔNG - QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
 * =========================================================================================
 * 
 * HƯỚNG DẪN DÙNG:
 * 1. Dán ID Google Sheet của bạn vào biến SPREADSHEET_ID dưới đây.
 * 2. Chọn hàm `khoiTaoHeThongCSDL` và bấm "Chạy" (Run).
 * 3. Script sẽ tự động tạo 11 sheet với tên viết tắt ngắn gọn, kẻ bảng, tô màu Navy,
 *    cố định hàng/cột (Freeze), định dạng số tiền, ngày tháng, phần trăm và nạp sẵn dữ liệu mẫu.
 */

// ID GOOGLE SHEET CHÍNH THỨC ĐÃ ĐƯỢC KHAI BÁO TẬP TRUNG TẠI Code.js:
// SPREADSHEET_ID = "1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8"

// BẢNG MÀU CHUẨN THƯƠNG HIỆU NGÂN QUỸ / QTDND YÊN THỌ
const STYLES = {
  HEADER_BG: '#17365d',     // Navy trang nhã
  HEADER_COLOR: '#ffffff',  // Chữ trắng
  ROW_EVEN: '#f8fafc',      // Xen kẽ hàng
  ROW_ODD: '#ffffff',
  BORDER_COLOR: '#cbd5e1'
};

/**
 * HÀM CHÍNH: KHỞI TẠO TOÀN BỘ 11 BẢNG DỮ LIỆU
 */
function khoiTaoHeThongCSDL() {
  const ss = laySpreadsheet();
  Logger.log("Bắt đầu khởi tạo CSDL trên bảng tính: " + ss.getName());

  // 1. DM_NS (Danh mục Nhân sự 360°)
  taoSheet_DM_NS(ss);

  // 2. LS_CONGTAC (Lịch sử Công tác & Hệ số lương)
  taoSheet_LS_CONGTAC(ss);

  // 3. DM_CHUCDANH (Khung Chức danh & Hệ số PA1/PA2/PA3)
  taoSheet_DM_CHUCDANH(ss);

  // 4. DM_KPI (Từ điển Chỉ số KPI nghiệp vụ)
  taoSheet_DM_KPI(ss);

  // 5. CHAM_CONG (Chấm công & Ngày phép tháng)
  taoSheet_CHAM_CONG(ss);

  // 6. DG_KPI (Đánh giá chi tiết KPI tháng)
  taoSheet_DG_KPI(ss);

  // 7. BL_LICHSU (Lịch sử Bảng lương khóa sổ vĩnh viễn)
  taoSheet_BL_LICHSU(ss);

  // 8. TAIKHOAN (Quản lý Tài khoản & Phân quyền)
  taoSheet_TAIKHOAN(ss);

  // 9. AUDIT_LOG (Nhật ký truy cập & Thao tác bảo mật)
  taoSheet_AUDIT_LOG(ss);

  // 10. PHAN_HOI (Hộp thư phản hồi thắc mắc lương)
  taoSheet_PHAN_HOI(ss);

  // 11. THAM_SO (Tham số chung & Tỷ lệ BHXH/Thuế)
  taoSheet_THAM_SO(ss);

  // 12. DM_PHU_CAP (Danh mục Phụ cấp, Khoán & Quy tắc Thuế/BHXH)
  taoSheet_DM_PHU_CAP(ss);

  // 13. LS_KHOAN (Lịch sử thay đổi định mức phụ cấp & khoán)
  taoSheet_LS_KHOAN(ss);

  // Xóa sheet mặc định "Sheet1" hoặc "Trang tính 1" nếu còn trống
  xoaSheetMacDinh(ss);

  Logger.log("✅ HOÀN TẤT KHỞI TẠO 13 SHEETS CSDL CHUẨN HÓA THÀNH CÔNG!");
}

/**
 * Hàm lấy đối tượng Spreadsheet từ ID hoặc Sheet đang hoạt động
 */
function laySpreadsheet() {
  return getSpreadsheet();
}

/**
 * Hàm phụ trợ định dạng hàng tiêu đề và cố định hàng cột
 */
function formatHeaderAndFreeze(sheet, headers, colWidths, freezeRows = 1, freezeCols = 0) {
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Định dạng hàng tiêu đề
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground(STYLES.HEADER_BG)
             .setFontColor(STYLES.HEADER_COLOR)
             .setFontWeight('bold')
             .setFontSize(10)
             .setFontFamily('Arial')
             .setVerticalAlignment('middle')
             .setWrap(true);
  sheet.setRowHeight(1, 38);

  // Cố định hàng và cột
  if (freezeRows > 0) sheet.setFrozenRows(freezeRows);
  if (freezeCols > 0) sheet.setFrozenColumns(freezeCols);

  // Chỉnh độ rộng từng cột
  colWidths.forEach((w, idx) => {
    sheet.setColumnWidth(idx + 1, w);
  });
}

// =========================================================================================
// 1. SHEET: DM_NS (Danh mục Nhân sự 360°)
// =========================================================================================
function taoSheet_DM_NS(ss) {
  let sh = ss.getSheetByName('DM_NS') || ss.insertSheet('DM_NS');
  const headers = [
    'Mã NV', 'Họ và tên', 'Chức danh', 'Khối phòng ban', 'Điện thoại', 'Email',
    'Ngày sinh', 'Giới tính', 'Số CCCD', 'Ngày cấp CCCD', 'Nơi cấp CCCD',
    'Địa chỉ thường trú', 'Ngày vào làm', 'Trạng thái', 'Số NPT',
    'Số tài khoản NH', 'Tên ngân hàng', 'Mã số thuế', 'Số sổ BHXH', 'Link ảnh thẻ', 'Ghi chú'
  ];
  const widths = [80, 160, 130, 110, 110, 170, 95, 75, 120, 95, 120, 220, 95, 100, 70, 120, 130, 100, 100, 200, 150];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  // Dữ liệu mẫu 12 CBNV thực tế QTDND Yên Thọ
  const sampleData = [
    ['NV01', 'Nguyễn Thị Sinh', 'Thẩm định tài sản', 'Tín dụng', '0388232844', 'Sinhtdyt@gmail.com', '09/03/1962', 'Nữ', '038162004401', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '09/03/2005', 'ĐANG LÀM', 0, '10287463801', 'Agribank Quý Lộc', '8012345601', '3809123401', '', 'Chính thức: 09/03/2006. Cán bộ thẩm định tài sản'],
    ['NV02', 'Nguyễn Thị Mến', 'Kế toán trưởng', 'Kế toán', '0349547779', 'nguyenmen.yt.83@gmail.com', '08/03/1983', 'Nữ', '038183010925', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '09/03/2007', 'ĐANG LÀM', 2, '10287463802', 'Agribank Quý Lộc', '8012345602', '3809123402', '', 'Chính thức: 08/03/2008. Kế toán trưởng'],
    ['NV03', 'Nguyễn Văn Sơn', 'UV HĐQT - Giám đốc', 'Điều hành', '0941562789', 'nguyenvansontdyt@gmail.com', '09/10/1980', 'Nam', '038080021750', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '09/10/2012', 'ĐANG LÀM', 1, '10287463803', 'Agribank Quý Lộc', '8012345603', '3809123403', '', 'Chính thức: 09/10/2013. UV HĐQT - Giám đốc điều hành'],
    ['NV04', 'Bùi Thị Thảo', 'Trưởng ban kiểm soát', 'Kiểm soát', '0839062825', 'thao.bui0282@gmail.com', '19/11/1982', 'Nữ', '038182047645', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '19/11/2012', 'ĐANG LÀM', 1, '10287463804', 'Agribank Quý Lộc', '8012345604', '3809123404', '', 'Chính thức: 19/11/2013. Trưởng ban kiểm soát chuyên trách'],
    ['NV05', 'Nguyễn Hữu Nhân', 'CB tín dụng', 'Tín dụng', '0949116817', 'qtdyentho.huunhan@gmail.com', '30/01/1985', 'Nam', '038085009285', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '30/01/2013', 'ĐANG LÀM', 1, '10287463805', 'Agribank Quý Lộc', '8012345605', '3809123405', '', 'Chính thức: 30/01/2014. Cán bộ tín dụng địa bàn'],
    ['NV06', 'Trịnh Thị Hiền', 'KST - Kiểm toán nội bộ', 'Kiểm soát', '0948784333', 'qtdyentho.hienha@gmail.com', '21/05/1983', 'Nữ', '038183049074', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '21/05/2014', 'ĐANG LÀM', 1, '10287463806', 'Agribank Quý Lộc', '8012345606', '3809123406', '', 'Chính thức: 21/05/2015. Kiểm soát viên - Kiểm toán nội bộ'],
    ['NV07', 'Trịnh Đức Anh', 'Chủ tịch HĐQT', 'HĐQT', '0965122111', 'ducanht@gmail.com', '03/06/1986', 'Nam', '038086010115', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '03/06/2016', 'ĐANG LÀM', 1, '10287463807', 'Agribank Quý Lộc', '8012345607', '3809123407', '', 'Chính thức: 03/06/2017. Chủ tịch Hội đồng quản trị'],
    ['NV08', 'Vũ Thị Hiền', 'UV HĐQT', 'HĐQT', '0983502181', 'qtdyentho.vuhien@gmail.com', '04/06/1986', 'Nữ', '038186037786', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '04/06/2018', 'ĐANG LÀM', 0, '10287463808', 'Agribank Quý Lộc', '8012345608', '3809123408', '', 'Chính thức: 04/06/2019. Ủy viên Hội đồng quản trị'],
    ['NV09', 'Trần Như Huyền', 'CB tín dụng', 'Tín dụng', '0985709609', 'Huyennhutran@gmail.com', '11/12/1989', 'Nữ', '038189039532', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '11/12/2020', 'ĐANG LÀM', 1, '10287463809', 'Agribank Quý Lộc', '8012345609', '3809123409', '', 'Chính thức: 11/12/2021. Cán bộ tín dụng'],
    ['NV10', 'Hoàng Thị Lan', 'Kế toán viên', 'Kế toán', '0965178666', 'hoanglan1289@gmail.com', '08/10/1989', 'Nữ', '038189040044', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '08/10/2021', 'ĐANG LÀM', 1, '10287463810', 'Agribank Quý Lộc', '8012345610', '3809123410', '', 'Chính thức: 08/10/2022. Kế toán viên thanh toán'],
    ['NV11', 'Phạm Thị Thảo', 'Thủ quỹ', 'Kế toán', '0965567596', 'qtdyentho.phamthao@gmail.com', '06/09/1990', 'Nữ', '038190051894', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '06/09/2023', 'ĐANG LÀM', 0, '10287463811', 'Agribank Quý Lộc', '8012345611', '3809123411', '', 'Chính thức: 06/09/2024. Thủ quỹ cơ quan'],
    ['NV12', 'Lưu Thị Định', 'CB tín dụng', 'Tín dụng', '0961007855', 'qtdyentho.luudinh@gmail.com', '06/09/1989', 'Nữ', '038189028302', '10/05/2021', 'Cục CSQLHC về TTXH', 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá', '06/09/2024', 'ĐANG LÀM', 0, '10287463812', 'Agribank Quý Lộc', '8012345612', '3809123412', '', 'Chính thức dự kiến: 06/09/2025. Cán bộ tín dụng']
  ];
  sh.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);

  // Định dạng cột: Căn giữa mã, ngày, trạng thái
  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("G2:G100").setHorizontalAlignment("center");
  sh.getRange("H2:H100").setHorizontalAlignment("center");
  sh.getRange("J2:J100").setHorizontalAlignment("center");
  sh.getRange("M2:M100").setHorizontalAlignment("center");
  sh.getRange("N2:N100").setHorizontalAlignment("center");
  sh.getRange("O2:O100").setHorizontalAlignment("right");
}

// =========================================================================================
// 2. SHEET: LS_CONGTAC (Lịch sử Công tác & Hệ số lương hưởng)
// =========================================================================================
function taoSheet_LS_CONGTAC(ss) {
  let sh = ss.getSheetByName('LS_CONGTAC') || ss.insertSheet('LS_CONGTAC');
  const headers = [
    'Mã bản ghi', 'Mã NV', 'Họ và tên', 'Số Quyết định', 'Ngày quyết định',
    'Từ ngày', 'Đến ngày', 'Mã vị trí', 'Chức danh công tác', 'Bậc',
    'Hệ số lương', 'Tỷ lệ KPI trần', 'Tỷ lệ Thưởng trần', 'Phụ cấp trách nhiệm',
    'Thù lao quản trị', 'Lý do điều chỉnh', 'Trạng thái'
  ];
  const widths = [110, 80, 160, 130, 95, 95, 95, 80, 140, 60, 90, 95, 95, 120, 120, 180, 90];
  formatHeaderAndFreeze(sh, headers, widths, 1, 3);

  const sample = [
    ['LS_NV01_2027', 'NV01', 'Nguyễn Thị Sinh', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P08', 'Thẩm định tài sản', 3, 3.10, 0.15, 0.08, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV02_2027', 'NV02', 'Nguyễn Thị Mến', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P05', 'Kế toán trưởng', 2, 3.90, 0.18, 0.08, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV03_2027', 'NV03', 'Nguyễn Văn Sơn', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P02', 'UV HĐQT - Giám đốc', 2, 4.80, 0.25, 0.12, 800000, 2000000, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV04_2027', 'NV04', 'Bùi Thị Thảo', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P04', 'Trưởng ban kiểm soát', 2, 4.00, 0.18, 0.08, 700000, 2000000, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV05_2027', 'NV05', 'Nguyễn Hữu Nhân', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P08', 'CB tín dụng', 2, 2.85, 0.15, 0.06, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV06_2027', 'NV06', 'Trịnh Thị Hiền', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P07', 'KST - Kiểm toán nội bộ', 2, 3.30, 0.15, 0.06, 500000, 1200000, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV07_2027', 'NV07', 'Trịnh Đức Anh', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P01', 'Chủ tịch HĐQT', 3, 5.20, 0.25, 0.12, 1000000, 3000000, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV08_2027', 'NV08', 'Vũ Thị Hiền', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P06', 'UV HĐQT', 2, 3.50, 0.15, 0.06, 500000, 1000000, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV09_2027', 'NV09', 'Trần Như Huyền', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P08', 'CB tín dụng', 2, 2.85, 0.15, 0.06, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV10_2027', 'NV10', 'Hoàng Thị Lan', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P09', 'Kế toán viên', 2, 2.65, 0.13, 0.05, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV11_2027', 'NV11', 'Phạm Thị Thảo', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P10', 'Thủ quỹ', 1, 2.10, 0.10, 0.04, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI'],
    ['LS_NV12_2027', 'NV12', 'Lưu Thị Định', 'NQ-01/2027/NQ-HĐQT', '05/01/2027', '01/01/2027', '31/12/2099', 'P08', 'CB tín dụng', 1, 2.60, 0.15, 0.05, 0, 0, 'Áp dụng khung lương mới 2027', 'HIỆN TẠI']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  // Định dạng số & ngày
  sh.getRange("A2:B100").setHorizontalAlignment("center");
  sh.getRange("E2:G100").setHorizontalAlignment("center");
  sh.getRange("H2:H100").setHorizontalAlignment("center");
  sh.getRange("J2:J100").setHorizontalAlignment("center");
  sh.getRange("Q2:Q100").setHorizontalAlignment("center");

  sh.getRange("K2:K100").setNumberFormat("0.00").setHorizontalAlignment("right");
  sh.getRange("L2:M100").setNumberFormat("0.0%").setHorizontalAlignment("right");
  sh.getRange("N2:O100").setNumberFormat('#,##0 "₫"').setHorizontalAlignment("right");
}

// =========================================================================================
// 3. SHEET: DM_CHUCDANH (Khung Vị trí & Hệ số PA1/PA2/PA3)
// =========================================================================================
function taoSheet_DM_CHUCDANH(ss) {
  let sh = ss.getSheetByName('DM_CHUCDANH') || ss.insertSheet('DM_CHUCDANH');
  const headers = [
    'Mã vị trí', 'Tên vị trí chức danh', 'Khối', 'Bậc', 'Số lượng',
    'PA1 Hệ số', 'PA2 Hệ số (Chuẩn)', 'PA3 Hệ số',
    'PA1 KPI', 'PA2 KPI', 'PA3 KPI',
    'PA1 Thưởng', 'PA2 Thưởng', 'PA3 Thưởng',
    'Phụ cấp TN ₫', 'Thù lao QT ₫', 'Ngày hiệu lực', 'Quyết định phê duyệt'
  ];
  const widths = [80, 160, 100, 55, 65, 85, 105, 85, 80, 80, 80, 85, 85, 85, 110, 110, 95, 150];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  const sample = [
    ['P01', 'Chủ tịch HĐQT', 'Lãnh đạo', 1, 1, 4.8, 5.2, 5.6, 0.20, 0.25, 0.30, 0.10, 0.12, 0.15, 1000000, 3000000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P02', 'Giám đốc', 'Điều hành', 2, 1, 4.4, 4.8, 5.2, 0.20, 0.25, 0.30, 0.10, 0.12, 0.15, 800000, 2000000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P03', 'Phó Giám đốc', 'Điều hành', 3, 0, 3.9, 4.2, 4.6, 0.18, 0.22, 0.25, 0.08, 0.10, 0.12, 600000, 1500000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P04', 'Trưởng BKS', 'Kiểm soát', 4, 1, 3.7, 4.0, 4.3, 0.15, 0.18, 0.22, 0.06, 0.08, 0.10, 700000, 2000000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P05', 'Kế toán trưởng', 'Chuyên môn', 5, 1, 3.6, 3.9, 4.2, 0.15, 0.18, 0.22, 0.06, 0.08, 0.10, 0, 0, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P06', 'Ủy viên HĐQT', 'Quản trị', 6, 1, 3.2, 3.5, 3.8, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08, 500000, 1000000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P07', 'Kiểm soát viên', 'Kiểm soát', 7, 2, 3.0, 3.3, 3.6, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08, 500000, 1200000, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P08', 'Cán bộ tín dụng', 'Nghiệp vụ', 8, 4, 2.6, 2.85, 3.1, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08, 0, 0, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P09', 'Kế toán viên', 'Nghiệp vụ', 9, 1, 2.4, 2.65, 2.9, 0.10, 0.13, 0.16, 0.04, 0.05, 0.07, 0, 0, '01/01/2027', 'NQ-01/2027/NQ-HĐQT'],
    ['P10', 'Bảo vệ - Thủ quỹ', 'Hỗ trợ', 10, 1, 1.9, 2.1, 2.3, 0.08, 0.10, 0.12, 0.03, 0.04, 0.05, 0, 0, '01/01/2027', 'NQ-01/2027/NQ-HĐQT']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("D2:E100").setHorizontalAlignment("center");
  sh.getRange("Q2:Q100").setHorizontalAlignment("center");

  sh.getRange("F2:H100").setNumberFormat("0.00").setHorizontalAlignment("right");
  sh.getRange("I2:N100").setNumberFormat("0.0%").setHorizontalAlignment("right");
  sh.getRange("O2:P100").setNumberFormat('#,##0 "₫"').setHorizontalAlignment("right");
}

// =========================================================================================
// 4. SHEET: DM_KPI (Từ điển Chỉ số KPI nghiệp vụ)
// =========================================================================================
function taoSheet_DM_KPI(ss) {
  let sh = ss.getSheetByName('DM_KPI') || ss.insertSheet('DM_KPI');
  const headers = ['Mã KPI', 'Tên chỉ số KPI', 'Khối áp dụng', 'Đơn vị tính', 'Trọng số mặc định', 'Tiêu chuẩn đánh giá / Công thức'];
  const widths = [95, 200, 120, 95, 110, 300];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  const sample = [
    ['KPI_TD_01', 'Tăng trưởng dư nợ tín dụng', 'Tín dụng', 'Triệu đồng', 0.35, 'Đạt % theo kế hoạch giao tháng; vượt kế hoạch thưởng điểm'],
    ['KPI_TD_02', 'Kiểm soát tỷ lệ nợ xấu', 'Tín dụng', '%', 0.25, 'Dưới 0.8% đạt điểm tối đa; từ 0.8% - 1.5% đạt 80%; trên 1.5% trừ điểm'],
    ['KPI_TD_03', 'Tiến độ thu hồi nợ đến hạn', 'Tín dụng', '%', 0.20, 'Tỷ lệ nợ gốc và lãi thu hồi đúng hạn trong tháng'],
    ['KPI_KT_01', 'Độ chính xác hạch toán kế toán', 'Kế toán', 'Lỗi sai', 0.35, 'Không phát sinh sai sót chứng từ, cân đối bảng CĐKT đúng hạn'],
    ['KPI_KT_02', 'Huy động vốn tiền gửi tiết kiệm', 'Kế toán / Quỹ', 'Triệu đồng', 0.25, 'Doanh số tiền gửi dân cư mở mới và tái tục trong tháng'],
    ['KPI_KS_01', 'Kiểm soát tuân thủ & An toàn kho quỹ', 'Kiểm soát', 'Vụ việc', 0.40, '100% món vay và hạch toán được kiểm tra giám sát an toàn'],
    ['KPI_CC_01', 'Chuyên cần & Kỷ luật lao động', 'Toàn Quỹ', 'Điểm/Ngày', 0.15, 'Chấp hành nghiêm giờ giấc mở két, giao dịch viên chuẩn mực']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("D2:D100").setHorizontalAlignment("center");
  sh.getRange("E2:E100").setNumberFormat("0.0%").setHorizontalAlignment("right");
}

// =========================================================================================
// 5. SHEET: CHAM_CONG (Chấm công & Ngày phép tháng)
// =========================================================================================
function taoSheet_CHAM_CONG(ss) {
  let sh = ss.getSheetByName('CHAM_CONG') || ss.insertSheet('CHAM_CONG');
  const headers = [
    'Kỳ lương', 'Mã NV', 'Họ và tên', 'Chức danh', 'Công chuẩn',
    'Công đi làm', 'Nghỉ phép năm', 'Nghỉ lễ tết', 'Nghỉ ốm BHXH', 'Nghỉ không lương',
    'Tổng công tính lương', 'Tỷ lệ công', 'Ghi chú chấm công', 'Người duyệt', 'Ngày duyệt'
  ];
  const widths = [85, 80, 160, 130, 80, 80, 90, 80, 85, 95, 120, 85, 180, 130, 95];
  formatHeaderAndFreeze(sh, headers, widths, 1, 3);

  // Định dạng
  sh.getRange("A2:B100").setHorizontalAlignment("center");
  sh.getRange("E2:K100").setHorizontalAlignment("right").setNumberFormat("0.0");
  sh.getRange("L2:L100").setHorizontalAlignment("right").setNumberFormat("0.0%");
  sh.getRange("O2:O100").setHorizontalAlignment("center");
}

// =========================================================================================
// 6. SHEET: DG_KPI (Đánh giá chi tiết KPI tháng)
// =========================================================================================
function taoSheet_DG_KPI(ss) {
  let sh = ss.getSheetByName('DG_KPI') || ss.insertSheet('DG_KPI');
  const headers = [
    'Mã ĐG', 'Kỳ lương', 'Mã NV', 'Họ và tên', 'Mã KPI', 'Tên chỉ số KPI',
    'Chỉ tiêu giao', 'Kết quả đạt', 'Tỷ lệ hoàn thành', 'Trọng số', 'Điểm quy đổi', 'Nhận xét của Lãnh đạo'
  ];
  const widths = [100, 85, 80, 160, 95, 180, 100, 100, 105, 80, 90, 220];
  formatHeaderAndFreeze(sh, headers, widths, 1, 4);

  sh.getRange("A2:C100").setHorizontalAlignment("center");
  sh.getRange("E2:E100").setHorizontalAlignment("center");
  sh.getRange("I2:J100").setNumberFormat("0.0%").setHorizontalAlignment("right");
  sh.getRange("K2:K100").setNumberFormat("0.0").setHorizontalAlignment("right");
}

// =========================================================================================
// 7. SHEET: BL_LICHSU (Lịch sử Bảng lương khóa sổ vĩnh viễn - Chi tiết các khoản khoán)
// =========================================================================================
function taoSheet_BL_LICHSU(ss) {
  let sh = ss.getSheetByName('BL_LICHSU') || ss.insertSheet('BL_LICHSU');
  const headers = [
    'Kỳ lương', 'Mã NV', 'Họ và tên', 'Chức danh', 'Hệ số lương', 'Công thực',
    'Lương ngạch bậc', 'Lương KPI', 'Tiền thưởng',
    'Ăn trưa', 'Xăng xe', 'Điện thoại', 'Trang phục', 'Công tác phí', 'Khoán khác', 'Tổng phụ cấp khoán',
    'Phụ cấp trách nhiệm', 'Thù lao QTK', 'Tổng Gross',
    'Lương đóng BHXH', 'BHXH NLĐ (8%)', 'BHYT NLĐ (1.5%)', 'BHTN NLĐ (1%)', 'Tổng BH NLĐ (10.5%)',
    'Thu nhập chịu thuế', 'Giảm trừ gia cảnh', 'Thu nhập tính thuế', 'Thuế TNCN (PIT)', 'THỰC LĨNH NET',
    'BHXH Quỹ (17.5%)', 'BHYT Quỹ (3%)', 'BHTN Quỹ (1%)', 'Tổng BH Quỹ (21.5%)', 'Tổng Chi Phí Quỹ',
    'Trạng thái', 'Ngày khóa sổ', 'Người duyệt'
  ];
  const widths = [
    85, 80, 160, 130, 80, 75,
    115, 105, 105,
    100, 95, 95, 100, 105, 95, 120,
    115, 110, 125,
    115, 100, 100, 100, 115,
    125, 115, 120, 110, 135,
    105, 100, 100, 120, 135,
    100, 95, 140
  ];
  formatHeaderAndFreeze(sh, headers, widths, 1, 3);

  sh.getRange("A2:B100").setHorizontalAlignment("center");
  sh.getRange("E2:F100").setHorizontalAlignment("right").setNumberFormat("0.00");
  sh.getRange("G2:AI100").setHorizontalAlignment("right").setNumberFormat('#,##0 "₫"');
  sh.getRange("AJ2:AK100").setHorizontalAlignment("center");
}

// =========================================================================================
// 8. SHEET: TAIKHOAN (Quản lý Tài khoản & Phân quyền)
// =========================================================================================
function taoSheet_TAIKHOAN(ss) {
  let sh = ss.getSheetByName('TAIKHOAN') || ss.insertSheet('TAIKHOAN');
  const headers = [
    'Mã tài khoản', 'Mã NV', 'Họ và tên', 'Tên đăng nhập', 'Mật khẩu Hash (SHA-256)',
    'Đổi pass lần đầu', 'Vai trò (Role)', 'Trạng thái', 'Lần login cuối', 'Số lần sai'
  ];
  const widths = [110, 80, 160, 120, 220, 110, 110, 100, 140, 80];
  formatHeaderAndFreeze(sh, headers, widths, 1, 3);

  // Mật khẩu mẫu "YenTho@2027" đã băm SHA-256:
  // "07c390cb30e1bb18b824346e4c703d1544321b0b534b150931bb484d8b63e9f4"
  const defaultHash = "07c390cb30e1bb18b824346e4c703d1544321b0b534b150931bb484d8b63e9f4";

  const sample = [
    ['ACC_NV01', 'NV01', 'Nguyễn Thị Sinh', '0388232844', defaultHash, true, 'NHAN_VIEN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV02', 'NV02', 'Nguyễn Thị Mến', '0349547779', defaultHash, true, 'KE_TOAN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV03', 'NV03', 'Nguyễn Văn Sơn', '0941562789', defaultHash, true, 'ADMIN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV04', 'NV04', 'Bùi Thị Thảo', '0839062825', defaultHash, true, 'KIEM_SOAT', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV05', 'NV05', 'Nguyễn Hữu Nhân', '0949116817', defaultHash, true, 'NHAN_VIEN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV06', 'NV06', 'Trịnh Thị Hiền', '0948784333', defaultHash, true, 'KIEM_SOAT', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV07', 'NV07', 'Trịnh Đức Anh', '0965122111', defaultHash, true, 'ADMIN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV08', 'NV08', 'Vũ Thị Hiền', '0983502181', defaultHash, true, 'ADMIN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV09', 'NV09', 'Trần Như Huyền', '0985709609', defaultHash, true, 'NHAN_VIEN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV10', 'NV10', 'Hoàng Thị Lan', '0965178666', defaultHash, true, 'KE_TOAN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV11', 'NV11', 'Phạm Thị Thảo', '0965567596', defaultHash, true, 'NHAN_VIEN', 'HOẠT ĐỘNG', '', 0],
    ['ACC_NV12', 'NV12', 'Lưu Thị Định', '0961007855', defaultHash, true, 'NHAN_VIEN', 'HOẠT ĐỘNG', '', 0]
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:B100").setHorizontalAlignment("center");
  sh.getRange("D2:D100").setHorizontalAlignment("center");
  sh.getRange("F2:H100").setHorizontalAlignment("center");
  sh.getRange("I2:I100").setHorizontalAlignment("center");
  sh.getRange("J2:J100").setHorizontalAlignment("right");
}

// =========================================================================================
// 9. SHEET: AUDIT_LOG (Nhật ký truy cập & Thao tác)
// =========================================================================================
function taoSheet_AUDIT_LOG(ss) {
  let sh = ss.getSheetByName('AUDIT_LOG') || ss.insertSheet('AUDIT_LOG');
  const headers = ['Mã log', 'Thời gian', 'Mã NV', 'Họ và tên', 'Vai trò', 'Hành động', 'Phân hệ', 'Chi tiết thao tác', 'Thiết bị / IP', 'Kết quả'];
  const widths = [110, 140, 80, 150, 100, 120, 130, 260, 150, 90];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  const sample = [
    ['LOG_001', '05/01/2027 08:00:15', 'NV07', 'Trịnh Đức Anh', 'ADMIN', 'DANG_NHAP', 'HỆ THỐNG', 'Đăng nhập thành công vào trang quản trị', 'Chrome / Windows', 'THÀNH CÔNG'],
    ['LOG_002', '05/01/2027 08:15:30', 'NV02', 'Nguyễn Thị Mến', 'KE_TOAN', 'SUA_CHAM_CONG', 'CHẤM CÔNG', 'Cập nhật ngày công tháng 01/2027 cho NV05 thành 22 ngày', 'Edge / Windows', 'THÀNH CÔNG']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("B2:B100").setHorizontalAlignment("center");
  sh.getRange("C2:C100").setHorizontalAlignment("center");
  sh.getRange("E2:G100").setHorizontalAlignment("center");
  sh.getRange("J2:J100").setHorizontalAlignment("center");
}

// =========================================================================================
// 10. SHEET: PHAN_HOI (Hộp thư phản hồi thắc mắc lương)
// =========================================================================================
function taoSheet_PHAN_HOI(ss) {
  let sh = ss.getSheetByName('PHAN_HOI') || ss.insertSheet('PHAN_HOI');
  const headers = [
    'Mã phản hồi', 'Kỳ lương', 'Mã NV', 'Họ và tên', 'Chủ đề thắc mắc',
    'Nội dung thắc mắc', 'Thời gian gửi', 'Trạng thái xử lý',
    'Cán bộ xử lý', 'Nội dung trả lời của Kế toán', 'Thời gian trả lời', 'Đánh giá hài lòng'
  ];
  const widths = [105, 85, 80, 160, 130, 240, 135, 110, 140, 250, 135, 110];
  formatHeaderAndFreeze(sh, headers, widths, 1, 4);

  sh.getRange("A2:C100").setHorizontalAlignment("center");
  sh.getRange("G2:H100").setHorizontalAlignment("center");
  sh.getRange("K2:L100").setHorizontalAlignment("center");
}

// =========================================================================================
// 11. SHEET: THAM_SO (Tham số chung & Tỷ lệ BHXH/Thuế)
// =========================================================================================
function taoSheet_THAM_SO(ss) {
  let sh = ss.getSheetByName('THAM_SO') || ss.insertSheet('THAM_SO');
  const headers = ['Mã tham số', 'Tên tham số', 'Giá trị cấu hình', 'Đơn vị tính', 'Ngày áp dụng', 'Ngày hết hạn', 'Căn cứ văn bản pháp lý', 'Ghi chú'];
  const widths = [130, 200, 130, 95, 95, 95, 220, 180];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  const sample = [
    ['BASIC_SALARY', 'Mức lương cơ bản làm căn cứ', 2500000, '₫/tháng', '01/01/2027', '31/12/2099', 'Nghị quyết Đại hội thành viên 2027', 'Căn cứ nhân hệ số vị trí'],
    ['BHXH_DON_VI', 'Tỷ lệ BHXH Quỹ gánh chịu', 0.175, '%', '01/07/2025', '31/12/2099', 'Luật BHXH 2024 / NĐ 158/2025', '17.5%'],
    ['BHYT_DON_VI', 'Tỷ lệ BHYT Quỹ gánh chịu', 0.030, '%', '01/01/2025', '31/12/2099', 'Luật BHYT sửa đổi', '3.0%'],
    ['BHTN_DON_VI', 'Tỷ lệ BHTN Quỹ gánh chịu', 0.010, '%', '01/01/2025', '31/12/2099', 'Luật Việc làm', '1.0%'],
    ['BHXH_NLD', 'Tỷ lệ BHXH người lao động nộp', 0.080, '%', '01/07/2025', '31/12/2099', 'Luật BHXH 2024 / NĐ 158/2025', '8.0%'],
    ['BHYT_NLD', 'Tỷ lệ BHYT người lao động nộp', 0.015, '%', '01/01/2025', '31/12/2099', 'Luật BHYT sửa đổi', '1.5%'],
    ['BHTN_NLD', 'Tỷ lệ BHTN người lao động nộp', 0.010, '%', '01/01/2025', '31/12/2099', 'Luật Việc làm', '1.0%'],
    ['PIT_BAN_THAN', 'Mức giảm trừ gia cảnh bản thân', 15500000, '₫/tháng', '01/01/2026', '31/12/2099', 'Luật Thuế TNCN sửa đổi', 'Mô phỏng 15.5 triệu/tháng'],
    ['PIT_PHU_THUOC', 'Mức giảm trừ người phụ thuộc', 6200000, '₫/người/tháng', '01/01/2026', '31/12/2099', 'Luật Thuế TNCN sửa đổi', 'Mô phỏng 6.2 triệu/người'],
    ['DINH_MUC_AN', 'Tiền ăn giữa ca định mức', 1200000, '₫/tháng', '01/01/2027', '31/12/2099', 'Quy chế chi tiêu nội bộ Quỹ', 'Chi theo ngày công thực tế'],
    ['DIEN_THOAI', 'Điện thoại công vụ bình quân', 300000, '₫/tháng', '01/01/2027', '31/12/2099', 'Quy chế chi tiêu nội bộ Quỹ', 'Khoán chi nghiệp vụ'],
    ['TRANG_PHUC', 'Trang phục công tác bình quân', 500000, '₫/tháng', '01/01/2027', '31/12/2099', 'Quy chế chi tiêu nội bộ Quỹ', 'Đồng phục ngành Quỹ'],
    ['XANG_XE', 'Xăng xe di chuyển công tác', 400000, '₫/tháng', '01/01/2027', '31/12/2099', 'Quy chế chi tiêu nội bộ Quỹ', 'Kiểm tra thực địa địa bàn'],
    ['DAO_TAO', 'Đào tạo nghiệp vụ bình quân', 200000, '₫/tháng', '01/01/2027', '31/12/2099', 'Quy chế chi tiêu nội bộ Quỹ', 'Nâng cao trình độ CBNV']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("D2:F100").setHorizontalAlignment("center");

  // Format số tiền dòng 1, 8, 9, 10, 11, 12, 13, 14
  [2, 9, 10, 11, 12, 13, 14, 15].forEach(r => {
    sh.getRange(r, 3).setNumberFormat('#,##0 "₫"').setHorizontalAlignment("right");
  });
  // Format tỷ lệ % dòng 2, 3, 4, 5, 6, 7
  [3, 4, 5, 6, 7, 8].forEach(r => {
    sh.getRange(r, 3).setNumberFormat("0.0%").setHorizontalAlignment("right");
  });
}

// =========================================================================================
// 12. SHEET: DM_PHU_CAP (Danh mục Phụ cấp, Khoán & Quy tắc Tính Thuế / BHXH)
// =========================================================================================
function taoSheet_DM_PHU_CAP(ss) {
  let sh = ss.getSheetByName('DM_PHU_CAP') || ss.insertSheet('DM_PHU_CAP');
  const headers = [
    'Mã khoản', 'Tên khoản phụ cấp / khoán', 'Phân loại chi', 'Cột bảng lương',
    'Tính BHXH?', 'Tính Thuế TNCN?', 'Mức miễn thuế tối đa ₫', 'Phương thức tính',
    'Căn cứ pháp lý & Quy chế', 'Ghi chú nghiệp vụ'
  ];
  const widths = [110, 200, 140, 130, 95, 120, 150, 140, 220, 200];
  formatHeaderAndFreeze(sh, headers, widths, 1, 2);

  const sample = [
    ['AN_TRUA', 'Tiền ăn giữa ca (ăn trưa)', 'KHOAN_CONG_VU', 'Ăn trưa', 'KHÔNG', 'THEO_DINH_MUC', 730000, 'THEO_NGAY_CONG', 'TT 111/2013 & TT 59/2015', 'Miễn BHXH; Miễn thuế tối đa 730k/tháng, phần vượt chịu thuế'],
    ['XANG_XE', 'Hỗ trợ xăng xe đi lại', 'KHOAN_CONG_VU', 'Xăng xe', 'KHÔNG', 'KHÔNG', 0, 'CO_DINH_THANG', 'TT 111/2013 & Quy chế Quỹ', 'Miễn BHXH; Miễn thuế TNCN nếu có quy chế khoán phục vụ công vụ'],
    ['DIEN_THOAI', 'Cước điện thoại liên lạc', 'KHOAN_CONG_VU', 'Điện thoại', 'KHÔNG', 'KHÔNG', 0, 'CO_DINH_THANG', 'TT 111/2013 & Quy chế Quỹ', 'Miễn BHXH; Miễn thuế TNCN khoán liên lạc nghiệp vụ'],
    ['TRANG_PHUC', 'Trang phục công tác', 'KHOAN_CONG_VU', 'Trang phục', 'KHÔNG', 'THEO_DINH_MUC', 416666, 'CO_DINH_THANG', 'TT 111/2013/TT-BTC', 'Miễn BHXH; Tiền mặt miễn tối đa 5tr/năm (~416.666 ₫/tháng)'],
    ['CONG_TAC_PHI', 'Công tác phí / Lưu trú', 'KHOAN_CONG_VU', 'Công tác phí', 'KHÔNG', 'KHÔNG', 0, 'THUC_TE_PHAT_SINH', 'TT 111/2013/TT-BTC', 'Miễn BHXH; Miễn thuế TNCN theo chứng từ thực tế / giấy đi đường'],
    ['KHOAN_KHAC', 'Khoán khác / Hỗ trợ', 'KHOAN_CONG_VU', 'Khoán khác', 'KHÔNG', 'THEO_QUY_CHE', 0, 'THUC_TE_PHAT_SINH', 'Quy chế Quỹ', 'Miễn BHXH; Xét thuế TNCN theo tính chất khoản chi'],
    ['PHU_CAP_TN', 'Phụ cấp chức vụ, trách nhiệm', 'PHU_CAP_LUONG', 'Phụ cấp trách nhiệm', 'CÓ', 'CÓ', 0, 'CO_DINH_THANG', 'Luật BHXH 2024 & TT 111/2013', 'Tính đóng BHXH; Chịu 100% Thuế TNCN'],
    ['THU_LAO_QT', 'Thù lao HĐQT / BKS', 'THU_LAO_QUAN_TRI', 'Thù lao QTK', 'KHÔNG', 'CÓ', 0, 'CO_DINH_THANG', 'Luật BHXH & TT 111/2013', 'Không đóng BHXH; Chịu 100% Thuế TNCN'],
    ['LUONG_KPI', 'Tiền lương hiệu quả KPI', 'LUONG_HIEU_QUA', 'Lương KPI', 'KHÔNG', 'CÓ', 0, 'THEO_KET_QUA_KPI', 'TT 111/2013/TT-BTC', 'Không đóng BHXH; Chịu 100% Thuế TNCN'],
    ['TIEN_THUONG', 'Tiền thưởng thi đua, lễ tết', 'TIEN_THUONG', 'Tiền thưởng', 'KHÔNG', 'CÓ', 0, 'THUC_TE_PHAT_SINH', 'Luật BHXH & TT 111/2013', 'Không đóng BHXH; Chịu 100% Thuế TNCN']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:A100").setHorizontalAlignment("center");
  sh.getRange("C2:F100").setHorizontalAlignment("center");
  sh.getRange("H2:H100").setHorizontalAlignment("center");
  sh.getRange("G2:G100").setNumberFormat('#,##0 "₫"').setHorizontalAlignment("right");
}

// =========================================================================================
// 13. SHEET: LS_KHOAN (Lịch sử Thay đổi Định mức Phụ cấp & Khoán)
// =========================================================================================
function taoSheet_LS_KHOAN(ss) {
  let sh = ss.getSheetByName('LS_KHOAN') || ss.insertSheet('LS_KHOAN');
  const headers = [
    'Mã bản ghi', 'Mã khoản', 'Tên khoản khoán / phụ cấp', 'Đối tượng áp dụng',
    'Mức khoán cũ ₫', 'Mức khoán mới ₫', 'Đơn vị tính', 'Từ ngày', 'Đến ngày',
    'Số quyết định', 'Ngày quyết định', 'Người ký', 'Lý do thay đổi', 'Trạng thái'
  ];
  const widths = [110, 100, 180, 140, 115, 115, 95, 95, 95, 150, 105, 130, 240, 100];
  formatHeaderAndFreeze(sh, headers, widths, 1, 3);

  const sample = [
    ['LSK_AN_2026', 'AN_TRUA', 'Tiền ăn giữa ca', 'Toàn Quỹ', 800000, 1000000, '₫/tháng', '01/01/2026', '31/12/2026', 'NQ-03/2025/NQ-HĐQT', '20/12/2025', 'Trịnh Đức Anh', 'Điều chỉnh hỗ trợ trượt giá sinh hoạt năm 2026', 'HẾT HIỆU LỰC'],
    ['LSK_AN_2027', 'AN_TRUA', 'Tiền ăn giữa ca', 'Toàn Quỹ', 1000000, 1200000, '₫/tháng', '01/01/2027', '31/12/2099', 'NQ-01/2027/NQ-HĐQT', '25/12/2026', 'Trịnh Đức Anh', 'Nâng mức ăn ca đảm bảo sức khỏe CBNV theo Đề án 2027', 'HIỆN TẠI'],
    ['LSK_XANG_TD_2026', 'XANG_XE', 'Xăng xe cán bộ tín dụng', 'Khối Tín dụng (P08)', 250000, 300000, '₫/tháng', '01/01/2026', '31/12/2026', 'QĐ-12/2025/QĐ-HĐQT', '22/12/2025', 'Nguyễn Văn Sơn', 'Hỗ trợ xăng xe đi thẩm định khách hàng các thôn', 'HẾT HIỆU LỰC'],
    ['LSK_XANG_TD_2027', 'XANG_XE', 'Xăng xe cán bộ tín dụng', 'Khối Tín dụng (P08)', 300000, 400000, '₫/tháng', '01/01/2027', '31/12/2099', 'NQ-01/2027/NQ-HĐQT', '25/12/2026', 'Trịnh Đức Anh', 'Tăng định mức do mở rộng địa bàn hoạt động liên xã', 'HIỆN TẠI'],
    ['LSK_DT_LDAO_2027', 'DIEN_THOAI', 'Điện thoại công vụ lãnh đạo', 'Chủ tịch, GĐ, Kế toán', 200000, 300000, '₫/tháng', '01/01/2027', '31/12/2099', 'NQ-01/2027/NQ-HĐQT', '25/12/2026', 'Trịnh Đức Anh', 'Khoán cước viễn thông điều hành và trực giao dịch', 'HIỆN TẠI'],
    ['LSK_TRANGPHUC_2027', 'TRANG_PHUC', 'Trang phục công tác bình quân', 'Toàn Quỹ', 400000, 500000, '₫/tháng', '01/01/2027', '31/12/2099', 'NQ-01/2027/NQ-HĐQT', '25/12/2026', 'Trịnh Đức Anh', 'Chuẩn hóa nhận diện thương hiệu đồng phục Quỹ', 'HIỆN TẠI'],
    ['LSK_CTP_2027', 'CONG_TAC_PHI', 'Định mức công tác phí lưu trú', 'Toàn Quỹ', 350000, 500000, '₫/ngày', '01/01/2027', '31/12/2099', 'NQ-01/2027/NQ-HĐQT', '25/12/2026', 'Trịnh Đức Anh', 'Phù hợp chi phí khách sạn, đi lại thực tế khi đi hội thảo/tập huấn', 'HIỆN TẠI']
  ];
  sh.getRange(2, 1, sample.length, headers.length).setValues(sample);

  sh.getRange("A2:B100").setHorizontalAlignment("center");
  sh.getRange("D2:D100").setHorizontalAlignment("center");
  sh.getRange("E2:F100").setNumberFormat('#,##0 "₫"').setHorizontalAlignment("right");
  sh.getRange("G2:I100").setHorizontalAlignment("center");
  sh.getRange("K2:K100").setHorizontalAlignment("center");
  sh.getRange("N2:N100").setHorizontalAlignment("center");
}

/**
 * Xóa sheet rỗng mặc định ban đầu nếu có
 */
function xoaSheetMacDinh(ss) {
  const shDef1 = ss.getSheetByName('Trang tính 1');
  if (shDef1 && ss.getSheets().length > 1) ss.deleteSheet(shDef1);
  const shDef2 = ss.getSheetByName('Sheet1');
  if (shDef2 && ss.getSheets().length > 1) ss.deleteSheet(shDef2);
}
