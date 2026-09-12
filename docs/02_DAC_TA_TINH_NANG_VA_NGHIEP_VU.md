# 📋 ĐẶC TẢ TÍNH NĂNG & NGHIỆP VỤ HỆ THỐNG LƯƠNG 2027 PRO V2
## Đơn Vị: Quỹ Tín Dụng Nhân Dân Yên Thọ

---

## 1. Bản Đồ 9 Phân Hệ Nghiệp Vụ Cốt Lõi

```
HỆ THỐNG QUẢN TRỊ LƯƠNG & NHÂN SỰ QTDND YÊN THỌ
│
├── 1. QUẢN LÝ HỒ SƠ NHÂN SỰ 360° (DM_NS & LS_CONGTAC)
│   ├── Hồ sơ cá nhân, CCCD 12 số, tài khoản NH, MST, sổ BHXH, số người phụ thuộc
│   ├── Lịch sử diễn biến công tác & quyết định bổ nhiệm/nâng bậc
│   └── Bộ lọc đa năng theo Khối phòng ban, trạng thái làm việc
│
├── 2. KHUNG VỊ TRÍ, CHỨC DANH & HỆ SỐ LƯƠNG (DM_CHUCDANH)
│   ├── Khung 10 chức danh chuẩn hóa (Chủ tịch HĐQT, GĐ, KTT, CB Tín dụng, Thủ quỹ...)
│   ├── 3 Phương án hệ số: PA1 (Thử nghiệm), PA2 (Đề xuất chuẩn), PA3 (Đột phá)
│   └── Phụ cấp trách nhiệm & thù lao quản trị theo chức danh
│
├── 3. QUẢN LÝ CHỈ SỐ & ĐÁNH GIÁ KPI THÁNG (DM_KPI & DG_KPI)
│   ├── Từ điển KPI nghiệp vụ Quỹ tín dụng nhân dân (Dư nợ, Huy động, Nợ xấu, Kế toán)
│   ├── Đánh giá theo trọng số (%) và chấm điểm thực hiện thực tế
│   └── Tự động tính tỷ lệ hoàn thành KPI tổng hợp cho từng CBNV
│
├── 4. BẢNG CHẤM CÔNG & QUẢN LÝ NGHỈ PHÉP (CHAM_CONG)
│   ├── Chấm công theo tháng: Ngày công chuẩn (22 ngày), ngày công thực tế
│   ├── Quản lý ngày nghỉ phép hưởng lương, nghỉ ốm, nghỉ không hưởng lương
│   └── Tự động tính hệ số ngày công hưởng lương thời gian: (Công thực + Công phép) / Công chuẩn
│
├── 5. PHỤ CẤP KHOÁN & LỊCH SỬ THAY ĐỔI SCD-2 (DM_PHU_CAP & LS_KHOAN)
│   ├── Danh mục 10 khoản khoán & phụ cấp (Ăn ca, Xăng xe, Điện thoại, Trang phục, Công tác phí...)
│   ├── Quy tắc bóc tách căn cứ tính BHXH và Thuế TNCN theo luật định
│   └── Lưu vết lịch sử thay đổi định mức (SCD Type 2: Từ ngày - Đến ngày, Quyết định, Lý do)
│
├── 6. ĐỘNG CƠ TÍNH LƯƠNG 4 TẦNG & KHÓA SỔ (BL_LICHSU)
│   ├── Tầng 1: Lương ngạch bậc thời gian (Lương cơ sở × Hệ số × Tỷ lệ công)
│   ├── Tầng 2: Lương hiệu quả công việc KPI & Tiền thưởng
│   ├── Tầng 3: Phụ cấp trách nhiệm, thù lao quản trị & Các khoản khoán công vụ
│   ├── Tầng 4: Trích đóng BHXH/BHYT/BHTN (10.5% NLĐ, 21.5% Đơn vị) & Thuế TNCN lũy tiến từng phần
│   └── Quy trình Chốt sổ & Khóa bảng lương bất biến vĩnh viễn (LockService chống xung đột)
│
├── 7. CỔNG TỰ PHỤC VỤ CBNV (EMPLOYEE SELF-SERVICE)
│   ├── Tra cứu phiếu lương chi tiết từng tháng bằng tài khoản cá nhân
│   ├── Xem biểu đồ diễn biến thu nhập, tỷ lệ KPI và các khoản giảm trừ
│   └── Gửi câu hỏi / Phản hồi trực tiếp tới Kế toán - Lãnh đạo khi có thắc mắc lương
│
├── 8. PHÂN QUYỀN TRUY CẬP RBAC 4 CẤP ĐỘ (TAIKHOAN)
│   ├── Cấp 1 (SUPER_ADMIN): Quản trị toàn hệ thống, sao lưu CSDL, quản lý tài khoản
│   ├── Cấp 2 (KE_TOAN): Quản lý hồ sơ nhân sự, chấm công, tính lương, điều chỉnh phụ cấp
│   ├── Cấp 3 (LANH_DAO): Xem toàn bộ bảng lương, báo cáo quỹ lương, phê duyệt khóa sổ
│   └── Cấp 4 (NHAN_VIEN): Chỉ xem thông tin cá nhân và phiếu lương của chính mình (Read-only)
│
└── 9. NHẬT KÝ KIỂM TOÁN & HỘP THƯ PHẢN HỒI (AUDIT_LOG & PHAN_HOI)
    ├── Ghi vết tự động mọi lượt đăng nhập, tính lương, chốt lương, sửa hồ sơ (Audit Trail)
    ├── Quản lý trạng thái giải quyết thắc mắc lương: MỚI -> ĐANG XỬ LÝ -> ĐÃ GIẢI QUYẾT
    └── Đảm bảo tính minh bạch, dân chủ cơ sở trong Quỹ tín dụng nhân dân.
```

