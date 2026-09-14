# 🗂️ CẤU TRÚC MODULE CHI TIẾT FRONTEND & BACKEND
## Dự Án: Hệ Thống Quản Trị Lương, Nhân Sự, Chấm Công & KPI 2027 Pro V3
### Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ

---

## 1. Cấu Trúc Backend Google Apps Script (`gas_backend/`)

Toàn bộ Backend được xây dựng theo kiến trúc Controller chuyên biệt, phân tách rõ ràng giữa định nghĩa dữ liệu, điều phối API và động cơ tính toán:

```
gas_backend/
├── appsscript.json            # Manifest cấu hình V8 Runtime, Web App & OAuth Scopes
├── Code.js                    # Router điều phối trung tâm: doGet, doPost, phân luồng API, LockService
├── SetupDatabase.js           # Khởi tạo 17 Sheets, định dạng cột, kẻ viền, master 12 CBNV
├── SchemaManager.js           # Self-Healing Schema: Tự kiểm tra & bổ sung cột thiếu bảo toàn 100% dữ liệu
├── PayrollEngine.js           # Core Engine V3.0: Tính toán 22 mục lương từ CSDL (Zero-hardcode)
├── SalaryParamsController.js  # CRUD DM_THAM_SO_LUONG (pháp lý) & DM_BAC_LUONG (5 bậc × 10 vị trí)
├── StaffController.js         # Quản trị hồ sơ CBNV 360°, ngạch bậc, thâm niên chức vụ, link Drive
├── PositionController.js      # Quản lý 10 vị trí chức danh, hệ số 5 bậc, % vượt khung, chu kỳ nâng bậc
├── TimesheetController.js     # Quản lý dữ liệu chấm công tháng, ngày công chuẩn, nghỉ phép
├── KpiController.js           # Quản lý từ điển chỉ số KPI, chấm điểm đánh giá theo trọng số
├── AllowanceController.js     # Quản lý danh mục phụ cấp & định mức khoán SCD Type 2
├── PayrollController.js       # Quản lý lịch sử khóa sổ lương BL_LICHSU & KQ_LUONG_THANG
├── AuthController.js          # Xác thực đăng nhập, phân quyền RBAC 4 cấp, đổi mật khẩu băm SHA-256
├── AuditController.js         # Ghi nhật ký truy vết thao tác (Audit Log) & hộp thư phản hồi CBNV
└── ConfigController.js        # Quản lý tham số hệ thống từ sheet THAM_SO
```

### Bảng Trách Nhiệm Từng File Backend:

| Tệp Mã Nguồn | Trách Nhiệm Cốt Lõi | Các Hàm Chính Xuất Bản |
|:---|:---|:---|
| `Code.js` | Tiếp nhận HTTP Request, routing API, bọc `LockService`, trả về JSON | `doGet(e)`, `doPost(e)`, `executeGasAction()` |
| `SetupDatabase.js` | Tạo mới 17 sheets, kẻ bảng Navy, freeze cột/hàng, nạp dữ liệu chuẩn ban đầu | `khoiTaoHeThongCSDL()`, `taoSheet_DM_NS()`, ... |
| `SchemaManager.js` | Tự động kiểm tra và chữa lành cấu trúc 17 bảng, bổ sung cột mới bảo toàn dữ liệu | `ensureDatabaseSchema()`, `checkAndAddColumns()` |
| `PayrollEngine.js` | Động cơ tính lương 22 bước: Lương ngạch bậc, thâm niên, vượt khung, KPI, BHXH, Thuế TNCN | `computeOneStaffPayroll()`, `calculateMonthlyPayroll()`, `lockMonthlyPayroll()` |
| `SalaryParamsController.js`| CRUD tham số pháp lý (`DM_THAM_SO_LUONG`) và bảng ngạch bậc (`DM_BAC_LUONG`) | `getSalaryParams()`, `saveSalaryParams()`, `saveSalaryScale()` |
| `StaffController.js` | Thêm, sửa, tìm kiếm hồ sơ nhân sự, lưu liên kết Google Drive số hóa | `getStaffList()`, `saveStaff()`, `getStaffProfile()` |
| `PositionController.js`| Quản lý 10 chức danh, hệ số 5 bậc, phụ cấp trách nhiệm, chu kỳ nâng bậc | `getPositions()`, `updatePositionRates()` |
| `TimesheetController.js`| Lưu bảng chấm công tháng, tính tỷ lệ công thời gian | `getTimesheets()`, `saveTimesheets()` |
| `KpiController.js` | Tra cứu từ điển KPI, lưu điểm đánh giá và xếp loại tháng | `getKpiDictionary()`, `saveKpiEvaluation()` |
| `AllowanceController.js`| Cập nhật mức khoán, ghi log thay đổi vào `LS_KHOAN` (SCD-2) | `getAllowances()`, `updateAllowanceRate()` |
| `PayrollController.js` | Quản lý bảng lương lịch sử và truy vấn phiếu lương cá nhân | `getPayrollHistory()`, `getMyPayroll()` |
| `AuthController.js` | Đăng nhập tài khoản, mã hóa mật khẩu SHA-256, kiểm tra phân quyền RBAC | `login()`, `changePassword()`, `getPermissions()` |
| `AuditController.js` | Ghi lịch sử hoạt động, tiếp nhận phản hồi thắc mắc của CBNV | `logAction()`, `submitFeedback()`, `getFeedbacks()` |
| `ConfigController.js` | Lưu trữ và đọc tham số hệ thống từ sheet `THAM_SO` | `getSystemParams()`, `saveSystemParams()` |

