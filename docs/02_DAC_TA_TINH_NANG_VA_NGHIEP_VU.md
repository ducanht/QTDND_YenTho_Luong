# 📋 ĐẶC TẢ TÍNH NĂNG & NGHIỆP VỤ HỆ THỐNG LƯƠNG 2027 PRO V3
## Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ (Thôn Tân Lộc, Xã Quý Lộc, Tỉnh Thanh Hoá)

---

## 1. Bản Đồ 7 Phân Hệ Nghiệp Vụ Cốt Lõi (Kiến Trúc V3.0)

Hệ thống được thiết kế tường minh theo 7 phân hệ nghiệp vụ chính, đáp ứng đầy đủ yêu cầu quản trị lương hiện đại của Quỹ tín dụng nhân dân Yên Thọ:

```
HỆ THỐNG QUẢN TRỊ LƯƠNG, NHÂN SỰ, CHẤM CÔNG & KPI 2027 PRO V3
│
├── 1. MÔ PHỎNG LƯƠNG ĐỘNG (DYNAMIC SIMULATION)
│   ├── Cấu hình linh hoạt Lương cơ sở, tỷ lệ thâm niên, vượt khung, trần BHXH, giảm trừ thuế
│   ├── Bảng lương theo chức danh và 5 bậc ngạch (Bậc 1 đến 5, chu kỳ nâng bậc 3 năm)
│   ├── Bỏ hoàn toàn các phương án cố định PA1/PA2/PA3 cứng nhắc; cho phép tạo kịch bản mới tùy biến
│   ├── Nhập tay toàn bộ tham số, phản ánh kết quả tức thì (Real-time recalculation)
│   └── Bộ 3 công cụ xuất báo cáo: Xuất Excel (.xls), Xuất Ảnh 2x Canvas, In PDF A4 kèm 3 chữ ký
│
├── 2. QUẢN LÝ NHÂN SỰ 360° (STAFF 360)
│   ├── Hồ sơ 12 CBNV đầy đủ: Họ tên, CCCD 12 số, MST, sổ BHXH, số NPT, số tài khoản Agribank
│   ├── Ngày đảm nhiệm chức vụ, thâm niên chức vụ thực tế và số năm quy đổi tương đương
│   ├── Bậc ngạch lương hiện hưởng (1-5), số năm vượt khung tích lũy sau bậc 5
│   ├── Mức đóng BHXH cá nhân hóa (tự chọn mức đóng, hoàn trả tiền thừa BHXH)
│   └── Quản lý số hóa tài liệu Google Drive: Link HĐLĐ, Link Phụ lục hợp đồng, Link Quyết định
│
├── 3. BẢNG CHẤM CÔNG HÀNG THÁNG (CHAM_CONG)
│   ├── Chấm công theo tháng: Ngày công chuẩn (22 ngày), ngày công thực tế
│   ├── Quản lý ngày nghỉ phép năm hưởng lương, nghỉ ốm chế độ, nghỉ không hưởng lương
│   └── Tự động tính hệ số ngày công: (Công thực + Công phép) / Công chuẩn
│
├── 4. ĐÁNH GIÁ CHỈ SỐ KPI THÁNG (DM_KPI & DG_KPI)
│   ├── Từ điển KPI nghiệp vụ Quỹ tín dụng nhân dân (Dư nợ, Huy động, Nợ xấu, Kế toán, Kho quỹ)
│   ├── Đánh giá theo trọng số (%) và chấm điểm thực hiện thực tế (Thang điểm 0 - 120%)
│   └── Tự động tính tỷ lệ hoàn thành KPI tổng hợp cho từng CBNV và khối phòng ban
│
├── 5. TÍNH TOÁN BẢNG LƯƠNG CHI TIẾT (PAYROLL ENGINE)
│   ├── Động cơ tính lương 4 tầng đọc tham số từ CSDL `DM_THAM_SO_LUONG` (Zero-hardcode)
│   ├── Bóc tách chi tiết 22 chỉ tiêu tài chính, lưu vào `KQ_LUONG_THANG` (Dự thảo/Chốt)
│   └── Khóa sổ bảng lương vĩnh viễn (Lock Payroll) vào `BL_LICHSU` bọc `LockService` atomicity
│
├── 6. BỘ CÔNG CỤ BÁO CÁO & XUẤT DỮ LIỆU ĐA PHƯƠNG THỨC
│   ├── Xuất Excel (.xls): Định dạng chuẩn bảng tính, đầy đủ màu sắc, tiêu đề và số liệu
│   ├── Xuất Ảnh Canvas High-DPI (2x scale): Sắc nét, tối ưu gửi nhanh qua Zalo và trình chiếu
│   └── In Báo Cáo / Xuất PDF (A4 Ngang): Chuẩn thể thức văn bản hành chính Quỹ tín dụng,
│       đầy đủ Quốc hiệu, Tiêu ngữ, Tên đơn vị và Khối 3 chữ ký:
│       * Người lập biểu (Kế toán tiền lương)
│       * Kế toán trưởng
│       * Chủ tịch HĐQT / Giám đốc
│
└── 7. CỔNG TỰ PHỤC VỤ CBNV & QUẢN TRỊ HỆ THỐNG
    ├── Tra cứu phiếu lương chi tiết từng tháng bằng tài khoản riêng
    ├── Hộp thư phản hồi thắc mắc lương 2 chiều giữa CBNV và Kế toán (Sheet `PHAN_HOI`)
    ├── Phân quyền RBAC 4 cấp: `SUPER_ADMIN`, `KE_TOAN`, `LANH_DAO`, `NHAN_VIEN`
    └── Nhật ký kiểm toán an toàn thông tin bất biến (`AUDIT_LOG`)
```

