# ĐẶC TẢ CHI TIẾT CẤU TRÚC CƠ SỞ DỮ LIỆU GOOGLE SHEETS
## HỆ THỐNG QUẢN TRỊ LƯƠNG, NHÂN SỰ, CHẤM CÔNG & KPI – QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ

> **Tài liệu chuẩn hóa CSDL**: Phiên bản 2.0 (Tháng 09/2026 - Áp dụng kỳ lương 2027 Pro V2)  
> **Đơn vị quản lý**: Quỹ tín dụng nhân dân Yên Thọ (`Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá`)  
> **Nền tảng lưu trữ**: Google Sheets (Google Drive Quỹ tín dụng nhân dân Yên Thọ)  
> **Quy tắc bảo trì**: Bất kỳ sự thay đổi, bổ sung cột hoặc bảng mới nào đều bắt buộc phải cập nhật vào tài liệu này.

---

## 🏛️ 1. BẢNG DANH MỤC 13 SHEETS CHUẨN HÓA (TÊN VIẾT TẮT)

Để đảm bảo thanh tab trên Google Sheets gọn gàng, trực quan và dễ đọc, toàn bộ các bảng được đặt tên bằng các từ viết tắt ngắn gọn chuẩn nghiệp vụ:

| STT | Tên Sheet viết tắt | Tên đầy đủ | Ý nghĩa nghiệp vụ | Cố định (Freeze) |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **`DM_NS`** | Danh mục Nhân sự 360° | Hồ sơ cá nhân, liên hệ, ảnh thẻ, CCCD, số NPT, số tài khoản nhận lương | Hàng 1, Cột 2 (A-B) |
| 2 | **`LS_CONGTAC`** | Lịch sử Công tác & Hệ số | Lưu vết lịch sử chức danh, bậc, hệ số lương theo từng giai đoạn hiệu lực | Hàng 1, Cột 3 (A-C) |
| 3 | **`DM_CHUCDANH`**| Khung Chức danh & Hệ số | Khung 10 chức danh vị trí và ma trận 3 kịch bản hệ số PA1/PA2/PA3 | Hàng 1, Cột 2 (A-B) |
| 4 | **`DM_KPI`** | Từ điển Chỉ số KPI | Danh mục các tiêu chí đo lường hiệu quả công việc chuyên môn QTDND | Hàng 1, Cột 2 (A-B) |
| 5 | **`CHAM_CONG`** | Chấm công Hàng tháng | Quản lý ngày công đi làm, phép năm, nghỉ lễ, nghỉ ốm theo từng tháng | Hàng 1, Cột 3 (A-C) |
| 6 | **`DG_KPI`** | Đánh giá KPI Hàng tháng | Chi tiết kết quả thực hiện, tỷ lệ hoàn thành và điểm số từng chỉ số KPI | Hàng 1, Cột 4 (A-D) |
| 7 | **`BL_LICHSU`** | Lịch sử Bảng Lương | Bóc tách chi tiết từng khoản khoán, căn cứ đóng BHXH, thuế TNCN, Net | Hàng 1, Cột 3 (A-C) |
| 8 | **`TAIKHOAN`** | Tài khoản & Phân quyền | Quản lý đăng nhập, mật khẩu mã hóa SHA-256 và vai trò RBAC | Hàng 1, Cột 3 (A-C) |
| 9 | **`AUDIT_LOG`** | Nhật ký Truy cập & Thao tác| Lưu vết an toàn thông tin: ai đăng nhập, xem gì, sửa gì, lúc nào | Hàng 1, Cột 2 (A-B) |
| 10 | **`PHAN_HOI`** | Hộp thư Phản hồi Lương | Kênh giải đáp thắc mắc lương 2 chiều giữa Người lao động và Kế toán | Hàng 1, Cột 4 (A-D) |
| 11 | **`THAM_SO`** | Tham số Hệ thống | Mức lương cơ bản, tỷ lệ bảo hiểm, định mức chi tiêu chung toàn đơn vị | Hàng 1, Cột 2 (A-B) |
| 12 | **`DM_PHU_CAP`** | Danh mục Phụ cấp & Khoán | Cấu hình cờ tính BHXH, tính Thuế TNCN và hạn mức miễn trừ từng khoản | Hàng 1, Cột 2 (A-B) |
| 13 | **`LS_KHOAN`** | Lịch sử Định mức Khoán | Lưu vết các quyết định thay đổi mức khoán: Mức cũ, Mức mới, Từ ngày | Hàng 1, Cột 3 (A-C) |

---

## 🔗 2. SƠ ĐỒ MỐI QUAN HỆ KHÓA DỮ LIỆU (ERD)

- **Khóa chính (PK - Primary Key)**: Giá trị duy nhất định danh từng dòng dữ liệu.
- **Khóa ngoại (FK - Foreign Key)**: Trường dữ liệu dùng để liên kết sang bảng khác.

```
[DM_CHUCDANH] (ma_vi_tri)
      ▲
      │ (FK: ma_vi_tri)
[LS_CONGTAC] (id_lich_su, ma_nv, tu_ngay, den_ngay)
      ▲
      │ (FK: ma_nv)
[DM_NS] (ma_nv) ◄──────────────┬──────────────────────────┐
      ▲                        │ (FK: ma_nv)              │ (FK: ma_nv)
      │ (FK: ma_nv)            ▼                          ▼
      │                  [CHAM_CONG]                [TAIKHOAN]
      │             (ky_luong, ma_nv)             (id_tai_khoan, ma_nv)
      │                        │                          │
      │                        ▼ (FK: ky_luong, ma_nv)     ▼
      │                  [BL_LICHSU]               [AUDIT_LOG]
      │             (ky_luong, ma_nv)             (id_log, ma_nv)
      │                   ▲    ▲                          ▲
      │                   │    │                          │
      │        (Ánh xạ)   │    └──────────────────────────┘
      │      [DM_PHU_CAP] │              [PHAN_HOI]
      │      (ma_khoan) ──┤         (id_phan_hoi, ma_nv)
      │           ▲       │
      │           │ (FK: ma_khoan)
      │      [LS_KHOAN] ──┘ (Tra cứu mức áp dụng theo thời kỳ)
      │  (id_lsk, tu_ngay, den_ngay)
      └───────────────────────────────────┘
```

