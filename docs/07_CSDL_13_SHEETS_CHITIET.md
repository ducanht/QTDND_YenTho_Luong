# 📊 TÀI LIỆU CƠ SỞ DỮ LIỆU 17 BẢNG GOOGLE SHEETS CHUẨN HÓA (V3.0)
## Dự Án: Hệ Thống Quản Trị Lương, Nhân Sự, Chấm Công & KPI 2027 Pro V3
### Đơn Vị Quản Lý: Quỹ Tín Dụng Nhân Dân Yên Thọ (Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá)
### Google Sheet ID: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`

---

## 🏛️ Danh Sách 17 Bảng Dữ Liệu Chuẩn Hóa

| STT | Mã Sheet | Tên Đầy Đủ Của Sheet | Số Cột | Mục Đích Lưu Trữ & Nghiệp Vụ |
|:---:|:---|:---|:---:|:---|
| **1** | `DM_NS` | Danh mục Nhân sự 360° | 30 cột | Hồ sơ 12 CBNV, CCCD, MST, NPT, số TK, ngày đảm nhiệm CV, thâm niên quy đổi, bậc, năm vượt khung, mức đóng BHXH, link Drive |
| **2** | `LS_CONGTAC` | Lịch sử Công tác & Quyết định | 18 cột | Quyết định bổ nhiệm, nâng ngạch bậc, thâm niên, link quyết định Drive |
| **3** | `DM_CHUCDANH`| Khung Chức danh & 5 Bậc Lương | 27 cột | 10 chức danh, hệ số 5 bậc ngạch (Bậc 1 - 5), nhóm khoán, % vượt khung, chu kỳ nâng bậc 3 năm |
| **4** | `DM_KPI` | Từ điển Chỉ số KPI nghiệp vụ | 6 cột | Danh mục chỉ số đo lường hiệu quả công việc chuyên môn QTDND |
| **5** | `CHAM_CONG` | Chấm công & Ngày phép tháng | 11 cột | Số ngày công chuẩn, công thực tế, nghỉ phép, không lương, nghỉ chế độ |
| **6** | `DG_KPI` | Đánh giá chi tiết KPI tháng | 10 cột | Chấm điểm thực hiện từng chỉ số theo CBNV và trọng số |
| **7** | `BL_LICHSU` | Lịch sử Bảng lương khóa sổ | 35 cột | Bảng lương đã chốt vĩnh viễn, lưu vết chi tiết 22 chỉ tiêu tài chính |
| **8** | `TAIKHOAN` | Quản lý Tài khoản & Phân quyền | 9 cột | Tài khoản đăng nhập, mật khẩu mã hóa SHA-256, vai trò RBAC 4 cấp |
| **9** | `AUDIT_LOG` | Nhật ký Truy vết & Thao tác | 7 cột | Ghi vết mọi lượt đăng nhập, tính lương, chốt lương, sửa hồ sơ |
| **10**| `PHAN_HOI` | Hộp thư Phản hồi thắc mắc lương | 9 cột | CBNV gửi câu hỏi về lương; Kế toán giải trình minh bạch |
| **11**| `THAM_SO` | Tham số Hệ thống & Tỷ lệ Thuế/BHXH | 5 cột | Lương cơ sở, mức giảm trừ gia cảnh, tỷ lệ trích nộp BHXH |
| **12**| `DM_PHU_CAP` | Danh mục Phụ cấp & Khoán công vụ | 14 cột | Quy tắc tính BHXH, tính thuế TNCN, mức trần miễn thuế, nhóm áp dụng |
| **13**| `LS_KHOAN` | Lịch sử Thay đổi Định mức Khoán | 14 cột | Lưu vết lịch sử SCD-2 khi HĐQT điều chỉnh mức phụ cấp khoán |
| **14**| `DM_BAC_LUONG`| Bảng Lương Ngạch Bậc (5 Bậc) | 8 cột | Chi tiết ma trận 5 bậc ngạch của 10 chức danh theo lương cơ sở |
| **15**| `DM_THAM_SO_LUONG`| Tham số Pháp lý & Lương Nghiệp vụ | 10 cột | Cấu hình Lương cơ sở, BHXH trần, giảm trừ thuế TNCN, thâm niên, vượt khung |
| **16**| `DM_CONG_THUC`| Danh mục Công thức 4 Tầng Lương | 10 cột | 13 công thức tính toán từ lương vị trí, KPI, khoán đến Net và chi phí Quỹ |
| **17**| `KQ_LUONG_THANG`| Kết quả Tính Lương Tháng (DRAFT/LOCK)| 40 cột | Bảng kết quả tính toán chi tiết 22 mục cho 12 CBNV từng kỳ lương |

---

## 🔍 Chi Tiết Headers & Cột Dữ Liệu Từng Sheet