---

## 2. Chi Tiết Thuật Toán Tính Lương 4 Tầng & Thuế / BHXH

### A. Tầng 1: Lương Ngạch Bậc Theo Ngày Công (Thời gian)
$$\text{Lương ngạch bậc} = \text{Lương cơ sở} \times \text{Hệ số lương} \times \left( \frac{\text{Ngày công thực tế} + \text{Ngày nghỉ phép}}{\text{Ngày công chuẩn của tháng}} \right)$$
- *Trong đó*:
  - Lương cơ sở áp dụng theo Nghị định Chính phủ hoặc mức lương tối thiểu nội bộ do HĐQT phê duyệt (Ví dụ: `2.340.000 ₫`).
  - Ngày công chuẩn mặc định: `22` ngày/tháng (trừ Thứ Bảy, Chủ Nhật).

### B. Tầng 2: Lương Hiệu Quả KPI & Tiền Thưởng
$$\text{Lương KPI} = \text{Hệ số KPI} \times \text{Lương cơ sở} \times \text{Tỷ lệ hoàn thành KPI (\%)} \times \left( \frac{\text{Ngày công thực tế}}{\text{Ngày công chuẩn}} \right)$$
$$\text{Tiền thưởng} = \text{Mức thưởng chức danh} \times \text{Tỷ lệ thưởng \%} + \text{Thưởng thi đua thêm ₫}$$

### C. Tầng 3: Phụ Cấp Trách Nhiệm, Thù Lao & Các Khoản Khoán Công Vụ
- **Phụ cấp trách nhiệm**: Áp dụng cho Chủ tịch HĐQT, Giám đốc, Trưởng BKS, Kế toán trưởng... (Tính đóng BHXH và chịu Thuế TNCN).
- **Thù lao quản trị**: Áp dụng cho thành viên HĐQT, BKS (Không đóng BHXH, chịu Thuế TNCN).
- **Các khoản khoán công vụ**:
  - *Ăn trưa (ăn ca)*: Định mức tối đa theo TT 111/2013 là `730.000 ₫/tháng` được miễn thuế TNCN. Phần vượt mức (nếu có) tính vào thu nhập chịu thuế. Miễn hoàn toàn BHXH.
  - *Xăng xe, Điện thoại, Trang phục*: Chi theo quy chế khoán công tác, được miễn Thuế TNCN và BHXH nếu có đầy đủ quy chế và quyết định của HĐQT.
  - *Công tác phí*: Thanh toán theo chi phí thực tế phát sinh hoặc khoán ngày lưu trú có giấy đi đường.