---

## 📋 3. ĐẶC TẢ CHI TIẾT TỪNG BẢNG DỮ LIỆU

---

### BẢNG 1: `DM_NS` (Danh Mục Nhân Sự 360°)
- **Mục đích**: Hồ sơ lý lịch trích ngang, thông tin liên lạc, tài khoản ngân hàng, thông tin gia cảnh để tính thuế TNCN.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu dữ liệu | Định dạng | Căn lề | Khóa | Ràng buộc / Quy tắc |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_nv` | Mã NV | Text | `@` | Giữa | **PK** | Định dạng `NVxx` (Duy nhất, không trùng) |
| **B** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Viết hoa chữ cái đầu, có dấu tiếng Việt |
| **C** | `chuc_danh` | Chức danh | Text | `@` | Trái | | Chức danh chuyên môn hiện tại |
| **D** | `phong_ban` | Khối phòng ban | Text | `@` | Trái | | `HĐQT`, `BKS`, `Điều hành`, `Tín dụng`, `Kế toán`, `Hỗ trợ` |
| **E** | `so_dien_thoai` | Điện thoại | Text | `@` | Giữa | | 10 chữ số (Bắt đầu bằng 0) |
| **F** | `email` | Email | Text | `@` | Trái | | Email hợp lệ |
| **G** | `ngay_sinh` | Ngày sinh | Date | `dd/MM/yyyy` | Giữa | | Ngày sinh dương lịch |
| **H** | `gioi_tinh` | Giới tính | Text | `@` | Giữa | | `Nam` hoặc `Nữ` |
| **I** | `so_cccd` | Số CCCD | Text | `@` | Giữa | | Đúng 12 chữ số |
| **J** | `ngay_cap_cccd` | Ngày cấp CCCD | Date | `dd/MM/yyyy` | Giữa | | |
| **K** | `noi_cap_cccd` | Nơi cấp CCCD | Text | `@` | Trái | | `Cục CSQLHC về TTXH` |
| **L** | `dia_chi` | Địa chỉ thường trú | Text | `@` | Trái | | Thôn, xã, tỉnh |
| **M** | `ngay_vao_lam` | Ngày vào làm | Date | `dd/MM/yyyy` | Giữa | | Ngày tuyển dụng vào Quỹ |
| **N** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `ĐANG LÀM`, `NGHỈ PHÉP DÀI`, `THÔI VIỆC` |
| **O** | `so_npt` | Số NPT | Number | `0` | Phải | | Số người phụ thuộc giảm trừ PIT ($\ge 0$) |
| **P** | `so_tai_khoan` | Số tài khoản NH | Text | `@` | Giữa | | Số tài khoản chuyển khoản lương |
| **Q** | `ten_ngan_hang` | Tên ngân hàng | Text | `@` | Trái | | Chi nhánh ngân hàng mở thẻ |
| **R** | `mst_canhan` | Mã số thuế | Text | `@` | Giữa | | Mã số thuế TNCN (10 số) |
| **S** | `so_bhxh` | Số sổ BHXH | Text | `@` | Giữa | | Mã định danh BHXH (10 số) |
| **T** | `link_anh` | Link ảnh thẻ | Text/URL | `@` | Trái | | Đường dẫn ảnh chân dung (Google Drive) |
| **U** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Ghi chú bổ sung |

---

### BẢNG 2: `LS_CONGTAC` (Lịch Sử Công Tác & Hệ Số Lương)
- **Mục đích**: Lưu vết lịch sử thay đổi vị trí công việc, nâng bậc, nâng hệ số lương theo từng mốc thời gian (SCD Type 2).
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Mã bản ghi, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu dữ liệu | Định dạng | Căn lề | Khóa | Ràng buộc / Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_lich_su` | Mã bản ghi | Text | `@` | Giữa | **PK** | Ví dụ: `LS_NV01_2027` |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | **FK** | Liên kết `DM_NS.ma_nv` |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Tên cán bộ tại thời điểm đó |
| **D** | `so_quyet_dinh` | Số Quyết định | Text | `@` | Trái | | Số hiệu QĐ/NQ của HĐQT phê duyệt |
| **E** | `ngay_qd` | Ngày quyết định | Date | `dd/MM/yyyy` | Giữa | | Ngày ký văn bản |
| **F** | `tu_ngay` | Từ ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu hưởng hệ số này |
| **G** | `den_ngay` | Đến ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày hết hạn (`31/12/2099` nếu đang áp dụng) |
| **H** | `ma_vi_tri` | Mã vị trí | Text | `@` | Giữa | **FK** | Liên kết `DM_CHUCDANH.ma_vi_tri` |
| **I** | `chuc_danh` | Chức danh công tác | Text | `@` | Trái | | Chức danh tại giai đoạn đó |
| **J** | `bac` | Bậc | Number | `0` | Giữa | | Bậc lương ngạch chức danh |
| **K** | `he_so_luong` | Hệ số lương | Decimal | `0.00` | Phải | | Hệ số lương cơ bản (VD: 5.20, 2.85) |
| **L** | `ty_le_kpi` | Tỷ lệ KPI trần | Percent | `0.0%` | Phải | | Tỷ lệ KPI tối đa theo vị trí |
| **M** | `ty_le_thuong` | Tỷ lệ Thưởng trần | Percent | `0.0%` | Phải | | Tỷ lệ thưởng định mức |
| **N** | `phu_cap_tn` | Phụ cấp trách nhiệm | Currency | `#,##0 "₫"` | Phải | | Phụ cấp chức danh/quản trị hàng tháng |
| **O** | `thu_lao_qt` | Thù lao quản trị | Currency | `#,##0 "₫"` | Phải | | Thù lao HĐQT/BKS (nếu có) |
| **P** | `ly_do` | Lý do điều chỉnh | Text | `@` | Trái | | Bổ nhiệm mới, nâng bậc, chuyển khối |
| **Q** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HIỆN TẠI` (Active) hoặc `LỊCH SỬ` (Expired) |

---

### BẢNG 3: `DM_CHUCDANH` (Khung Chức Danh & Hệ Số PA1/PA2/PA3)
- **Mục đích**: Bảng chuẩn 10 vị trí của Quỹ, đối chiếu 3 phương án lương PA1 (Tiết kiệm), PA2 (Chuẩn 2027), PA3 (Tăng trưởng).
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã vị trí, Tên chức danh).

| Cột | Mã trường | Tên cột hiển thị | Kiểu dữ liệu | Định dạng | Căn lề | Khóa | Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_vi_tri` | Mã vị trí | Text | `@` | Giữa | **PK** | `P01` $\rightarrow$ `P10` |
| **B** | `ten_vi_tri` | Tên vị trí chức danh | Text | `@` | Trái | | Chủ tịch, Giám đốc, Kế toán, Tín dụng... |
| **C** | `khoi` | Khối | Text | `@` | Trái | | Lãnh đạo, Điều hành, Kiểm soát, Chuyên môn... |
| **D** | `bac` | Bậc | Number | `0` | Giữa | | Bậc khởi điểm |
| **E** | `so_luong` | Số lượng | Number | `0` | Giữa | | Số lượng biên chế theo vị trí |
| **F** | `pa1_hs` | PA1 Hệ số | Decimal | `0.00` | Phải | | Phương án 1 (Tiết kiệm) |
| **G** | `pa2_hs` | PA2 Hệ số (Chuẩn) | Decimal | `0.00` | Phải | | Phương án 2 (Đề xuất chuẩn 2027) |
| **H** | `pa3_hs` | PA3 Hệ số | Decimal | `0.00` | Phải | | Phương án 3 (Tăng trưởng) |
| **I** | `pa1_kpi` | PA1 KPI | Percent | `0.0%` | Phải | | Tỷ lệ KPI phương án 1 |
| **J** | `pa2_kpi` | PA2 KPI | Percent | `0.0%` | Phải | | Tỷ lệ KPI phương án 2 |
| **K** | `pa3_kpi` | PA3 KPI | Percent | `0.0%` | Phải | | Tỷ lệ KPI phương án 3 |
| **L** | `pa1_thuong` | PA1 Thưởng | Percent | `0.0%` | Phải | | Tỷ lệ thưởng phương án 1 |
| **M** | `pa2_thuong` | PA2 Thưởng | Percent | `0.0%` | Phải | | Tỷ lệ thưởng phương án 2 |
| **N** | `pa3_thuong` | PA3 Thưởng | Percent | `0.0%` | Phải | | Tỷ lệ thưởng phương án 3 |
| **O** | `phu_cap_tn` | Phụ cấp TN ₫ | Currency | `#,##0 "₫"` | Phải | | Định mức phụ cấp chức vụ |
| **P** | `thu_lao_qt` | Thù lao QT ₫ | Currency | `#,##0 "₫"` | Phải | | Định mức thù lao HĐQT/BKS |
| **Q** | `ngay_hieu_luc`| Ngày hiệu lực | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu áp dụng khung này |
| **R** | `quyet_dinh` | Quyết định phê duyệt | Text | `@` | Trái | | Nghị quyết HĐQT phê duyệt |

