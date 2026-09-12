# 🗂️ CẤU TRÚC MODULE CHI TIẾT FRONTEND & BACKEND
## Dự Án: Hệ Thống Quản Trị Lương, Nhân Sự, Chấm Công & KPI 2027 Pro V2
### Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ

---

## 1. Cấu Trúc Backend Google Apps Script (`gas_backend/`)

Toàn bộ Backend được tái cấu trúc thành các Controller chuyên biệt theo nguyên lý **Đơn trách nhiệm (Single Responsibility Principle)**. Khi cần nâng cấp hoặc sửa lỗi một phân hệ, lập trình viên chỉ cần can thiệp duy nhất vào file tương ứng:

```
gas_backend/
├── appsscript.json        # Manifest cấu hình V8 Runtime, Web App & quyền hạn
├── Code.js                # Router điều phối trung tâm: doGet, doPost, phân luồng API
├── SetupDatabase.js       # Khởi tạo 13 Sheets, định dạng cột, kẻ viền, master 12 CBNV
├── SchemaManager.js       # Self-Healing Schema: Tự kiểm tra & bổ sung cột thiếu bảo toàn 100% dữ liệu
├── StaffController.js     # Quản trị hồ sơ CBNV 360°, thông tin liên lạc, CCCD, số NPT
├── PositionController.js  # Quản lý 10 vị trí chức danh, hệ số lương 3 phương án PA1/PA2/PA3
├── TimesheetController.js # Quản lý dữ liệu chấm công tháng, ngày công chuẩn, nghỉ phép
├── KpiController.js       # Quản lý từ điển chỉ số KPI, chấm điểm đánh giá theo trọng số
├── AllowanceController.js # Quản lý danh mục 10 khoản khoán, phụ cấp & lịch sử SCD Type 2
├── PayrollController.js   # Động cơ tính lương 4 tầng, trích BHXH, tính thuế TNCN & khóa sổ
├── AuthController.js      # Xác thực đăng nhập, phân quyền RBAC 4 cấp, đổi mật khẩu
├── AuditController.js     # Ghi nhật ký truy vết thao tác (Audit Log) & hộp thư phản hồi CBNV
└── ConfigController.js    # Quản lý tham số chung (Lương cơ sở, trần BHXH, giảm trừ gia cảnh)
```

### Bảng Trách Nhiệm Từng File Backend:
| Tệp Mã Nguồn | Trách Nhiệm Cốt Lõi | Các Hàm Chính Xuất Bản |
|:---|:---|:---|
| `Code.js` | Tiếp nhận HTTP Request, routing, bọc `LockService`, trả về JSON | `doGet(e)`, `doPost(e)`, `createJsonResponse()` |
| `SetupDatabase.js` | Tạo mới 13 sheets, kẻ bảng Navy, freeze cột/hàng, nạp dữ liệu chuẩn | `khoiTaoHeThongCSDL()`, `taoSheet_DM_NS()`, ... |
| `SchemaManager.js` | Kiểm tra tính toàn vẹn 13 bảng trước mọi thao tác, tự bổ sung cột | `ensureDatabaseSchema()`, `checkAndAddColumns()` |
| `StaffController.js` | Thêm, sửa, tìm kiếm hồ sơ nhân sự, lịch sử công tác | `getStaffList()`, `saveStaff()`, `getStaffProfile()` |
| `PositionController.js`| Tra cứu và điều chỉnh khung hệ số lương, phụ cấp trách nhiệm | `getPositions()`, `updatePositionRates()` |
| `TimesheetController.js`| Lưu bảng chấm công tháng, tính tỷ lệ công thời gian | `getTimesheets()`, `saveTimesheets()` |
| `KpiController.js` | Tra cứu từ điển KPI, lưu điểm đánh giá và xếp loại tháng | `getKpiDictionary()`, `saveKpiEvaluation()` |
| `AllowanceController.js`| Cập nhật mức khoán, ghi log thay đổi vào `LS_KHOAN` | `getAllowances()`, `updateAllowanceRate()` |
| `PayrollController.js` | Tính preview bảng lương, khóa sổ vĩnh viễn vào `BL_LICHSU` | `calculatePayrollPreview()`, `lockMonthlyPayroll()` |
| `AuthController.js` | Đăng nhập tài khoản, mã hóa mật khẩu, kiểm tra phân quyền | `login()`, `changePassword()`, `getPermissions()` |
| `AuditController.js` | Ghi lịch sử hoạt động, tiếp nhận phản hồi thắc mắc của CBNV | `logAction()`, `submitFeedback()`, `getFeedbacks()` |
| `ConfigController.js` | Lưu trữ và đọc tham số hệ thống từ sheet `THAM_SO` | `getSystemParams()`, `saveSystemParams()` |