### D. Tầng 4: Trích Đóng BHXH/BHYT/BHTN & Thuế TNCN
#### 1. Trích nộp BHXH bắt buộc:
- **Tỷ lệ trừ vào lương người lao động (10.5%)**:
  - BHXH: `8.0%`
  - BHYT: `1.5%`
  - BHTN: `1.0%`
- **Tỷ lệ đơn vị sử dụng lao động đóng thay (21.5%)**:
  - BHXH: `17.0%` (trong đó hưu trí tử tuất 14%, ốm đau thai sản 3%)
  - BHYT: `3.0%`
  - BHTN: `1.0%`
  - BHTNLĐ-BNN: `0.5%`
- **Tiền lương làm căn cứ đóng BHXH**:
  $$\text{Lương đóng BHXH} = \text{Lương ngạch bậc} + \text{Phụ cấp trách nhiệm/chức vụ}$$
  *(Áp dụng mức trần tối đa bằng 20 lần mức lương cơ sở theo Luật BHXH 2024)*.

#### 2. Thuế Thu Nhập Cá Nhân (TNCN):
- **Thu nhập chịu thuế** = Tổng Gross - Các khoản khoán công vụ miễn thuế.
- **Các khoản giảm trừ**:
  - Giảm trừ bản thân người nộp thuế: `11.000.000 ₫/tháng`.
  - Giảm trừ người phụ thuộc: `4.400.000 ₫/người/tháng` (tính theo số NPT tại `DM_NS`).
  - Các khoản bảo hiểm bắt buộc đã trừ vào lương (10.5%).
- **Thu nhập tính thuế (TNTT)** = Thu nhập chịu thuế - Các khoản giảm trừ.
- Nếu $\text{TNTT} \le 0$: Thuế TNCN = `0 ₫`.
- Nếu $\text{TNTT} > 0$: Áp dụng biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN:
  - Bậc 1 (Đến 5 triệu ₫): `5%`
  - Bậc 2 (Trên 5 đến 10 triệu ₫): `10% - 250.000 ₫`
  - Bậc 3 (Trên 10 đến 18 triệu ₫): `15% - 750.000 ₫`
  - Bậc 4 (Trên 18 đến 32 triệu ₫): `20% - 1.650.000 ₫`
  - Bậc 5 (Trên 32 đến 52 triệu ₫): `25% - 3.250.000 ₫`
  - Bậc 6 (Trên 52 đến 80 triệu ₫): `30% - 5.850.000 ₫`
  - Bậc 7 (Trên 80 triệu ₫): `35% - 9.850.000 ₫`

#### 3. Thực Lĩnh (Lương Net):
$$\text{Thực Lĩnh} = \text{Tổng Gross} - \text{BHXH NLĐ (10.5\%)} - \text{Thuế TNCN} - \text{Trừ phạt/Thu hồi khác}$$

---

## 3. Quy Trình Nghiệp Vụ Khóa Sổ & Chống Sửa Đổi Lịch Sử

1. **Giai đoạn Dự thảo (Draft)**:
   - Kế toán nhập công, cập nhật KPI, kiểm tra số liệu.
   - Có thể bấm tính toán và điều chỉnh nhiều lần mà không ảnh hưởng CSDL chính thức.
2. **Giai đoạn Phê duyệt (Approval)**:
   - Giám đốc / Chủ tịch HĐQT kiểm tra bảng lương tổng hợp và các chỉ số toàn Quỹ.
3. **Giai đoạn Khóa sổ vĩnh viễn (Lock Payroll)**:
   - Khi bấm "Khóa sổ bảng lương tháng YYYY-MM", hệ thống kích hoạt `PayrollController.lockPayroll()`.
   - Sử dụng `LockService.getScriptLock()` chờ tối đa 15 giây để chống xung đột race condition.
   - Ghi toàn bộ dữ liệu đã chốt vào bảng `BL_LICHSU`. Dòng lương đã khóa trở thành bản ghi **BẤT BIẾN (Immutable)**, cấm ghi đè hoặc xóa trực tiếp từ giao diện thông thường.
   - Mọi điều chỉnh sau khi đã khóa sổ bắt buộc phải ghi bút toán điều chỉnh ở kỳ lương tiếp theo kèm lý do giải trình.