---

### BẢNG 4: `DM_KPI` (Từ Điển Chỉ Số KPI Nghiệp Vụ)
- **Mục đích**: Chuẩn hóa từ điển chỉ số đánh giá hiệu quả công việc cho từng mảng nghiệp vụ tín dụng, kế toán, kho quỹ.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã KPI, Tên chỉ số).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_kpi` | Mã KPI | Text | `@` | Giữa | **PK** | `KPI_TD_01`, `KPI_KT_01`... |
| **B** | `ten_kpi` | Tên chỉ số KPI | Text | `@` | Trái | | Tên gọi nghiệp vụ |
| **C** | `khoi_ap_dung` | Khối áp dụng | Text | `@` | Trái | | Tín dụng, Kế toán, Kiểm soát, Toàn Quỹ |
| **D** | `don_vi_tinh` | Đơn vị tính | Text | `@` | Giữa | | Triệu đồng, %, Lỗi, Điểm... |
| **E** | `trong_so_chuan`| Trọng số mặc định | Percent | `0.0%` | Phải | | Trọng số trong thang điểm 100% |
| **F** | `tieu_chuan_danh_gia`| Tiêu chuẩn / Công thức | Text | `@` | Trái | | Hướng dẫn cách chấm điểm chỉ số |

---

### BẢNG 5: `CHAM_CONG` (Chấm Công & Ngày Phép Tháng)
- **Mục đích**: Bảng chấm công hàng tháng của 13 CBNV.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | **PK/FK**| Định dạng `YYYY-MM` (VD: `2027-01`) |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | **PK/FK**| `NV01` $\rightarrow$ `NV13` |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Họ tên cán bộ |
| **D** | `chuc_danh` | Chức danh | Text | `@` | Trái | | Vị trí công tác |
| **E** | `cong_chuan` | Công chuẩn | Number | `0.0` | Phải | | Mặc định 22 ngày |
| **F** | `cong_thuc` | Công đi làm | Number | `0.0` | Phải | | Số ngày thực tế đi làm |
| **G** | `nghi_phep` | Nghỉ phép năm | Number | `0.0` | Phải | | Nghỉ phép hưởng nguyên lương |
| **H** | `nghi_le` | Nghỉ lễ tết | Number | `0.0` | Phải | | Nghỉ lễ theo quy định |
| **I** | `nghi_om` | Nghỉ ốm BHXH | Number | `0.0` | Phải | | Nghỉ hưởng trợ cấp BHXH |
| **J** | `nghi_khong_luong`| Nghỉ không lương | Number | `0.0` | Phải | | Nghỉ việc riêng không lương |
| **K** | `tong_cong` | Tổng công tính lương | Number | `0.0` | Phải | | $=\text{Công thực} + \text{Phép} + \text{Lễ}$ |
| **L** | `ty_le_cong` | Tỷ lệ công | Percent | `0.0%` | Phải | | $=\text{Tổng công} / \text{Công chuẩn}$ |
| **M** | `ghi_chu` | Ghi chú chấm công | Text | `@` | Trái | | Lý do nghỉ hoặc công tác ngoại kiểm |
| **N** | `nguoi_duyet` | Người duyệt | Text | `@` | Trái | | Kế toán trưởng hoặc Giám đốc duyệt |
| **O** | `ngay_duyet` | Ngày duyệt | Date | `dd/MM/yyyy` | Giữa | | Ngày ký duyệt bảng công |

---

### BẢNG 6: `DG_KPI` (Đánh Giá Chi Tiết KPI Tháng)
- **Mục đích**: Bảng chi tiết kết quả thực hiện các chỉ tiêu KPI của từng cán bộ.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 4 (Mã ĐG, Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_danh_gia` | Mã ĐG | Text | `@` | Giữa | **PK** | `DG_202701_NV09_01` |
| **B** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | **FK** | `2027-01` |
| **C** | `ma_nv` | Mã NV | Text | `@` | Giữa | **FK** | `NV09` |
| **D** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Tên nhân viên |
| **E** | `ma_kpi` | Mã KPI | Text | `@` | Giữa | **FK** | Liên kết `DM_KPI.ma_kpi` |
| **F** | `ten_kpi` | Tên chỉ số KPI | Text | `@` | Trái | | Tên chỉ số |
| **G** | `chi_tieu` | Chỉ tiêu giao | Text/Num | `@` | Phải | | Kế hoạch giao đầu tháng |
| **H** | `thuc_hien` | Kết quả đạt | Text/Num | `@` | Phải | | Số liệu thực tế đạt được |
| **I** | `ty_le_dat` | Tỷ lệ hoàn thành | Percent | `0.0%` | Phải | | Tỷ lệ % hoàn thành mục tiêu |
| **J** | `trong_so` | Trọng số | Percent | `0.0%` | Phải | | Trọng số chỉ số này trong tháng |
| **K** | `diem_so` | Điểm quy đổi | Decimal | `0.0` | Phải | | Điểm quy đổi vào KPI tháng |
| **L** | `nhan_xet` | Nhận xét của Lãnh đạo | Text | `@` | Trái | | Đánh giá của Trưởng phòng/Giám đốc |

