# HƯỚNG DẪN TRIỂN KHAI CƠ SỞ DỮ LIỆU ONLINE (GOOGLE SHEETS)
### HỆ THỐNG QUẢN TRỊ LƯƠNG, CHẤM CÔNG & KPI - QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ

Hệ thống hỗ trợ lưu trữ cơ sở dữ liệu vĩnh cửu trên **Google Sheets** thông qua **Google Apps Script Web App** (100% Miễn phí, dữ liệu nằm hoàn toàn trên Google Drive của Quỹ, an toàn, bảo mật tuyệt đối).

---

## 🚀 CÁC BƯỚC THIẾT LẬP (CHỈ MẤT 2 PHÚT - 1 LẦN DUY NHẤT)

### Bước 1: Google Sheet CSDL chính thức của Quỹ
Bảng tính Google Sheets lưu trữ CSDL của Quỹ đã được tạo và liên kết:
- **ID Bảng tính**: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`
- **Link trực tiếp**: [Mở Google Sheet CSDL](https://docs.google.com/spreadsheets/d/1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8/edit)

### Bước 2: Đẩy mã nguồn tự động lên Google Apps Script bằng Clasp
Dự án đã được cấu hình sẵn **Clasp & REST API Sync** liên kết trực tiếp với Script ID `14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr`. Bạn **không cần phải copy/paste thủ công từng file** nữa:
- **Cách 1**: Mở terminal trong thư mục dự án và chạy:
  ```bash
  npm run push
  ```
- **Cách 2**: Nhấp đúp (hoặc chuột phải chọn Run with PowerShell) file:
  ```powershell
  .\push_code.ps1
  ```
Toàn bộ mã nguồn `Code.js`, `SetupDatabase.js` (tạo 13 sheets) và cấu hình `appsscript.json` sẽ được tự động đồng bộ lên Google Apps Script trong vòng 3 giây!
- Link mở trực tiếp dự án: [Google Apps Script Editor](https://script.google.com/d/14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr/edit).

### Bước 3: Triển khai thành Web App (Deploy)
1. Ở góc trên bên phải màn hình Apps Script, nhấn nút **Triển khai** (Deploy) $\rightarrow$ **Triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Điền thông tin cấu hình:
   - **Mô tả**: `QTDND Yên Thọ Payroll API 2027`
   - **Thực thi dưới dạng** (Execute as): `Tôi (địa chỉ email của bạn)`
   - **Ai có quyền truy cập** (Who has access): `Bất kỳ ai` (Anyone) *(để Web App có thể gửi nhận dữ liệu mà không bị chặn xác thực)*.
4. Nhấn **Triển khai** (Deploy).
5. Nhấn **Ủy quyền truy cập** (Authorize access) và chọn tài khoản Google của bạn $\rightarrow$ Chọn *Advanced (Nâng cao)* $\rightarrow$ Chọn *Go to ... (unsafe / Không an toàn)* $\rightarrow$ Nhấn *Allow (Cho phép)*.
6. Sao chép chuỗi **URL ứng dụng web** (Web app URL có đuôi dạng `.../exec`).

### Bước 4: Kết nối vào Web App trên máy tính
1. Mở file `index.html` của dự án trên trình duyệt.
2. Chọn Tab **☁️ Đồng bộ CSDL Online**.
3. Dán đường link Web App vừa sao chép vào ô **"URL Google Apps Script Web App"**.
4. Nhấn **"Kiểm tra kết nối"** $\rightarrow$ Hệ thống sẽ báo kết nối thành công!
5. Nhấn **"Đồng bộ toàn bộ lên Cloud"**.

---

## 📊 CẤU TRÚC 13 BẢNG CSDL ĐƯỢC TỰ ĐỘNG KHỞI TẠO TRÊN GOOGLE SHEETS:

Backend hỗ trợ khởi tạo tự động 13 Sheet chuẩn hóa với màu thương hiệu Navy, đóng băng hàng/cột và định dạng tiền tệ qua file `gas_backend/SetupDatabase.js`:
1. `DM_NS`: Danh mục Nhân sự 360° (Lý lịch, liên hệ, ảnh thẻ, CCCD, số NPT, số tài khoản nhận lương).
2. `LS_CONGTAC`: Lịch sử công tác & hệ số lương theo thời gian (SCD Type 2).
3. `DM_CHUCDANH`: Khung 10 chức danh vị trí và ma trận 3 kịch bản hệ số PA1/PA2/PA3.
4. `DM_KPI`: Từ điển các tiêu chí đo lường hiệu quả công việc chuyên môn QTDND.
5. `CHAM_CONG`: Quản lý ngày công đi làm, phép năm, nghỉ lễ, nghỉ ốm theo từng tháng.
6. `DG_KPI`: Chi tiết kết quả thực hiện, tỷ lệ hoàn thành và điểm số từng chỉ số KPI hàng tháng.
7. `BL_LICHSU`: Bảng thanh toán lương tổng hợp đã khóa sổ, bóc tách chi tiết từng khoản khoán, BHXH, thuế TNCN, Thực lĩnh Net.
8. `TAIKHOAN`: Quản lý tài khoản đăng nhập xem lương, mật khẩu băm SHA-256 và phân quyền vai trò RBAC.
9. `AUDIT_LOG`: Nhật ký truy cập và thao tác an toàn thông tin (ai đăng nhập, xem gì, sửa gì, lúc nào).
10. `PHAN_HOI`: Hộp thư giải đáp thắc mắc lương 2 chiều giữa Người lao động và Kế toán.
11. `THAM_SO`: Tham số hệ thống (Mức lương cơ bản, tỷ lệ bảo hiểm 21.5%/10.5%, giảm trừ gia cảnh).
12. `DM_PHU_CAP`: Danh mục phụ cấp, khoán & cấu hình cờ tính BHXH, tính Thuế TNCN, hạn mức miễn trừ.
13. `LS_KHOAN`: Lịch sử thay đổi định mức khoán (Mức cũ, mức mới, ngày bắt đầu áp dụng, số quyết định phê duyệt của HĐQT).

---

## 🔒 AN TOÀN & SAO LƯU DỰ PHÒNG
- **Chống xung đột đa người dùng**: Backend tích hợp `LockService.getScriptLock()` chờ 15s để chống việc ghi đè đồng thời.
- **Hoạt động Offline linh hoạt**: Dữ liệu luôn tự động lưu tạm trên trình duyệt (`localStorage`). Khi có mạng, chỉ cần 1 nút bấm là đồng bộ ngay lên Google Sheets.
- **Sao lưu tệp JSON**: Ngoài Google Sheets, người dùng có thể tải file `.json` về máy tính lưu vào USB hoặc gửi email bất kỳ lúc nào.
