# 📊 TÀI LIỆU CƠ SỞ DỮ LIỆU 13 BẢNG GOOGLE SHEETS CHUẨN HÓA
## Dự Án: Hệ Thống Quản Trị Lương, Chấm Công & KPI 2027 Pro V2
### Google Sheet ID: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`

---

## Danh Sách 13 Bảng Dữ Liệu Tên Ngắn Gọn & Viết Tắt

| STT | Mã Sheet | Tên Đầy Đủ Của Sheet | Số Cột | Mục Đích Lưu Trữ |
|:---:|:---|:---|:---:|:---|
| **1** | `DM_NS` | Danh mục Nhân sự 360° | 21 cột | Hồ sơ 12 CBNV, ngày sinh, CCCD, MST, số NPT, số TK Ngân hàng |
| **2** | `LS_CONGTAC` | Lịch sử Công tác & Hệ số lương | 17 cột | Quyết định bổ nhiệm, ngạch bậc, hệ số hưởng lương thời điểm |
| **3** | `DM_CHUCDANH`| Khung Chức danh & Hệ số PA1/PA2/PA3 | 18 cột | 10 chức danh, hệ số 3 phương án, phụ cấp TN, thù lao QT |
| **4** | `DM_KPI` | Từ điển Chỉ số KPI nghiệp vụ | 6 cột | Danh mục các chỉ số đo lường hiệu quả công việc |
| **5** | `CHAM_CONG` | Chấm công & Ngày phép tháng | 11 cột | Số ngày công chuẩn, công thực tế, nghỉ phép, không lương |
| **6** | `DG_KPI` | Đánh giá chi tiết KPI tháng | 10 cột | Chấm điểm thực hiện từng chỉ số theo CBNV và trọng số |
| **7** | `BL_LICHSU` | Lịch sử Bảng lương khóa sổ | 26 cột | Bảng lương đã chốt vĩnh viễn, lưu vết chi tiết từng khoản |
| **8** | `TAIKHOAN` | Quản lý Tài khoản & Phân quyền | 9 cột | Tài khoản đăng nhập, mật khẩu mã hóa SHA-256, vai trò RBAC |
| **9** | `AUDIT_LOG` | Nhật ký Truy vết & Thao tác | 7 cột | Ghi vết mọi lượt đăng nhập, tính lương, chốt lương, sửa hồ sơ |
| **10**| `PHAN_HOI` | Hộp thư Phản hồi thắc mắc lương | 9 cột | CBNV gửi câu hỏi về lương; Kế toán giải trình |
| **11**| `THAM_SO` | Tham số Hệ thống & Tỷ lệ Thuế/BHXH | 5 cột | Lương cơ sở, mức giảm trừ gia cảnh, tỷ lệ trích nộp BHXH |
| **12**| `DM_PHU_CAP` | Danh mục Phụ cấp & Khoán công vụ | 10 cột | Quy tắc tính BHXH, tính thuế TNCN và mức trần miễn thuế |
| **13**| `LS_KHOAN` | Lịch sử Thay đổi Định mức Khoán | 14 cột | Lưu vết lịch sử SCD-2 khi HĐQT điều chỉnh mức phụ cấp khoán |

---

## Chi Tiết Các Cột Dữ Liệu Từng Sheet

### 1. Sheet `DM_NS` (Danh Mục Nhân Sự)
`Mã NV` (NV01..), `Họ và tên`, `Chức danh`, `Khối phòng ban`, `Điện thoại`, `Email`, `Ngày sinh`, `Giới tính`, `Số CCCD`, `Ngày cấp CCCD`, `Nơi cấp CCCD`, `Địa chỉ thường trú`, `Ngày vào làm`, `Trạng thái`, `Số NPT`, `Số tài khoản NH`, `Tên ngân hàng`, `Mã số thuế`, `Số sổ BHXH`, `Link ảnh thẻ`, `Ghi chú`.

### 2. Sheet `LS_CONGTAC` (Lịch Sử Công Tác & Hệ Số)
`Mã bản ghi`, `Mã NV`, `Họ và tên`, `Số Quyết định`, `Ngày quyết định`, `Từ ngày`, `Đến ngày`, `Mã vị trí`, `Chức danh công tác`, `Bậc`, `Hệ số lương`, `Tỷ lệ KPI trần`, `Tỷ lệ Thưởng trần`, `Phụ cấp trách nhiệm`, `Thù lao quản trị`, `Lý do điều chỉnh`, `Trạng thái`.