---

## 2. Cấu Trúc Frontend Vite Modular (`frontend_vite/`)

Giao diện người dùng được thiết kế bằng React 18 / Vanilla ES Modules, đóng gói siêu tốc bằng Vite:

```
frontend_vite/
├── package.json               # Khai báo dependencies: Vite, Plugins, Singlefile, Flatpickr, Chart.js
├── vite.config.js             # Cấu hình kép: Build Vercel SPA + Singlefile cho Google Apps Script
├── index.html                 # Khung HTML gốc & nhúng Google Fonts "Be Vietnam Pro"
├── public/                    # Tài nguyên tĩnh: Favicon, Logo QTDND Yên Thọ
└── src/
    ├── main.js                # Điểm khởi đầu ứng dụng (App Bootstrapper)
    ├── App.js                 # Bộ khung điều hướng giao diện chính (Header, Sidebar, Router)
    │
    ├── assets/                # Biểu tượng SVG, file CSS phong cách ngân quỹ
    │   ├── css/theme.css      # Bảng màu Navy #17365d, Brand Lime #9ACD32, Typography Be Vietnam Pro
    │   └── images/logo.png    # Logo nhận diện thương hiệu Quỹ
    │
    ├── constants/             # Các hằng số hệ thống cố định
    │   ├── sheets.js          # Danh sách 17 tên sheet viết tắt chuẩn V3.0
    │   ├── roles.js           # Phân quyền 4 vai trò (Admin, Kế toán, Lãnh đạo, Nhân viên)
    │   └── config.js          # Cấu hình URL Vercel Proxy và Direct GAS Endpoint
    │
    ├── services/              # Các tầng dịch vụ giao tiếp dữ liệu
    │   ├── api.js             # Client API Dual-Path (Vercel Proxy + Direct GAS Fallback)
    │   ├── auth.js            # Quản lý phiên làm việc người dùng (Session & Token)
    │   └── storage.js         # Bộ nhớ đệm Client (RAM Cache & LocalStorage an toàn)
    │
    ├── utils/                 # Các hàm tiện ích dùng chung
    │   ├── currency.js        # Định dạng tiền tệ VNĐ chuẩn, đọc tiền thành chữ tiếng Việt
    │   ├── date.js            # Xử lý ngày tháng GMT+7, Flatpickr date helpers (disableMobile: true)
    │   ├── taxEngine.js       # Thuật toán tính thuế TNCN 7 bậc lũy tiến & trần BHXH
    │   ├── exportExcel.js     # Xuất file Excel (.xls) bảng lương chuyên nghiệp
    │   └── exportReport.js    # Bộ công cụ xuất Ảnh Canvas 2x High-DPI & In PDF A4 chuẩn thể thức
    │
    ├── components/            # Các thành phần giao diện tái sử dụng
    │   ├── layout/            # Navbar, Sidebar, Footer, UserProfileMenu
    │   └── common/            # MoneyInput, DatePicker, DataTable, Modal, StatCard, Badge
    │
    └── modules/               # 7 Cụm phân hệ nghiệp vụ chính
        ├── simulation/        # MÔ PHỎNG LƯƠNG ĐỘNG, tinh chỉnh tham số, so sánh kịch bản & xuất báo cáo
        ├── staff/             # QUẢN LÝ HỒ SƠ NHÂN SỰ 360°, 5 bậc ngạch, mức đóng BHXH, link Drive
        ├── timesheets/        # BẢNG CHẤM CÔNG HÀNG THÁNG theo công chuẩn và nghỉ phép
        ├── kpi/               # ĐÁNH GIÁ CHỈ SỐ KPI THÁNG theo danh mục và trọng số
        ├── payroll/           # TÍNH TOÁN BẢNG LƯƠNG, lưu kết quả dự thảo & khóa sổ bất biến
        ├── selfservice/       # CỔNG TỰ PHỤC VỤ CBNV xem phiếu lương & gửi thắc mắc 2 chiều
        └── admin/             # QUẢN TRỊ TÀI KHOẢN RBAC 4 cấp, cấu hình tham số & nhật ký hệ thống
```

---

## 3. Lợi Ích Của Kiến Trúc Module Độc Lập V3.0

1. **Bảo trì nhanh chóng (Maintainability)**: Muốn sửa đổi thuật toán thâm niên hoặc mức đóng BHXH? Chỉ mở `gas_backend/PayrollEngine.js` hoặc cấu hình trực tiếp trên giao diện Mô phỏng mà không cần sửa code.
2. **Khả năng tái sử dụng (Reusability)**: Bộ công cụ xuất báo cáo (Excel, Ảnh Canvas, In PDF A4) được tách thành service dùng chung cho cả màn hình Mô phỏng và Bảng lương chính thức.
3. **Phòng chống lỗi liên đới (Blast Radius Zero)**: Mỗi module độc lập về trạng thái và logic, triệt tiêu nguy cơ sửa chỗ này gây lỗi chỗ khác.