---

### BẢNG 7: `BL_LICHSU` (Lịch Sử Bảng Lương Khóa Sổ Vĩnh Viễn - Chi Tiết Khoản Khoán)
- **Mục đích**: Bảng thanh toán lương tổng hợp đã khóa sổ, bóc tách chi tiết từng khoản khoán và chi phí công tác theo Hướng 1, căn cứ đóng BHXH và thuế TNCN chuẩn xác.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Ý nghĩa tài chính |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | Tháng/Năm (`2027-01`) |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | Khóa định danh cán bộ |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ nhận lương |
| **D** | `chuc_danh` | Chức danh | Text | `@` | Trái | Chức danh tại thời điểm đó |
| **E** | `he_so_luong` | Hệ số lương | Decimal | `0.00` | Phải | Hệ số lương ngạch bậc hưởng tại kỳ |
| **F** | `cong_thuc` | Công thực | Number | `0.0` | Phải | Số ngày công tính lương |
| **G** | `luong_ngach_bac`| Lương ngạch bậc | Currency| `#,##0 "₫"` | Phải | $\text{Lương cơ bản} \times \text{Hệ số} \times (\text{Công} / 22)$ |
| **H** | `luong_kpi` | Lương KPI | Currency| `#,##0 "₫"` | Phải | $\text{Lương ngạch bậc} \times \text{Hệ số KPI} \times (\% \text{ KPI})$ |
| **I** | `tien_thuong` | Tiền thưởng | Currency| `#,##0 "₫"` | Phải | Thưởng hiệu quả định mức + Thưởng thi đua |
| **J** | `khoan_an_trua`| Ăn trưa | Currency| `#,##0 "₫"` | Phải | Tiền ăn giữa ca tính theo ngày công thực tế |
| **K** | `khoan_xang_xe`| Xăng xe | Currency| `#,##0 "₫"` | Phải | Hỗ trợ xăng xe kiểm tra địa bàn/thị trường |
| **L** | `khoan_dien_thoai`| Điện thoại | Currency| `#,##0 "₫"` | Phải | Khoán cước viễn thông liên lạc khách hàng |
| **M** | `khoan_trang_phuc`| Trang phục | Currency| `#,##0 "₫"` | Phải | Khoán trang phục / đồng phục ngành |
| **N** | `cong_tac_phi` | Công tác phí | Currency| `#,##0 "₫"` | Phải | Chi phí đi đường, lưu trú, tập huấn phát sinh |
| **O** | `khoan_khac` | Khoán khác | Currency| `#,##0 "₫"` | Phải | Hỗ trợ học tập, trực lễ tết, chi phí khác |
| **P** | `tong_khoan` | Tổng phụ cấp khoán| Currency| `#,##0 "₫"` | Phải | $=\text{Ăn trưa} + \text{Xăng} + \text{ĐT} + \text{Trang phục} + \text{CTP} + \text{Khác}$ |
| **Q** | `phu_cap_tn` | Phụ cấp trách nhiệm| Currency| `#,##0 "₫"` | Phải | Phụ cấp chức danh quản lý (Tính đóng BHXH) |
| **R** | `thu_lao_qt` | Thù lao QTK | Currency| `#,##0 "₫"` | Phải | Thù lao Ủy viên HĐQT, Ban kiểm soát |
| **S** | `tong_gross` | Tổng Gross | Currency| `#,##0 "₫"` | Phải | $=\text{Lương ngạch bậc} + \text{KPI} + \text{Thưởng} + \text{Khoán} + \text{TN} + \text{Thù lao}$ |
| **T** | `luong_dong_bhxh`| Lương đóng BHXH | Currency| `#,##0 "₫"` | Phải | $=\text{Lương ngạch bậc} + \text{Phụ cấp trách nhiệm}$ (Miễn khoán) |
| **U** | `bhxh_nld` | BHXH NLĐ (8%) | Currency| `#,##0 "₫"` | Phải | Khấu trừ 8% trên lương đóng BHXH |
| **V** | `bhyt_nld` | BHYT NLĐ (1.5%) | Currency| `#,##0 "₫"` | Phải | Khấu trừ 1.5% trên lương đóng BHXH |
| **W** | `bhtn_nld` | BHTN NLĐ (1%) | Currency| `#,##0 "₫"` | Phải | Khấu trừ 1.0% trên lương đóng BHXH |
| **X** | `tong_bh_nld` | Tổng BH NLĐ (10.5%) | Currency| `#,##0 "₫"` | Phải | Tổng bảo hiểm trừ vào lương người lao động |
| **Y** | `thu_nhap_chiu_thue`| Thu nhập chịu thuế| Currency| `#,##0 "₫"` | Phải | Gross trừ các khoản khoán miễn thuế theo quy chế |
| **Z** | `giam_tru_gia_canh`| Giảm trừ gia cảnh | Currency| `#,##0 "₫"` | Phải | 15.5 triệu (Bản thân) + 6.2 triệu $\times$ Số NPT |
| **AA**| `thu_nhap_tinh_thue`| Thu nhập tính thuế | Currency| `#,##0 "₫"` | Phải | $=\text{Chịu thuế} - \text{Giảm trừ gia cảnh} - \text{BH NLĐ}$ |
| **AB**| `thue_tncn` | Thuế TNCN (PIT) | Currency| `#,##0 "₫"` | Phải | Thuế TNCN khấu trừ theo biểu lũy tiến |
| **AC**| `thuc_linh` | THỰC LĨNH NET | Currency| `#,##0 "₫"` | Phải | **$=\text{Tổng Gross} - \text{Tổng BH NLĐ} - \text{Thuế TNCN}$** |
| **AD**| `bhxh_quy` | BHXH Quỹ (17.5%) | Currency| `#,##0 "₫"` | Phải | Chi phí Quỹ nộp cơ quan bảo hiểm |
| **AE**| `bhyt_quy` | BHYT Quỹ (3%) | Currency| `#,##0 "₫"` | Phải | Chi phí Quỹ nộp cơ quan bảo hiểm |
| **AF**| `bhtn_quy` | BHTN Quỹ (1%) | Currency| `#,##0 "₫"` | Phải | Chi phí Quỹ nộp cơ quan bảo hiểm |
| **AG**| `tong_bh_quy` | Tổng BH Quỹ (21.5%)| Currency| `#,##0 "₫"` | Phải | Tổng chi phí bảo hiểm đơn vị gánh chịu |
| **AH**| `tong_chi_phi_quy`| Tổng Chi Phí Quỹ | Currency| `#,##0 "₫"` | Phải | $=\text{Tổng Gross} + \text{Bảo hiểm Quỹ đóng (21.5\%)}$ |
| **AI**| `trang_thai` | Trạng thái | Text | `@` | Giữa | `ĐÃ PHÊ DUYỆT`, `ĐÃ CHI TIỀN` |
| **AJ**| `ngay_khoa_so` | Ngày khóa sổ | Date | `dd/MM/yyyy` | Giữa | Ngày chốt sổ bảng lương |
| **AK**| `nguoi_duyet` | Người duyệt | Text | `@` | Trái | Chủ tịch HĐQT / Giám đốc ký |