### 3. Sheet `DM_CHUCDANH` (Khung Chức Danh)
`Mã vị trí` (P01..P10), `Tên vị trí chức danh`, `Khối`, `Bậc`, `Số lượng`, `PA1 Hệ số`, `PA2 Hệ số (Chuẩn)`, `PA3 Hệ số`, `PA1 KPI`, `PA2 KPI`, `PA3 KPI`, `PA1 Thưởng`, `PA2 Thưởng`, `PA3 Thưởng`, `Phụ cấp TN ₫`, `Thù lao QT ₫`, `Ngày hiệu lực`, `Quyết định phê duyệt`.

### 4. Sheet `DM_KPI` (Từ Điển Chỉ Số KPI)
`Mã KPI`, `Tên chỉ số KPI`, `Khối áp dụng`, `Đơn vị tính`, `Trọng số mặc định`, `Tiêu chuẩn đánh giá / Công thức`.

### 5. Sheet `CHAM_CONG` (Chấm Công Tháng)
`Kỳ (YYYY-MM)`, `Mã NV`, `Họ và tên`, `Công chuẩn`, `Công thực tế`, `Nghỉ phép`, `Nghỉ không lương`, `Nghỉ chế độ`, `Tổng công tính lương`, `Ghi chú`, `Thời gian cập nhật`.

### 6. Sheet `DG_KPI` (Đánh Giá KPI Tháng)
`Mã đánh giá`, `Kỳ (YYYY-MM)`, `Mã NV`, `Họ và tên`, `Mã KPI`, `Chỉ tiêu giao`, `Thực tế thực hiện`, `Tỷ lệ đạt %`, `Điểm trọng số`, `Xếp loại tháng`.

### 7. Sheet `BL_LICHSU` (Lịch Sử Bảng Lương Đã Khóa)
`Kỳ lương`, `Mã NV`, `Họ và tên`, `Chức danh`, `Hệ số lương`, `Công chuẩn`, `Công thực`, `Lương ngạch bậc`, `Hệ số KPI`, `Lương KPI`, `Tiền thưởng`, `Phụ cấp trách nhiệm`, `Thù lao quản trị`, `Ăn trưa`, `Xăng xe`, `Điện thoại`, `Trang phục`, `Khoán khác`, `Tổng thu nhập Gross`, `BHXH NLĐ (10.5%)`, `Giảm trừ gia cảnh`, `Thu nhập tính thuế`, `Thuế TNCN`, `Thực Lĩnh (Net)`, `BHXH Đơn vị (21.5%)`, `Ngày chốt & Khóa sổ`.

### 8. Sheet `TAIKHOAN` (Tài Khoản & Phân Quyền)
`Mã tài khoản`, `Tên đăng nhập / Mã NV`, `Họ và tên`, `Mật khẩu mã hóa`, `Email`, `Vai trò RBAC`, `Trạng thái`, `Lần đăng nhập cuối`, `Ghi chú`.

### 9. Sheet `AUDIT_LOG` (Nhật Ký Hệ Thống)
`Mã log`, `Thời gian (GMT+7)`, `Người thực hiện`, `Địa chỉ IP / Thiết bị`, `Hành động`, `Chi tiết thao tác`, `Trạng thái`.

### 10. Sheet `PHAN_HOI` (Hộp Thư Phản Hồi Thắc Mắc)
`Mã phản hồi`, `Kỳ lương thắc mắc`, `Mã NV`, `Họ và tên`, `Nội dung câu hỏi`, `Thời gian gửi`, `Người tiếp nhận`, `Nội dung giải trình`, `Trạng thái xử lý`.

### 11. Sheet `THAM_SO` (Tham Số Chung)
`Mã tham số`, `Tên tham số`, `Giá trị`, `Đơn vị tính`, `Ghi chú & Căn cứ`.

### 12. Sheet `DM_PHU_CAP` (Danh Mục Phụ Cấp & Khoán)
`Mã khoản`, `Tên khoản phụ cấp / khoán`, `Phân loại chi`, `Cột bảng lương`, `Tính BHXH?`, `Tính Thuế TNCN?`, `Mức miễn thuế tối đa ₫`, `Phương thức tính`, `Căn cứ pháp lý & Quy chế`, `Ghi chú nghiệp vụ`.

### 13. Sheet `LS_KHOAN` (Lịch Sử Thay Đổi Định Mức Khoán - SCD Type 2)
`Mã bản ghi`, `Mã khoản`, `Tên khoản khoán / phụ cấp`, `Đối tượng áp dụng`, `Mức khoán cũ ₫`, `Mức khoán mới ₫`, `Đơn vị tính`, `Từ ngày`, `Đến ngày`, `Số quyết định`, `Ngày quyết định`, `Người ký`, `Lý do thay đổi`, `Trạng thái`.
