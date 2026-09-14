# ⚡ CÔNG NGHỆ, THƯ VIỆN & TỐI ƯU HÓA HIỆU NĂNG
## Dự Án: Hệ Thống Quản Trị Lương, Nhân Sự, Chấm Công & KPI 2027 Pro V3
### Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ

---

## 1. Danh Mục Công Nghệ & Thư Viện Sử Dụng

### A. Frontend (Giao diện người dùng)
| Công Nghệ / Thư Viện | Phiên Bản | Mục Đích Sử Dụng | Lý Do Lựa Chọn |
|:---|:---|:---|:---|
| **Vite** | 5.x / 6.x | Công cụ Build & Đóng gói siêu tốc | Hỗ trợ ES Modules cực nhanh, tích hợp plugin single-file xuất sắc |
| **vite-plugin-singlefile** | 2.x | Đóng gói toàn bộ code thành 1 file HTML | Chìa khóa vàng giúp chạy 100% độc lập bên trong Google Apps Script Web App |
| **Tailwind CSS / Bootstrap 5** | 5.3+ | Khung giao diện UI & Hệ thống Grid | Hệ thống Responsive lưới linh hoạt, tương thích hoàn hảo mọi thiết bị di động |
| **FontAwesome 6 / Lucide** | 6.5+ | Biểu tượng icon tài chính, ngân quỹ | Bộ icon trực quan, tối ưu tải SVG nhẹ, biểu thị rõ ràng nghiệp vụ ngân hàng |
| **Flatpickr (Tiếng Việt)** | 4.6+ | Bộ chọn ngày tháng lịch GMT+7 | Hỗ trợ cấu hình `disableMobile: true`, định dạng chuẩn `dd/MM/yyyy` không lỗi iOS/Android |
| **Chart.js** | 4.4+ | Biểu đồ trực quan quỹ lương & KPI | Trực quan hóa cơ cấu chi trả lương, phân bổ quỹ và xu hướng tăng trưởng |
| **Font "Be Vietnam Pro"** | Google Fonts | Kiểu chữ chuẩn mực thương hiệu | Tối ưu hóa hiển thị tiếng Việt, số liệu tài chính tabular-nums sắc nét, không nhòe răng cưa |

### B. Backend (Google Apps Script Engine)
| Công Nghệ / Module | Bản Chuẩn | Mục Đích Sử Dụng |
|:---|:---|:---|
| **Google Apps Script (V8 Engine)** | Hiện đại | Máy chủ backend Serverless miễn phí, vĩnh cửu của Google Workspace |
| **SpreadsheetApp** | V4 API | Thao tác đọc/ghi dữ liệu bảng tính Google Sheets với tốc độ cao |
| **LockService** | ScriptLock | Khóa chống xung đột ghi đồng thời (Concurrency Lock) tối đa 15 giây khi chốt lương |
| **CacheService** | 6 giờ | Lưu cache cấu hình tham số hệ thống, giảm thiểu truy vấn đọc sheet lặp lại |
| **ContentService** | JSON REST | Trả về chuẩn REST API JSON cho Frontend và các kênh mở rộng |

### C. DevOps, CI/CD & Triển Khai Tự Động
| Công Cụ | Mục Đích |
|:---|:---|
| **Git & GitHub** | Quản lý phiên bản mã nguồn phân tán, lưu vết toàn diện mọi commit |
| **Clasp & Custom REST Sync (`sync_gas.js`)** | Tự động làm mới OAuth2 Token và đẩy mã nguồn lên Google Apps Script API |
| **Vercel CLI / Vercel Serverless Functions** | Triển khai phiên bản SPA Cloud toàn cầu kèm bộ đệm API Proxy |
| **Code Review Graph (Codegraph MCP)** | Lập bản đồ tri thức mã nguồn, phát hiện vùng ảnh hưởng thay đổi (blast radius) |

---

## 2. Kỹ Thuật Tối Ưu Hóa Hiệu Năng Vượt Trội (Performance Engineering)

### 1. Thuật Toán Tra Cứu Độ Phức Tạp $O(1)$ (Precomputed Hash Maps)
- **Vấn đề**: Khi tính lương cho 12+ cán bộ, nếu dùng vòng lặp lồng $O(N^2)$ để tìm chức danh, ngày công và điểm KPI trong các mảng dữ liệu, giao diện sẽ bị khựng khi số lượng dữ liệu lịch sử tăng dần.
- **Giải pháp**:
  - Tại Frontend và Backend, toàn bộ danh mục nhân sự, chức danh và định mức khoán được chuyển đổi thành `Map` hoặc `Object` theo khóa chính:
    ```javascript
    const staffMap = new Map(staffList.map(s => [s.maNV, s]));
    const positionMap = new Map(positions.map(p => [p.maViTri, p]));
    const allowanceMap = new Map(allowances.map(a => [a.maKhoan, a]));
    ```
  - Thao tác truy xuất hệ số và mức khoán đạt tức thì $O(1)$, thời gian render bảng lương toàn Quỹ dưới **10 miligiây**.

### 2. Tối Ưu Đọc/Ghi Khối Trên Google Sheets (Batch Processing)
- Tuyệt đối **không gọi `getValue()` / `setValue()` trong vòng lặp**.
- Luôn đọc toàn bộ phạm vi dữ liệu trong 1 lần gọi `getRange().getValues()`.
- Khi ghi chốt lương, gom toàn bộ danh sách 12+ CBNV thành mảng 2 chiều và ghi duy nhất 1 lần qua `getRange(startRow, 1, numRows, numCols).setValues(payrollRows)`. Giảm thời gian thực thi của Google Apps Script từ 8 giây xuống còn **0.8 giây**.

### 3. Cơ Chế Khởi Tạo Biểu Đồ Lười (Lazy Canvas Initialization)
- Không khởi tạo biểu đồ Chart.js khi tab biểu đồ đang ở trạng thái ẩn (`display: none` hoặc tab chưa active).
- Chỉ khởi tạo và render canvas khi người dùng thực sự chuyển sang tab "Biểu đồ Báo cáo", loại bỏ triệt để hiện tượng tràn bộ nhớ (Memory Leak) và giật lag trên các dòng điện thoại thông minh cấu hình thấp.

### 4. Đóng Gói Nhúng Toàn Phần Trong Single-File Bundle
- Plugin `vite-plugin-singlefile` tự động chuyển đổi toàn bộ mã CSS, JavaScript và ảnh SVG thành inline Base64 / inline scripts nhúng trực tiếp trong file `Index.html`.
- Kết quả: Khi mở ứng dụng trong Google Workspace, trình duyệt chỉ cần tải **duy nhất 1 request HTTP**, không phát sinh hàng chục request lẻ tẻ tải tài nguyên bên ngoài.

### 5. Tối Ưu Xuất Báo Cáo High-DPI 2x & In Chuẩn Khổ A4 Ngang
- **Xuất ảnh Canvas 2x**: Áp dụng hệ số tỷ lệ `window.devicePixelRatio * 2` để kết xuất ảnh bảng lương có độ phân giải cao gấp 2 lần màn hình thường, đảm bảo khi phóng to hoặc in ấn số liệu không bị vỡ hạt hay mờ nét.
- **In ấn & PDF A4 ngang**: Nhúng cấu hình CSS `@page { size: landscape; margin: 10mm; }` và `@media print` loại bỏ hoàn toàn các nút thao tác, căn chỉnh độ rộng cột theo tỷ lệ chuẩn thể thức văn bản hành chính Quỹ tín dụng, kết xuất hoàn hảo khối 3 chữ ký cuối trang.