---

### BẢNG 8: `TAIKHOAN` (Quản Lý Tài Khoản & Phân Quyền)
- **Mục đích**: Phân quyền đăng nhập cho 13 cán bộ và Ban quản trị.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Mã tài khoản, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ràng buộc & Bảo mật |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_tai_khoan` | Mã tài khoản | Text | `@` | Giữa | **PK** | `ACC_NV01` $\rightarrow$ `ACC_NV13` |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | **FK** | Liên kết `DM_NS.ma_nv` |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Tên hiển thị người dùng |
| **D** | `ten_dang_nhap`| Tên đăng nhập | Text | `@` | Giữa | **Unique** | Số điện thoại hoặc Mã cán bộ |
| **E** | `mat_khau_hash` | Mật khẩu Hash (SHA-256)| Text | `@` | Trái | | Chuỗi băm bảo mật SHA-256 một chiều |
| **F** | `doi_pass_lan_dau`| Đổi pass lần đầu | Boolean | `@` | Giữa | | `TRUE` (Bắt buộc đổi pass) / `FALSE` |
| **G** | `vai_tro` | Vai trò (Role) | Text | `@` | Giữa | | `ADMIN`, `KE_TOAN`, `KIEM_SOAT`, `NHAN_VIEN` |
| **H** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HOẠT ĐỘNG` hoặc `TẠM KHÓA` |
| **I** | `lan_login_cuoi`| Lần login cuối | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | | Giám sát an toàn thông tin |
| **J** | `so_lan_sai` | Số lần sai | Number | `0` | Phải | | Tự động tạm khóa nếu gõ sai quá 5 lần |

---