---

## 2. Chi Tiết Thuật Toán Tính Lương 4 Tầng V3.0 (Không Hardcode)

### A. Tầng 1: Lương Vị Trí & Ngạch Bậc (5 Bậc)
$$\text{Lương ngạch bậc} = \text{Lương cơ sở} \times \text{Hệ số bậc} \times \left( \frac{\text{Ngày công thực tế} + \text{Ngày nghỉ phép}}{\text{Ngày công chuẩn của tháng}} \right)$$
- **Lương cơ sở**: Đọc từ tham số `LUONG_CO_SO` trong `DM_THAM_SO_LUONG` (Mặc định `2.340.000 ₫/tháng`).
- **Hệ số bậc**: Được xác định theo Bậc ngạch của chức danh (Bậc 1 đến Bậc 5) cấu hình trong `DM_CHUCDANH` và `DM_BAC_LUONG`.
- **Chu kỳ nâng bậc**: 3 năm/bậc.

### B. Chế Độ Thâm Niên & Vượt Khung Chuẩn Quỹ
1. **Thâm niên công tác**:
   $$\text{Tỷ lệ thâm niên CT} = \min(\text{Số năm công tác} \times 5\%, 40\%)$$
   $$\text{Tiền thâm niên CT} = \text{Lương ngạch bậc} \times \text{Tỷ lệ thâm niên CT}$$
2. **Thâm niên chức vụ**:
   - Được tính từ **Ngày đảm nhiệm chức vụ** thực tế kết hợp với **Số năm thâm niên quy đổi** ghi nhận trong hồ sơ cán bộ.
3. **Cơ chế Vượt khung chung toàn Quỹ**:
   - Sau khi cán bộ đã đạt kịch trần **Bậc 5**, cứ mỗi chu kỳ **3 năm** giữ bậc 5 sẽ được hưởng thêm **5% vượt khung**.
   - Cơ chế này áp dụng thống nhất chung cho toàn thể cán bộ Quỹ, tối đa lên tới 8 lần (40%).
   $$\text{Tiền vượt khung} = \text{Lương ngạch bậc} \times (\text{Số lần vượt khung} \times 5\%)$$

$$\text{Lương vị trí cố định (L1)} = \text{Lương ngạch bậc} + \text{Tiền thâm niên CT} + \text{Tiền vượt khung}$$

### C. Tầng 2: Lương Hiệu Quả KPI & Tiền Thưởng
$$\text{Lương KPI} = \text{Lương vị trí (L1)} \times \text{Hệ số quỹ thưởng KPI chức danh} \times \left( \frac{\text{Điểm KPI tháng \%}}{100} \right) \times \left( \frac{\text{Công thực tế}}{\text{Công chuẩn}} \right)$$
- Điểm KPI tháng nằm trong dải từ 0% đến 120% dựa trên kết quả hoàn thành chỉ tiêu tại `DG_KPI`.
- Tiền thưởng thi đua/định mức được tính riêng và cộng trực tiếp vào thu nhập.

### D. Tầng 3: Phụ Cấp Trách Nhiệm & Các Khoản Khoán Công Vụ
- **Phụ cấp trách nhiệm**: Định mức theo chức danh quản lý (Chủ tịch HĐQT, Giám đốc, Trưởng BKS, KTT...).
- **Các khoản khoán công vụ** (Đọc quy tắc từ `DM_PHU_CAP`):
  - *Ăn trưa (ăn ca)*: `1.000.000 ₫/tháng` (Miễn thuế tối đa `730.000 ₫/tháng` theo TT 111/2013; phần chênh lệch `270.000 ₫` chịu thuế TNCN; miễn 100% BHXH).
  - *Xăng xe*: Khoán theo chức danh (`300.000 ₫` - `500.000 ₫`), miễn thuế và BHXH.
  - *Điện thoại*: Khoán theo nhu cầu liên lạc (`200.000 ₫` - `400.000 ₫`), miễn thuế và BHXH.
  - *Trang phục*: Khoán `500.000 ₫/tháng`, miễn thuế trong hạn mức quy chế.