---

## 2. Cấu Trúc Frontend Vite Modular (`frontend_vite/`)

Giao diện người dùng được phân tách thành các module và components độc lập:

```
frontend_vite/
├── package.json           # Khai báo dependencies: Vite, Plugins, UI Libs
├── vite.config.js         # Cấu hình kép: Build Vercel SPA + Singlefile cho GAS
├── index.html             # Khung HTML gốc & nhúng Google Fonts "Be Vietnam Pro"
├── public/                # Tài nguyên tĩnh: Favicon, Logo QTDND Yên Thọ
└── src/
    ├── main.js            # Điểm khởi đầu ứng dụng (App Bootstrapper)
    ├── App.js             # Bộ khung điều hướng giao diện (Header, Sidebar, Router)
    │
    ├── assets/            # Biểu tượng SVG, file CSS phong cách ngân quỹ
    │   ├── css/theme.css  # Bảng màu Navy #17365d, Brand Lime #9ACD32, Typography
    │   └── images/logo.png# Logo nhận diện thương hiệu Quỹ
    │
    ├── constants/         # Các hằng số hệ thống cố định
    │   ├── sheets.js      # Danh sách 13 tên sheet viết tắt chuẩn
    │   ├── roles.js       # Phân quyền 4 vai trò (Admin, Kế toán, Lãnh đạo, Nhân viên)
    │   └── config.js      # Cấu hình URL Vercel Proxy và Direct GAS Endpoint
    │
    ├── services/          # Các tầng dịch vụ giao tiếp dữ liệu
    │   ├── api.js         # Client API Dual-Path (Vercel Proxy + Direct GAS Fallback)
    │   ├── auth.js        # Quản lý phiên làm việc người dùng (Session & Token)
    │   └── storage.js     # Bộ nhớ đệm Client (RAM Cache & LocalStorage an toàn)
    │
    ├── utils/             # Các hàm tiện ích dùng chung
    │   ├── currency.js    # Định dạng số tiền VNĐ, đọc tiền thành chữ tiếng Việt
    │   ├── date.js        # Xử lý ngày tháng GMT+7, Flatpickr date helpers
    │   ├── taxEngine.js   # Thuật toán tính thuế TNCN 7 bậc lũy tiến & trần BHXH
    │   └── exportExcel.js # Xuất file Excel bảng lương & in phiếu lương A4
    │
    ├── components/        # Các thành phần giao diện tái sử dụng
    │   ├── layout/        # Navbar, Sidebar, Footer, UserProfileMenu
    │   └── common/        # MoneyInput, DatePicker, DataTable, Modal, StatCard, Badge
    │
    └── modules/           # 9 Phân hệ nghiệp vụ độc lập
        ├── dashboard/     # Bảng tin tổng quan quỹ lương, biểu đồ phân bổ
        ├── staff/         # Quản lý danh sách 12 CBNV, hồ sơ chi tiết 360°
        ├── positions/     # Khung chức danh, hệ số lương PA1/PA2/PA3
        ├── timesheets/    # Bảng chấm công trực quan theo tháng
        ├── kpi/           # Đánh giá KPI & xếp loại chuyên môn
        ├── allowances/    # Quản lý định mức khoán & lịch sử điều chỉnh
        ├── payroll/       # Bảng tính lương tổng thể & phiếu lương in ấn
        ├── selfservice/   # Cổng CBNV xem lương cá nhân & gửi phản hồi
        └── admin/         # Phân quyền tài khoản, cấu hình & nhật ký hệ thống
```

---

## 3. Lợi Ích Của Kiến Trúc Module Độc Lập

1. **Bảo trì nhanh chóng (Maintainability)**: Muốn sửa thuật toán thuế TNCN? Chỉ mở `src/utils/taxEngine.js` hoặc `PayrollController.js`. Không làm ảnh hưởng đến phần chấm công hay hồ sơ nhân sự.
2. **Khả năng tái sử dụng (Reusability)**: Ô nhập tiền tự động format hàng nghìn `MoneyInput.js` được dùng chung cho bảng lương, màn hình phụ cấp và dự toán.
3. **Phòng chống lỗi liên đới (Blast Radius Zero)**: Mỗi module độc lập về trạng thái và logic, triệt tiêu nguy cơ sửa chỗ này gây lỗi chỗ khác.