### BẢNG 9: `AUDIT_LOG` (Nhật Ký Truy Cập & Thao Tác)
- **Mục đích**: Bảng bất biến (Immutable) ghi nhận mọi hành vi đăng nhập, xem lương và chỉnh sửa số liệu.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã log, Thời gian).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `id_log` | Mã log | Text | `@` | Giữa | `LOG_001`, `LOG_002`... |
| **B** | `thoi_gian` | Thời gian | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Giờ Việt Nam GMT+7 |
| **C** | `ma_nv` | Mã NV | Text | `@` | Giữa | Người thực hiện hành động |
| **D** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ |
| **E** | `vai_tro` | Vai trò | Text | `@` | Giữa | Quyền hạn lúc thao tác |
| **F** | `hanh_dong` | Hành động | Text | `@` | Giữa | `DANG_NHAP`, `XEM_PHIEU_LUONG`, `SUA_CONG`... |
| **G** | `phan_he` | Phân hệ | Text | `@` | Giữa | `HỆ THỐNG`, `CHẤM CÔNG`, `BẢNG LƯƠNG`... |
| **H** | `noi_dung_chi_tiet`| Chi tiết thao tác | Text | `@` | Trái | Mô tả chi tiết hành động và sự thay đổi |
| **I** | `thiet_bi` | Thiết bị / IP | Text | `@` | Trái | Chrome/Windows, Safari/iPhone, IP |
| **J** | `ket_qua` | Kết quả | Text | `@` | Giữa | `THÀNH CÔNG` hoặc `THẤT BẠI` |

---

### BẢNG 10: `PHAN_HOI` (Hộp Thư Phản Hồi Thắc Mắc Lương)
- **Mục đích**: Kênh trao đổi 2 chiều minh bạch giữa Người lao động và Bộ phận Kế toán.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 4 (Mã phản hồi, Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `id_phan_hoi` | Mã phản hồi | Text | `@` | Giữa | `FB_202701_001` |
| **B** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | Tháng thắc mắc (`2027-01`) |
| **C** | `ma_nv` | Mã NV | Text | `@` | Giữa | Người gửi câu hỏi |
| **D** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ gửi |
| **E** | `chu_de` | Chủ đề thắc mắc | Text | `@` | Trái | Ngày công, Điểm KPI, Tiền ăn, Thuế/BHXH |
| **F** | `noi_dung_nv` | Nội dung thắc mắc | Text | `@` | Trái | Câu hỏi / Trình bày của người lao động |
| **G** | `thoi_gian_gui` | Thời gian gửi | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Thời điểm gửi phản hồi |
| **H** | `trang_thai` | Trạng thái xử lý | Text | `@` | Giữa | `1. MỚI GỬI`, `2. ĐANG XỬ LÝ`, `3. ĐÃ GIẢI ĐÁP`, `4. ĐÃ ĐIỀU CHỈNH` |
| **I** | `nguoi_xu_ly` | Cán bộ xử lý | Text | `@` | Trái | Kế toán tiền lương phụ trách |
| **J** | `noi_dung_tra_loi`| Nội dung trả lời của Kế toán| Text | `@` | Trái | Câu trả lời, giải trình, kết quả điều chỉnh |
| **K** | `thoi_gian_tra_loi`| Thời gian trả lời | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Thời điểm phản hồi cho nhân viên |
| **L** | `muc_do_hai_long`| Đánh giá hài lòng | Text | `@` | Giữa | Đánh giá của nhân viên sau khi được giải đáp |

---

### BẢNG 11: `THAM_SO` (Tham Số Chung & Tỷ Lệ BHXH / Thuế)
- **Mục đích**: Cấu hình toàn bộ tỷ lệ trích nộp, mức lương cơ bản và định mức công vụ. Khi Nhà nước điều chỉnh luật, chỉ cần đổi giá trị tại bảng này.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã tham số, Tên tham số).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Căn cứ văn bản & Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `ma_param` | Mã tham số | Text | `@` | Giữa | `BASIC_SALARY`, `BHXH_DON_VI`... |
| **B** | `ten_param` | Tên tham số | Text | `@` | Trái | Tên tiếng Việt rõ ràng |
| **C** | `gia_tri` | Giá trị cấu hình | Number | Tùy biến | Phải | Tiền tệ `#,##0 "₫"` hoặc Tỷ lệ `0.0%` |
| **D** | `don_vi` | Đơn vị tính | Text | `@` | Giữa | `₫/tháng`, `%`, `₫/người/tháng` |
| **E** | `tu_ngay` | Ngày áp dụng | Date | `dd/MM/yyyy` | Giữa | Thời điểm bắt đầu có hiệu lực |
| **F** | `den_ngay` | Ngày hết hạn | Date | `dd/MM/yyyy` | Giữa | `31/12/2099` nếu đang áp dụng |
| **G** | `can_cu` | Căn cứ văn bản pháp lý | Text | `@` | Trái | Luật BHXH, Luật Thuế TNCN, Nghị quyết HĐQT |
| **H** | `ghi_chu` | Ghi chú | Text | `@` | Trái | Hướng dẫn tính toán |

---

### BẢNG 12: `DM_PHU_CAP` (Danh Mục Phụ Cấp, Khoán & Quy Tắc Tính Thuế / BHXH)
- **Mục đích**: Cấu hình quy tắc nghiệp vụ cho từng loại phụ cấp và khoản khoán công vụ: Xác định khoản nào tính đóng BHXH, khoản nào chịu thuế TNCN, hạn mức miễn thuế tối đa và ánh xạ sang cột tương ứng trên bảng lương `BL_LICHSU`.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã khoản, Tên khoản).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa nghiệp vụ | Căn cứ pháp lý |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **A** | `ma_khoan` | Mã khoản | Text | `@` | Giữa | **PK** | `AN_TRUA`, `XANG_XE`, `DIEN_THOAI`, `TRANG_PHUC`... | Duy nhất |
| **B** | `ten_khoan` | Tên khoản phụ cấp / khoán | Text | `@` | Trái | | Tiền ăn giữa ca, Xăng xe, Điện thoại, Trang phục... | Tên hiển thị |
| **C** | `phan_loai` | Phân loại chi | Text | `@` | Giữa | | `KHOAN_CONG_VU`, `PHU_CAP_LUONG`, `THU_LAO_QUAN_TRI`, `THUONG` | Phân nhóm tài chính |
| **D** | `cot_bang_luong`| Cột bảng lương | Text | `@` | Trái | | Ánh xạ tên cột trên sheet `BL_LICHSU` | Tự động tổng hợp |
| **E** | `tinh_bhxh` | Tính BHXH? | Text | `@` | Giữa | | `CÓ` (Cộng vào lương đóng BHXH) hoặc `KHÔNG` (Miễn đóng BHXH) | TT 59/2015 & TT 06/2021 |
| **F** | `tinh_thue_tncn`| Tính Thuế TNCN? | Text | `@` | Giữa | | `CÓ` (Chịu 100%), `KHÔNG` (Miễn 100%), `THEO_DINH_MUC` (Miễn có trần) | TT 111/2013/TT-BTC |
| **G** | `muc_mien_thue`| Mức miễn thuế tối đa ₫ | Currency| `#,##0 "₫"` | Phải | | Mức trần miễn thuế: Ăn trưa 730k, Trang phục ~416k/tháng | Khoản 2 Điều 2 TT 111 |
| **H** | `phuong_thuc` | Phương thức tính | Text | `@` | Giữa | | `THEO_NGAY_CONG`, `CO_DINH_THANG`, `THUC_TE_PHAT_SINH` | Công thức tính toán |
| **I** | `can_cu` | Căn cứ pháp lý & Quy chế | Text | `@` | Trái | | Điều luật, Thông tư, Nghị quyết HĐQT | Kiểm toán Nhà nước/Thuế |
| **J** | `ghi_chu` | Ghi chú nghiệp vụ | Text | `@` | Trái | | Hướng dẫn hạch toán và đối soát | Lưu ý kế toán |