### E. Tầng 4: BHXH Cá Nhân Hóa & Hoàn Trả Tiền Thừa BHXH
1. **Căn cứ đóng BHXH chuẩn (L1)**:
   $$\text{Căn cứ chuẩn L1} = \min(\text{Lương ngạch bậc} + \text{Phụ cấp trách nhiệm}, 20 \times \text{Lương cơ sở})$$
2. **Mức đóng cá nhân hóa**:
   - Cán bộ được phép đăng ký mức đóng BHXH riêng (`mucDongBhxh`) phù hợp nguyện vọng cá nhân.
   - Nếu đăng ký thấp hơn căn cứ chuẩn L1:
     $$\text{Chi phí BH Quỹ định mức} = \text{Căn cứ chuẩn L1} \times (10.5\% + 21.5\%) = \text{Căn cứ chuẩn L1} \times 32\%$$
     $$\text{Chi phí BH Quỹ thực tế} = \text{Mức đóng cá nhân} \times 21.5\%$$
     $$\text{Tiền thừa BHXH hoàn trả} = \text{Phần chênh lệch định mức Quỹ chi trả}$$
     *Khoản tiền thừa này được cộng trực tiếp vào Tổng Gross để chi trả lại cho cán bộ, đảm bảo quyền lợi tài chính tối đa.*
3. **Trích trừ bảo hiểm vào lương NLĐ (10.5%)**:
   - BHXH 8% + BHYT 1.5% + BHTN 1% tính trên Mức đóng cá nhân lựa chọn.
4. **Chi phí Quỹ nộp cơ quan bảo hiểm (21.5%)**:
   - BHXH 17.5% + BHYT 3% + BHTN 1%.

### F. Thuế Thu Nhập Cá Nhân (TNCN Lũy Tiến 7 Bậc)
- **Thu nhập chịu thuế** = Tổng Gross - Các khoản khoán miễn thuế theo quy chế.
- **Giảm trừ gia cảnh**:
  - Bản thân: `11.000.000 ₫/tháng` (Đọc từ tham số `TNCN_GIAM_TRU_BAN_THAN`).
  - Người phụ thuộc: `4.400.000 ₫/người/tháng` $\times$ Số NPT ghi nhận tại `DM_NS`.
- **Thu nhập tính thuế (TNTT)** = Thu nhập chịu thuế - Giảm trừ gia cảnh - Khấu trừ BHXH NLĐ (10.5%).
- Biểu thuế lũy tiến từng phần 7 bậc theo quy định pháp luật (TT 111/2013/TT-BTC).

### G. Thực Lĩnh (Lương Net Chuyển Khoản)
$$\text{Thực Lĩnh Net} = \text{Tổng Gross} - \text{Tổng Khấu Trừ BH (10.5\%)} - \text{Thuế TNCN}$$

---

## 3. Quy Trình Nghiệp Vụ Khóa Sổ & Bảo Toàn Dữ Liệu

1. **Giai đoạn Dự thảo & Mô phỏng (Simulation & Draft)**:
   - Kế toán và Lãnh đạo tự do điều chỉnh các tham số, thử nghiệm các kịch bản mô phỏng.
   - Kết quả dự thảo được lưu vào sheet `KQ_LUONG_THANG` với trạng thái `DRAFT`.
   - Xuất file Excel, Ảnh Canvas hoặc in bản thảo PDF để họp Ban Giám đốc và HĐQT biểu quyết.
2. **Giai đoạn Khóa sổ vĩnh viễn (Lock Payroll)**:
   - Sau khi HĐQT thông qua, Kế toán trưởng kích hoạt chức năng "Khóa sổ bảng lương".
   - Hệ thống kích hoạt `lockMonthlyPayroll()` trên Google Apps Script, bọc `LockService.getScriptLock()` 15 giây.
   - Ghi dữ liệu đã chốt vào bảng `BL_LICHSU` và cập nhật `KQ_LUONG_THANG` sang trạng thái `LOCKED`.
   - Dòng lương đã khóa trở thành bản ghi **BẤT BIẾN (Immutable)**, bảo toàn 100% dữ liệu lịch sử để phục vụ kiểm toán Ngân hàng Nhà nước và Cơ quan Thuế.
