# 🛡️ AN TOÀN, BẢO MẬT & QUY TẮC PHÁT TRIỂN CỐT LÕI
## Dự Án: Hệ Thống Quản Trị Lương, Nhân Sự, Chấm Công & KPI 2027 Pro V3
### Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ

---

## 1. Tính Toàn Vẹn & Bất Biến Của Số Liệu Lương (Financial Invariants)

Số liệu chi trả lương và chế độ cho người lao động là tài sản thiêng liêng, nhạy cảm và là căn cứ pháp lý quyết toán tài chính của Quỹ:
1. **Tính Bất Biến Của Kỳ Lương Đã Khóa (Immutable Ledger)**:
   - Một khi bảng lương tháng đã được Lãnh đạo phê duyệt và chuyển trạng thái `ĐÃ KHÓA`, dữ liệu trong bảng `BL_LICHSU` trở thành vĩnh cửu.
   - Không được phép sửa trực tiếp hoặc xóa bản ghi đã khóa từ giao diện người dùng.
   - Mọi khoản chênh lệch, trả thiếu hoặc truy thu do phát hiện sai sót sau này bắt buộc phải lập **Bút toán điều chỉnh (Adjustment Record)** ghi vào kỳ lương tháng tiếp theo kèm lý do giải trình.
2. **Khóa Độc Quyền Chống Xung Đột Đồng Thời (Atomic Concurrency Control)**:
   - Toàn bộ các thao tác ghi dữ liệu lương, chốt sổ, cập nhật mức khoán phải được bọc trong `LockService.getScriptLock()` với thời gian chờ tối thiểu 15 giây.
   - Nếu có nhiều cán bộ bấm cùng lúc, hệ thống sẽ xếp hàng chờ xử lý tuần tự, triệt tiêu hoàn toàn nguy cơ đè số liệu (Race Condition).

---

## 2. Lưu Vết Lịch Sử Thay Đổi Định Mức Khoán (SCD Type 2)

Đối với các khoản khoán chi (ăn trưa, xăng xe, điện thoại) và hệ số ngạch bậc công tác của nhân sự:
- **Tuyệt đối không ghi đè số cũ**: Khi HĐQT ra Nghị quyết tăng phụ cấp ăn trưa từ `1.000.000 ₫` lên `1.200.000 ₫`, hệ thống không sửa đè lên dòng cũ.
- **Áp dụng mô hình SCD Type 2 (Slowly Changing Dimensions)**:
  - Đóng bản ghi cũ: Ghi ngày kết thúc hiệu lực `Đến ngày: 31/12/2026`, chuyển trạng thái `HẾT HIỆU LỰC`.
  - Mở bản ghi mới: Tạo dòng mới với mức khoán mới, `Từ ngày: 01/01/2027`, `Đến ngày: 31/12/2099`, đính kèm số Quyết định/Nghị quyết của HĐQT.
  - Nhờ đó, khi tra cứu lại bảng lương của các năm trước, hệ thống luôn lấy đúng định mức áp dụng tại thời điểm đó trong quá khứ mà không bị sai lệch.

---

## 3. Ma Trận Phân Quyền Truy Cập (Role-Based Access Control - RBAC)

Hệ thống thiết lập 4 vai trò rõ ràng:

| Quyền Hạn & Tính Năng | SUPER_ADMIN (Quản Trị Tối Cao) | KE_TOAN (Kế Toán - Tổ Chức) | LANH_DAO (Chủ Tịch, GĐ, Trưởng BKS) | NHAN_VIEN (Cán Bộ Nhân Viên) |
|:---|:---:|:---:|:---:|:---:|
| **Xem hồ sơ CBNV toàn Quỹ** | ✅ Đầy đủ | ✅ Đầy đủ | ✅ Đầy đủ | ❌ Chỉ xem hồ sơ cá nhân |
| **Thêm/Sửa hồ sơ & hệ số lương** | ✅ | ✅ | ❌ Chỉ xem | ❌ |
| **Chấm công & Đánh giá KPI** | ✅ | ✅ | ✅ Phê duyệt | ❌ Chỉ xem kết quả cá nhân |
| **Tính toán & Khóa sổ bảng lương** | ✅ | ✅ Đề xuất | ✅ Phê duyệt khóa | ❌ |
| **Tra cứu phiếu lương cá nhân** | ✅ | ✅ | ✅ | ✅ Chỉ xem phiếu của mình |
| **Gửi phản hồi thắc mắc lương** | ✅ | ✅ | ✅ | ✅ Gửi câu hỏi cá nhân |
| **Xem & Trả lời phản hồi** | ✅ | ✅ Giải trình | ✅ Giám sát | ❌ Chỉ xem câu trả lời của mình |
| **Quản trị tài khoản & CSDL** | ✅ Đầy đủ | ❌ | ❌ | ❌ |

> 🔒 **BẢO VỆ DỮ LIỆU NHÂN VIÊN**: Cán bộ nhân viên (`NHAN_VIEN`) khi đăng nhập vào hệ thống **TUYỆT ĐỐI CHỈ ĐỌC (READ-ONLY)** dữ liệu lương và ngày công của chính bản thân mình. Tuyệt đối không để lộ thông tin lương của đồng nghiệp khác trên giao diện.

---

## 4. Chuẩn Mực Giao Diện, Ngôn Từ & Typography Ngân Quỹ

1. **Chuẩn Mực Định Danh & Ngôn Từ Chuyên Nghiệp (Zero AI / Zero Sparkles)**:
   - Tuyệt đối **không sử dụng biểu tượng ngôi sao lấp lánh (Sparkles), icon robot, từ ngữ bot ảo hoặc thuật ngữ kỹ thuật AI** trên giao diện.
   - 100% ngôn từ phải theo chuẩn mực kế toán tài chính Quỹ tín dụng nhân dân: *Lương ngạch bậc, Lương hiệu quả KPI, Phụ cấp trách nhiệm, Thù lao quản trị, Giảm trừ gia cảnh, Khóa sổ kỳ lương, Phiếu thanh toán tiền lương*.
   - Định danh đơn vị chuẩn mực: `Quỹ tín dụng nhân dân Yên Thọ`, địa chỉ `Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá`, địa danh văn bản `Quý Lộc`.
2. **Typography & Màu Sắc Thương Hiệu**:
   - Sử dụng 100% font chữ **Be Vietnam Pro**.
   - Định dạng hiển thị các con số tài chính dùng `tabular-nums` (font numeric) để các chữ số thẳng hàng thẳng cột, chuyên nghiệp, không răng cưa.
   - Bảng màu chủ đạo: Xanh Navy sang trọng (`#17365d`) kết hợp màu Nhận diện Thương hiệu Brand Lime (`#9ACD32`) và Gold tinh tế.
3. **Định Dạng Thời Gian & Tiền Tệ**:
   - Múi giờ: 100% GMT+7 (`Asia/Ho_Chi_Minh`).
   - Ngày tháng: Định dạng chuẩn Việt Nam `dd/MM/yyyy`.
   - Tiền tệ: Phân cách hàng nghìn bằng dấu chấm (ví dụ: `15.500.000 ₫`), ô nhập tiền tự động định dạng real-time và hỗ trợ chuyển số thành chữ tiếng Việt khi in phiếu.