### 1. Sheet `DM_NS` (Danh Mục Nhân Sự 360°)
`Mã NV`, `Họ và tên`, `Chức danh`, `Khối phòng ban`, `Điện thoại`, `Email`, `Ngày sinh`, `Giới tính`, `Số CCCD`, `Ngày cấp CCCD`, `Nơi cấp CCCD`, `Địa chỉ thường trú`, `Ngày vào làm`, `Trạng thái`, `Số NPT`, `Số tài khoản NH`, `Tên ngân hàng`, `Mã số thuế`, `Số sổ BHXH`, `Link ảnh thẻ`, `Ghi chú`, `Ngày đảm nhiệm chức vụ`, `Bậc lương`, `Năm vượt khung`, `Mức đóng BHXH`, `Thâm niên quy đổi`, `Số QĐ`, `Ngày QĐ`, `Link HĐLĐ`, `Link Phụ lục`, `Link QĐ`.

### 2. Sheet `LS_CONGTAC` (Lịch Sử Công Tác & Hệ Số)
`Mã bản ghi`, `Mã NV`, `Họ và tên`, `Số Quyết định`, `Ngày quyết định`, `Từ ngày`, `Đến ngày`, `Mã vị trí`, `Chức danh công tác`, `Bậc`, `Hệ số lương`, `Tỷ lệ KPI trần`, `Tỷ lệ Thưởng trần`, `Phụ cấp trách nhiệm`, `Thù lao quản trị`, `Lý do điều chỉnh`, `Trạng thái`, `Link quyết định`.

### 3. Sheet `DM_CHUCDANH` (Khung Chức Danh & 5 Bậc Ngạch)
`Mã vị trí`, `Tên vị trí chức danh`, `Khối`, `Bậc`, `Số lượng`, `PA1 Hệ số`, `PA2 Hệ số (Chuẩn)`, `PA3 Hệ số`, `PA1 KPI`, `PA2 KPI`, `PA3 KPI`, `PA1 Thưởng`, `PA2 Thưởng`, `PA3 Thưởng`, `Phụ cấp TN ₫`, `Thù lao QT ₫`, `Ngày hiệu lực`, `Quyết định phê duyệt`, `Nhóm khoán`, `Hệ số bậc 1`, `Hệ số bậc 2`, `Hệ số bậc 3`, `Hệ số bậc 4`, `Hệ số bậc 5`, `% Vượt khung mỗi lần`, `Lần vượt khung tối đa`, `Kỳ nâng bậc (năm)`.

### 4. Sheet `DM_KPI` (Từ Điển Chỉ Số KPI)
`Mã KPI`, `Tên chỉ số KPI`, `Khối áp dụng`, `Đơn vị tính`, `Trọng số mặc định`, `Tiêu chuẩn đánh giá / Công thức`.

### 5. Sheet `CHAM_CONG` (Chấm Công Tháng)
`Kỳ (YYYY-MM)`, `Mã NV`, `Họ và tên`, `Công chuẩn`, `Công thực tế`, `Nghỉ phép`, `Nghỉ không lương`, `Nghỉ chế độ`, `Tổng công tính lương`, `Ghi chú`, `Thời gian cập nhật`.

### 6. Sheet `DG_KPI` (Đánh Giá KPI Tháng)
`Mã đánh giá`, `Kỳ (YYYY-MM)`, `Mã NV`, `Họ và tên`, `Mã KPI`, `Chỉ tiêu giao`, `Thực tế thực hiện`, `Tỷ lệ đạt %`, `Điểm trọng số`, `Xếp loại tháng`.

### 7. Sheet `BL_LICHSU` (Lịch Sử Bảng Lương Khóa Sổ)
`Kỳ lương`, `Mã NV`, `Họ và tên`, `Chức danh`, `Hệ số lương`, `Công chuẩn`, `Công thực`, `Lương ngạch bậc`, `Hệ số KPI`, `Lương KPI`, `Tiền thưởng`, `Phụ cấp trách nhiệm`, `Thù lao quản trị`, `Ăn trưa`, `Xăng xe`, `Điện thoại`, `Trang phục`, `Khoán khác`, `Tổng thu nhập Gross`, `BHXH NLĐ (10.5%)`, `Giảm trừ gia cảnh`, `Thu nhập tính thuế`, `Thuế TNCN`, `Thực Lĩnh (Net)`, `BHXH Đơn vị (21.5%)`, `Ngày chốt & Khóa sổ`, `Thâm niên CT`, `Vượt khung`, `Điểm KPI`, `Lương KPI`, `Tiền thừa BHXH`, `BHXH NLĐ 8%`, `BHYT NLĐ 1.5%`, `BHTN NLĐ 1%`, `Tổng chi phí Quỹ`.