---

### BẢNG 13: `LS_KHOAN` (Lịch Sử Thay Đổi Định Mức Phụ Cấp & Khoán)
- **Mục đích**: Bảng lưu vết toàn bộ lịch sử các quyết định thay đổi mức khoán theo thời gian (SCD Type 2). Cho phép tra cứu chính xác: *Khoản đó trước đây khoán bao nhiêu? Thay đổi thành bao nhiêu? Bắt đầu áp dụng từ ngày nào? Theo quyết định số nào của HĐQT?*
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Mã bản ghi, Mã khoản, Tên khoản).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa nghiệp vụ | Căn cứ & Giá trị |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **A** | `id_lich_su_khoan`| Mã bản ghi | Text | `@` | Giữa | **PK** | `LSK_AN_2027`, `LSK_XANG_TD_2027`... | Khóa duy nhất |
| **B** | `ma_khoan` | Mã khoản | Text | `@` | Giữa | **FK** | Liên kết `DM_PHU_CAP.ma_khoan` | `AN_TRUA`, `XANG_XE`... |
| **C** | `ten_khoan` | Tên khoản khoán / phụ cấp | Text | `@` | Trái | | Tên khoản chi | Tên tiếng Việt rõ ràng |
| **D** | `doi_tuong` | Đối tượng áp dụng | Text | `@` | Giữa | | `Toàn Quỹ`, `Khối Tín dụng (P08)`, `Lãnh đạo`... | Phạm vi thụ hưởng |
| **E** | `muc_khoan_cu` | Mức khoán cũ ₫ | Currency| `#,##0 "₫"` | Phải | | Mức khoán trước khi điều chỉnh | Đối chiếu lịch sử |
| **F** | `muc_khoan_moi` | Mức khoán mới ₫ | Currency| `#,##0 "₫"` | Phải | | Mức khoán mới được phê duyệt | Căn cứ tính lương mới |
| **G** | `don_vi_tinh` | Đơn vị tính | Text | `@` | Giữa | | `₫/tháng`, `₫/ngày công`, `₫/ngày` | Chuẩn định mức |
| **H** | `tu_ngay` | Từ ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu áp dụng mức khoán mới | Thời điểm có hiệu lực |
| **I** | `den_ngay` | Đến ngày | Date | `dd/MM/yyyy` | Giữa | | `31/12/2099` (nếu đang áp dụng) hoặc ngày hết hạn | Thời điểm kết thúc |
| **J** | `so_quyet_dinh` | Số Quyết định / Nghị quyết | Text | `@` | Giữa | | Số hiệu văn bản HĐQT ban hành | Văn bản pháp lý |
| **K** | `ngay_quyet_dinh`| Ngày quyết định | Date | `dd/MM/yyyy` | Giữa | | Ngày ký ban hành văn bản | Thời điểm ký |
| **L** | `nguoi_ky` | Người ký | Text | `@` | Trái | | Chủ tịch HĐQT / Giám đốc | Thẩm quyền ban hành |
| **M** | `ly_do_thay_doi`| Lý do thay đổi | Text | `@` | Trái | | Trượt giá sinh hoạt, mở rộng địa bàn liên xã... | Căn cứ thuyết minh |
| **N** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HIỆN TẠI` (Đang áp dụng) / `HẾT HIỆU LỰC` | Trạng thái phiên bản |

---

## 🛠️ 4. HƯỚNG DẪN KÍCH HOẠT TỰ ĐỘNG TẠO 13 SHEETS CSDL

ID và liên kết Google Sheet chính thức của Quỹ đã được nạp trực tiếp vào mã nguồn:
- **ID Google Sheet**: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`
- **Link Google Sheet**: [Mở Google Sheet CSDL](https://docs.google.com/spreadsheets/d/1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8/edit)
- **Link dự án Apps Script**: [Mở Google Apps Script](https://script.google.com/d/14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr/edit)

**Các bước thực hiện:**
1. Mở dự án Google Apps Script theo link trên.
2. Trên thanh công cụ trên cùng, tại ô chọn hàm thực thi (bên cạnh nút "Gỡ lỗi"), chọn hàm **`khoiTaoHeThongCSDL`**.
3. Nhấn nút **Chạy (Run)**.
4. Nếu đây là lần đầu tiên, Google sẽ hiển thị popup *"Cần cấp quyền"* $\rightarrow$ Nhấn *Xem quyền* $\rightarrow$ Chọn tài khoản $\rightarrow$ Chọn *Nâng cao (Advanced)* $\rightarrow$ Nhấn *Đi tới ... (Không an toàn)* $\rightarrow$ Nhấn *Cho phép (Allow)*.
5. Chỉ sau **10 - 15 giây**, toàn bộ 13 Sheet với đầy đủ màu sắc Navy, cố định hàng cột, định dạng số tiền `₫`, tỷ lệ `%` và danh sách 12 cán bộ thực tế sẽ được tự động thiết lập hoàn chỉnh 100% trên bảng tính!

---

## 📌 5. QUY TẮC CẬP NHẬT KHI CÓ THAY ĐỔI CSDL (MAINTENANCE PROTOCOL)

1. **Nguyên tắc bảo toàn dữ liệu**: Tuyệt đối không xóa cột hoặc đổi tên mã trường (`Mã trường`) của các cột đã có trong quá khứ để tránh gây lỗi cho các dữ liệu bảng lương cũ.
2. **Khi thêm cột mới**:
   - Thêm cột vào cuối bảng tính (bên phải).
   - Cập nhật định dạng số và căn lề tương ứng.
   - Bắt buộc cập nhật bổ sung vào tài liệu `CSDL_GOOGLE_SHEETS_SCHEMA.md` này.
3. **Khi thay đổi hệ số lương hoặc chức danh của cán bộ**:
   - **Không sửa đè** vào dòng cũ trong `LS_CONGTAC`.
   - Cập nhật ngày kết thúc hiệu lực của dòng cũ (`den_ngay = ngày_hôm_qua`).
   - Thêm 1 dòng mới với ngày bắt đầu hiệu lực mới (`tu_ngay = ngày_hôm_nay`) và hệ số lương mới.

---

## 👥 6. DANH SÁCH BIÊN CHẾ 12 CÁN BỘ NHÂN VIÊN THỰC TẾ (HIỆN TẠI)

Dữ liệu được trích xuất trực tiếp từ danh sách nhân sự chính thức của Quỹ tín dụng nhân dân Yên Thọ và nạp sẵn vào bảng `DM_NS`, `LS_CONGTAC`, `TAIKHOAN`:

| TT | Mã NV | Họ và tên | Chức danh chính quyền | Khối PB | Điện thoại (User Login) | Email | CCCD (12 số) | Giới tính | Ngày vào làm | Ngày chính thức |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | `NV01` | **Nguyễn Thị Sinh** | Thẩm định tài sản | Tín dụng | `0388232844` | `Sinhtdyt@gmail.com` | `038162004401` | Nữ | 09/03/2005 | 09/03/2006 |
| 2 | `NV02` | **Nguyễn Thị Mến** | Kế toán trưởng | Kế toán | `0349547779` | `nguyenmen.yt.83@gmail.com` | `038183010925` | Nữ | 09/03/2007 | 08/03/2008 |
| 3 | `NV03` | **Nguyễn Văn Sơn** | UV HĐQT - Giám đốc | Điều hành | `0941562789` | `nguyenvansontdyt@gmail.com` | `038080021750` | Nam | 09/10/2012 | 09/10/2013 |
| 4 | `NV04` | **Bùi Thị Thảo** | Trưởng ban kiểm soát | Kiểm soát | `0839062825` | `thao.bui0282@gmail.com` | `038182047645` | Nữ | 19/11/2012 | 19/11/2013 |
| 5 | `NV05` | **Nguyễn Hữu Nhân** | CB tín dụng | Tín dụng | `0949116817` | `qtdyentho.huunhan@gmail.com` | `038085009285` | Nam | 30/01/2013 | 30/01/2014 |
| 6 | `NV06` | **Trịnh Thị Hiền** | KST - Kiểm toán nội bộ | Kiểm soát | `0948784333` | `qtdyentho.hienha@gmail.com` | `038183049074` | Nữ | 21/05/2014 | 21/05/2015 |
| 7 | `NV07` | **Trịnh Đức Anh** | Chủ tịch HĐQT | HĐQT | `0965122111` | `ducanht@gmail.com` | `038086010115` | Nam | 03/06/2016 | 03/06/2017 |
| 8 | `NV08` | **Vũ Thị Hiền** | UV HĐQT | HĐQT | `0983502181` | `qtdyentho.vuhien@gmail.com` | `038186037786` | Nữ | 04/06/2018 | 04/06/2019 |
| 9 | `NV09` | **Trần Như Huyền** | CB tín dụng | Tín dụng | `0985709609` | `Huyennhutran@gmail.com` | `038189039532` | Nữ | 11/12/2020 | 11/12/2021 |
| 10 | `NV10` | **Hoàng Thị Lan** | Kế toán viên | Kế toán | `0965178666` | `hoanglan1289@gmail.com` | `038189040044` | Nữ | 08/10/2021 | 08/10/2022 |
| 11 | `NV11` | **Phạm Thị Thảo** | Thủ quỹ | Kế toán | `0965567596` | `qtdyentho.phamthao@gmail.com` | `038190051894` | Nữ | 06/09/2023 | 06/09/2024 |
| 12 | `NV12` | **Lưu Thị Định** | CB tín dụng | Tín dụng | `0961007855` | `qtdyentho.luudinh@gmail.com` | `038189028302` | Nữ | 06/09/2024 | 06/09/2025 |

> 💡 **Ghi chú về các trường điền giả định để bổ sung sau**:
> - **Ngày sinh**: Đã giải mã chính xác năm sinh từ cấu trúc số CCCD (Ví dụ: `038086...` là Nam sinh 1986; `038183...` là Nữ sinh 1983).
> - **Địa chỉ thường trú**: Điền mặc định `Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá`.
> - **Số tài khoản ngân hàng**: Điền giả định tại Agribank Quý Lộc (`10287463801` $\rightarrow$ `10287463812`), cán bộ có thể cập nhật số thực tế bất kỳ lúc nào.
> - **Số NPT (Người phụ thuộc)**: Điền giả định 0 đến 2 người, có thể điều chỉnh trực tiếp trên phần mềm hoặc Google Sheets.
> - **Mật khẩu khởi tạo**: Băm bảo mật SHA-256 của `YenTho@2027` để cán bộ đăng nhập lần đầu bằng SĐT và đổi mật khẩu riêng.

