QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
HỆ THỐNG QUẢN TRỊ LƯƠNG, CHẤM CÔNG & KPI 2027 – BẢN CHÍNH THỨC (PRO V2)

========================================================================
1. CÁCH CHẠY ỨNG DỤNG
========================================================================
- Cách 1 (Nhanh nhất): Nhấp đúp chuột trực tiếp vào file "index.html" để mở bằng trình duyệt Microsoft Edge hoặc Google Chrome.
- Cách 2 (Khuyến nghị): Mở PowerShell hoặc CMD tại thư mục này và gõ:
    python -m http.server 5173
  Sau đó mở trình duyệt truy cập: http://localhost:5173
- Ứng dụng hoạt động 100% độc lập, không cần cài đặt Node.js, không cần internet vẫn chạy bình thường.

========================================================================
2. CÁC PHÂN HỆ CHỨC NĂNG CHÍNH
========================================================================
1. TỔNG QUAN (DASHBOARD & BIỂU ĐỒ TRỰC QUAN)
   - Xem tổng quan quy mô nhân sự (13 CBNV + dự phòng biên chế).
   - Biểu đồ thanh so sánh tổng quỹ lương năm của 3 phương án (PA1, PA2, PA3).
   - Biểu đồ phân bổ cơ cấu chi phí lương và khoảng cách thu nhập.

2. SO SÁNH 3 PHƯƠNG ÁN (PA1 / PA2 / PA3)
   - So sánh chênh lệch tuyệt đối (₫) và tương đối (%) giữa các kịch bản.

3. 🔒 CHỐT KHUNG LƯƠNG CHÍNH THỨC (HĐQT PHÊ DUYỆT)
   - Cho phép chọn 1 phương án (PA1/PA2/PA3) để "Khóa chốt" làm khung biểu lương chính thức của Quỹ theo Quyết định/Nghị quyết của HĐQT.
   - Khi đã chốt, khung này được bảo vệ cố định và tự động nạp vào Bảng chấm công và Bảng lương hàng tháng.
   - Hỗ trợ mở khóa khi cần điều chỉnh chính sách.

4. 📅 QUẢN LÝ CHẤM CÔNG & KPI HÀNG THÁNG
   - Chọn kỳ tính lương theo tháng/năm (ví dụ: Tháng 01/2027, Tháng 02/2027...).
   - Đặt số ngày công tiêu chuẩn trong tháng (22 hoặc 26 ngày).
   - Nút "Điền nhanh đủ công" tự động điền 22 ngày công và 100% KPI cho toàn bộ cán bộ.
   - Cho phép điều chỉnh chi tiết từng cán bộ: ngày công thực tế, ngày nghỉ phép, ngày nghỉ không lương, % hoàn thành KPI, thưởng thêm hoặc trừ phạt chuyên cần.

5. 💰 BẢNG LƯƠNG THÁNG & IN ẤN CHUẨN MỰC (MẪU 02-LĐTL)
   - Tự động tính toán chi tiết:
     + Lương ngạch bậc theo ngày công thực tế.
     + Lương hiệu quả KPI cá nhân.
     + Tiền thưởng hiệu quả.
     + Phụ cấp công việc (tiền ăn giữa ca tính chuẩn theo ngày công thực tế, điện thoại, xăng xe, trang phục...).
     + Thù lao quản trị & phụ cấp trách nhiệm HĐQT/BKS.
     + Tổng thu nhập trước khấu trừ (Gross).
     + Khấu trừ Bảo hiểm NLĐ đóng: BHXH (8%), BHYT (1.5%), BHTN (1%) = 10.5%.
     + Thuế Thu nhập cá nhân (PIT) tạm tính sau khi trừ gia cảnh (15.5tr bản thân, 6.2tr/người phụ thuộc) và BHXH.
     + THỰC LĨNH (NET TAKE-HOME PAY).
     + Chi phí Bảo hiểm đơn vị đóng: BHXH (17.5%), BHYT (3%), BHTN (1%) = 21.5%.
   - Chức năng IN ẤN chuyên nghiệp:
     + 🖨️ "In Bảng lương toàn Quỹ": Khổ in A4 Ngang (Landscape) chuẩn biểu mẫu kế toán ngân hàng / TCTD, có số tiền bằng chữ tiếng Việt và 4 vị trí ký tên (Người lập biểu, Kế toán trưởng, Ban Kiểm soát, Chủ tịch HĐQT / Giám đốc).
     + 🖨️ "In Phiếu lương cá nhân": Khổ A5/A4 đứng, in phiếu chi tiết từng khoản thu nhập/khấu trừ để phát cho từng cán bộ.
     + 📥 Xuất file CSV/Excel bảng lương tháng.

6. 🛡️ BẢO HIỂM XÃ HỘI & THUẾ PIT
   - Bảng phân loại từng khoản chi có tính BHXH hay chịu thuế PIT.
   - Bảng tổng hợp nghĩa vụ nộp BHXH toàn Quỹ (phần Quỹ gánh chịu 21.5% và phần NLĐ trừ lương 10.5%).

7. ☁️ ĐỒNG BỘ CƠ SỞ DỮ LIỆU ONLINE LÂU DÀI (GOOGLE SHEETS)
   - Kết nối với Google Sheets của Quỹ thông qua Google Apps Script Web App.
   - Lưu trữ vĩnh viễn, an toàn tuyệt đối, 100% miễn phí, không lo mất mát khi đổi máy tính.
   - Tự động lưu 6 bảng dữ liệu: Cấu hình & Chốt lương, Khung vị trí, HĐQT/BKS, Danh sách CBNV, Chấm công KPI tháng, Lịch sử Bảng lương.
   - Hỗ trợ xuất/nhập file sao lưu dự phòng định dạng JSON.

========================================================================
3. HƯỚNG DẪN KẾT NỐI GOOGLE SHEETS
========================================================================
- Xem chi tiết tại tệp tin: "HUONG_DAN_TRIEN_KHAI_CSDL_ONLINE.md"
- File mã nguồn Google Apps Script backend đã được chuẩn bị sẵn tại:
  "gas_backend/Code.js"

========================================================================
4. THÔNG TIN ĐƠN VỊ & BẢN QUYỀN
========================================================================
- Đơn vị: QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
- Địa chỉ: Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá
- Địa danh văn bản: Quý Lộc
- Năm áp dụng: 2027 Pro V2