### 8. Sheet `TAIKHOAN` (Tài Khoản & Phân Quyền)
`Mã tài khoản`, `Tên đăng nhập / Mã NV`, `Họ và tên`, `Mật khẩu mã hóa`, `Email`, `Vai trò RBAC`, `Trạng thái`, `Lần đăng nhập cuối`, `Ghi chú`.

### 9. Sheet `AUDIT_LOG` (Nhật Ký Hệ Thống)
`Mã log`, `Thời gian (GMT+7)`, `Người thực hiện`, `Địa chỉ IP / Thiết bị`, `Hành động`, `Chi tiết thao tác`, `Trạng thái`.

### 10. Sheet `PHAN_HOI` (Hộp Thư Phản Hồi Thắc Mắc)
`Mã phản hồi`, `Kỳ lương thắc mắc`, `Mã NV`, `Họ và tên`, `Nội dung câu hỏi`, `Thời gian gửi`, `Người tiếp nhận`, `Nội dung giải trình`, `Trạng thái xử lý`.

### 11. Sheet `THAM_SO` (Tham Số Chung)
`Mã tham số`, `Tên tham số`, `Giá trị`, `Đơn vị tính`, `Ghi chú & Căn cứ`.

### 12. Sheet `DM_PHU_CAP` (Danh Mục Phụ Cấp & Khoán)
`Mã khoản`, `Tên khoản phụ cấp / khoán`, `Phân loại chi`, `Cột bảng lương`, `Tính BHXH?`, `Tính Thuế TNCN?`, `Mức miễn thuế tối đa ₫`, `Phương thức tính`, `Căn cứ pháp lý & Quy chế`, `Ghi chú nghiệp vụ`, `Nhóm áp dụng`, `Bật/tắt`, `Mức cố định ₫`, `Điều kiện hưởng`.

### 13. Sheet `LS_KHOAN` (Lịch Sử Định Mức Khoán - SCD Type 2)
`Mã bản ghi`, `Mã khoản`, `Tên khoản khoán / phụ cấp`, `Đối tượng áp dụng`, `Mức khoán cũ ₫`, `Mức khoán mới ₫`, `Đơn vị tính`, `Từ ngày`, `Đến ngày`, `Số quyết định`, `Ngày quyết định`, `Người ký`, `Lý do thay đổi`, `Trạng thái`.

### 14. Sheet `DM_BAC_LUONG` (Bảng Lương 5 Bậc Ngạch Vị Trí)
`Mã vị trí`, `Tên chức danh`, `Bậc`, `Loại bậc` (`BAC_THUONG` | `VUOT_KHUNG`), `Hệ số`, `Lương ngạch bậc (CB 2340K)`, `Ghi chú`, `Ngày hiệu lực`.

### 15. Sheet `DM_THAM_SO_LUONG` (Tham Số Pháp Lý & Lương Nghiệp Vụ)
`Nhóm tham số`, `Mã tham số`, `Tên tham số`, `Giá trị số`, `Giá trị chuỗi`, `Đơn vị`, `Từ ngày hiệu lực`, `Đến ngày`, `Căn cứ pháp lý`, `Ghi chú`.

### 16. Sheet `DM_CONG_THUC` (Danh Mục Công Thức 4 Tầng Lương)
`Mã CT`, `Tên thành phần`, `Thứ tự`, `Cách tính`, `Tính BHXH`, `Tính Thuế`, `Miễn thuế tối đa`, `Phạm vi áp dụng`, `Bật/tắt`, `Ghi chú`.

### 17. Sheet `KQ_LUONG_THANG` (Bảng Kết Quả Tính Lương Hàng Tháng)
`Kỳ lương`, `Mã NV`, `Họ và tên`, `Chức danh`, `Bậc`, `Hệ số`, `Ngày công chuẩn`, `Ngày công thực`, `Lương ngạch bậc`, `Thâm niên CT`, `Vượt khung`, `Phụ cấp TN`, `Ăn trưa`, `Xăng xe`, `Điện thoại`, `Trang phục`, `Khoán khác`, `Điểm KPI`, `Lương KPI`, `Tiền thưởng`, `Tiền thừa BHXH`, `Tổng Gross`, `Căn cứ đóng BHXH`, `BHXH NLĐ 8%`, `BHYT NLĐ 1.5%`, `BHTN NLĐ 1%`, `Tổng khấu trừ BH`, `Thu nhập chịu thuế`, `Giảm trừ bản thân`, `Giảm trừ NPT`, `Thu nhập tính thuế`, `Thuế TNCN`, `Thực lĩnh Net`, `BHXH Quỹ 17.5%`, `BHYT Quỹ 3%`, `BHTN Quỹ 1%`, `Tổng chi phí Quỹ`, `Trạng thái`, `Người tạo`, `Thời gian tạo`.
