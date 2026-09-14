# ĐẶC TẢ CHI TIẾT CẤU TRÚC CƠ SỞ DỮ LIỆU GOOGLE SHEETS
## HỆ THỐNG QUẢN TRỊ LƯƠNG, NHÂN SỰ, CHẤM CÔNG & KPI – QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ

> **Tài liệu chuẩn hóa CSDL**: Phiên bản 3.0 (Tháng 09/2026 - Chuẩn hóa áp dụng kỳ lương 2027 Pro V3)  
> **Đơn vị quản lý**: Quỹ tín dụng nhân dân Yên Thọ (`Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá`)  
> **Nền tảng lưu trữ**: Google Sheets (Google Drive Quỹ tín dụng nhân dân Yên Thọ)  
> **ID Google Sheet**: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`  
> **Quy tắc bảo trì**: Bất kỳ sự thay đổi, bổ sung cột hoặc bảng mới nào đều bắt buộc phải cập nhật vào tài liệu này và tự động đồng bộ qua `SchemaManager.ensureDatabaseSchema()`.

---

## 🏛️ 1. BẢNG DANH MỤC 17 SHEETS CHUẨN HÓA (TÊN VIẾT TẮT)

Để đảm bảo thanh tab trên Google Sheets gọn gàng, trực quan và dễ đọc, toàn bộ 17 bảng được đặt tên bằng các từ viết tắt ngắn gọn chuẩn nghiệp vụ:

| STT | Tên Sheet viết tắt | Tên đầy đủ | Số cột | Ý nghĩa nghiệp vụ | Cố định (Freeze) |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 1 | **`DM_NS`** | Danh mục Nhân sự 360° | 30 | Hồ sơ 12 CBNV, CCCD, MST, NPT, số TK, ngày đảm nhiệm CV, thâm niên quy đổi, bậc, năm vượt khung, mức đóng BHXH, link Drive (HĐLĐ, Phụ lục, QĐ) | Hàng 1, Cột 2 (A-B) |
| 2 | **`LS_CONGTAC`** | Lịch sử Công tác & Quyết định | 18 | Lưu vết lịch sử chức danh, bậc, hệ số lương theo từng giai đoạn hiệu lực, link quyết định Drive | Hàng 1, Cột 3 (A-C) |
| 3 | **`DM_CHUCDANH`**| Khung Chức danh & 5 Bậc Ngạch | 27 | Khung 10 chức danh vị trí, hệ số 5 bậc ngạch (Bậc 1-5), nhóm khoán, % vượt khung, chu kỳ nâng bậc 3 năm | Hàng 1, Cột 2 (A-B) |
| 4 | **`DM_KPI`** | Từ điển Chỉ số KPI nghiệp vụ | 6 | Danh mục các tiêu chí đo lường hiệu quả công việc chuyên môn QTDND | Hàng 1, Cột 2 (A-B) |
| 5 | **`CHAM_CONG`** | Chấm công & Ngày phép tháng | 11 | Quản lý ngày công đi làm, phép năm, nghỉ lễ, nghỉ ốm, nghỉ không lương theo từng tháng | Hàng 1, Cột 3 (A-C) |
| 6 | **`DG_KPI`** | Đánh giá chi tiết KPI tháng | 10 | Chi tiết kết quả thực hiện, tỷ lệ hoàn thành và điểm số từng chỉ số KPI theo trọng số | Hàng 1, Cột 4 (A-D) |
| 7 | **`BL_LICHSU`** | Lịch sử Bảng lương khóa sổ | 35 | Bảng lương đã chốt vĩnh viễn, lưu vết chi tiết 22 chỉ tiêu tài chính, tiền thừa BHXH, chi phí Quỹ | Hàng 1, Cột 3 (A-C) |
| 8 | **`TAIKHOAN`** | Tài khoản & Phân quyền | 9 | Quản lý đăng nhập, mật khẩu mã hóa SHA-256 và vai trò RBAC 4 cấp | Hàng 1, Cột 3 (A-C) |
| 9 | **`AUDIT_LOG`** | Nhật ký Truy vết & Thao tác | 7 | Lưu vết an toàn thông tin: ai đăng nhập, xem gì, sửa gì, lúc nào | Hàng 1, Cột 2 (A-B) |
| 10 | **`PHAN_HOI`** | Hộp thư Phản hồi thắc mắc | 9 | Kênh giải đáp thắc mắc lương 2 chiều giữa Người lao động và Kế toán | Hàng 1, Cột 4 (A-D) |
| 11 | **`THAM_SO`** | Tham số Hệ thống & Tỷ lệ Thuế/BHXH | 5 | Mức lương cơ sở, tỷ lệ bảo hiểm, định mức chi tiêu chung toàn đơn vị | Hàng 1, Cột 2 (A-B) |
| 12 | **`DM_PHU_CAP`** | Danh mục Phụ cấp & Khoán công vụ | 14 | Cấu hình cờ tính BHXH, tính Thuế TNCN, hạn mức miễn trừ, nhóm áp dụng, mức cố định | Hàng 1, Cột 2 (A-B) |
| 13 | **`LS_KHOAN`** | Lịch sử Định mức Khoán (SCD-2) | 14 | Lưu vết các quyết định thay đổi mức khoán: Mức cũ, Mức mới, Từ ngày, Số QĐ | Hàng 1, Cột 3 (A-C) |
| 14 | **`DM_BAC_LUONG`**| Bảng Lương Ngạch Bậc (5 Bậc) | 8 | Chi tiết ma trận 5 bậc ngạch của 10 chức danh theo lương cơ sở | Hàng 1, Cột 2 (A-B) |
| 15 | **`DM_THAM_SO_LUONG`**| Tham số Pháp lý & Lương Nghiệp vụ | 10 | Cấu hình Lương cơ sở, trần BHXH, giảm trừ thuế TNCN, thâm niên, vượt khung | Hàng 1, Cột 2 (A-B) |
| 16 | **`DM_CONG_THUC`**| Danh mục Công thức 4 Tầng Lương | 10 | 13 công thức tính toán từ lương vị trí, KPI, khoán đến Net và chi phí Quỹ | Hàng 1, Cột 2 (A-B) |
| 17 | **`KQ_LUONG_THANG`**| Kết quả Tính Lương Tháng (DRAFT/LOCK)| 40 | Bảng kết quả tính toán chi tiết 22 mục cho 12 CBNV từng kỳ lương | Hàng 1, Cột 3 (A-C) |

---

## 🔗 2. SƠ ĐỒ MỐI QUAN HỆ KHÓA DỮ LIỆU (ERD V3.0)

```
[DM_CHUCDANH] (ma_vi_tri) ◄──────────────┐
      ▲                                  │ (FK: ma_vi_tri)
      │ (FK: ma_vi_tri)                  ▼
[LS_CONGTAC] (id_lich_su, ma_nv)    [DM_BAC_LUONG] (ma_vi_tri, bac)
      ▲                                  │
      │ (FK: ma_nv)                      │
[DM_NS] (ma_nv) ◄──────────────┬─────────┴───────────────┐
      ▲                        │ (FK: ma_nv)             │ (FK: ma_nv)
      │ (FK: ma_nv)            ▼                         ▼
      │                  [CHAM_CONG]               [TAIKHOAN]
      │             (ky_luong, ma_nv)            (id_tai_khoan, ma_nv)
      │                        │                         │
      │                        ▼ (FK: ky_luong, ma_nv)    ▼
      │                  [KQ_LUONG_THANG]           [AUDIT_LOG]
      │                 (ky_luong, ma_nv)         (id_log, ma_nv)
      │                        │                         │
      │           (Khóa sổ)    ▼                         ▼
      │                  [BL_LICHSU]                [PHAN_HOI]
      │             (ky_luong, ma_nv)            (id_phan_hoi, ma_nv)
      │                   ▲    ▲
      │                   │    │
      │        (Ánh xạ)   │    └──────────────────────────┐
      │      [DM_PHU_CAP] │                               │
      │      (ma_khoan) ──┤                  [DM_THAM_SO_LUONG]
      │           ▲       │                     (ma_tham_so)
      │           │       │                               │
      │      [LS_KHOAN] ──┘                               ▼
      │  (id_lsk, tu_ngay)                         [DM_CONG_THUC]
      └───────────────────────────────────────────────────┘
```

---

## 📋 3. ĐẶC TẢ CHI TIẾT TỪNG BẢNG DỮ LIỆU (17 SHEETS)

---

### BẢNG 1: `DM_NS` (Danh Mục Nhân Sự 360° - 30 Cột)
- **Mục đích**: Hồ sơ lý lịch trích ngang, thông tin liên lạc, tài khoản ngân hàng, thông tin gia cảnh, chức vụ, ngạch bậc và tài liệu số hóa Google Drive.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu dữ liệu | Định dạng | Căn lề | Khóa | Ràng buộc / Quy tắc nghiệp vụ |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_nv` | Mã NV | Text | `@` | Giữa | **PK** | Định dạng `NVxx` (Duy nhất, không trùng) |
| **B** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Viết hoa chữ cái đầu, có dấu tiếng Việt |
| **C** | `chuc_danh` | Chức danh | Text | `@` | Trái | | Chức danh chuyên môn hiện tại |
| **D** | `phong_ban` | Khối phòng ban | Text | `@` | Trái | | `HĐQT`, `BKS`, `Điều hành`, `Tín dụng`, `Kế toán` |
| **E** | `so_dien_thoai` | Điện thoại | Text | `@` | Giữa | | 10 chữ số (Bắt đầu bằng 0, là User Login) |
| **F** | `email` | Email | Text | `@` | Trái | | Email liên hệ công vụ/cá nhân |
| **G** | `ngay_sinh` | Ngày sinh | Date | `dd/MM/yyyy` | Giữa | | Ngày sinh dương lịch |
| **H** | `gioi_tinh` | Giới tính | Text | `@` | Giữa | | `Nam` hoặc `Nữ` |
| **I** | `so_cccd` | Số CCCD | Text | `@` | Giữa | | Đúng 12 chữ số |
| **J** | `ngay_cap_cccd` | Ngày cấp CCCD | Date | `dd/MM/yyyy` | Giữa | | Ngày cấp theo CCCD gắn chip |
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
| **V** | `ngay_dam_nhiem`| Ngày đảm nhiệm chức vụ| Date | `dd/MM/yyyy` | Giữa | | Căn cứ tính thâm niên chức vụ thực tế |
| **W** | `bac_luong` | Bậc lương | Number | `0` | Giữa | | Bậc hiện hưởng trong ngạch (1 đến 5) |
| **X** | `nam_vuot_khung`| Năm vượt khung | Number | `0` | Giữa | | Số năm vượt khung đã tích lũy sau Bậc 5 |
| **Y** | `muc_dong_bhxh` | Mức đóng BHXH | Currency | `#,##0 "₫"` | Phải | | Mức đăng ký đóng BHXH cá nhân hóa (để trống = auto) |
| **Z** | `tham_nien_qd` | Thâm niên quy đổi | Number | `0` | Giữa | | Số năm chức vụ được quy đổi tương đương |
| **AA**| `so_qd` | Số QĐ bổ nhiệm | Text | `@` | Trái | | Số hiệu QĐ bổ nhiệm/nâng bậc mới nhất |
| **AB**| `ngay_qd` | Ngày QĐ bổ nhiệm | Date | `dd/MM/yyyy` | Giữa | | Ngày ký quyết định |
| **AC**| `link_hdld` | Link HĐLĐ Drive | Text/URL | `@` | Trái | | Đường dẫn file số hóa Hợp đồng lao động |
| **AD**| `link_phu_luc` | Link Phụ lục HĐ Drive | Text/URL | `@` | Trái | | Đường dẫn file số hóa Phụ lục HĐLĐ |
| **AE**| `link_qd` | Link QĐ bổ nhiệm Drive| Text/URL| `@` | Trái | | Đường dẫn file số hóa Quyết định bổ nhiệm |

---

### BẢNG 2: `LS_CONGTAC` (Lịch Sử Công Tác & Quyết Định - 18 Cột)
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
| **J** | `bac` | Bậc | Number | `0` | Giữa | | Bậc lương ngạch chức danh (1-5) |
| **K** | `he_so_luong` | Hệ số lương | Decimal | `0.00` | Phải | | Hệ số lương cơ bản |
| **L** | `ty_le_kpi` | Tỷ lệ KPI trần | Percent | `0.0%` | Phải | | Tỷ lệ KPI tối đa theo vị trí |
| **M** | `ty_le_thuong` | Tỷ lệ Thưởng trần | Percent | `0.0%` | Phải | | Tỷ lệ thưởng định mức |
| **N** | `phu_cap_tn` | Phụ cấp trách nhiệm | Currency | `#,##0 "₫"` | Phải | | Phụ cấp chức danh/quản trị hàng tháng |
| **O** | `thu_lao_qt` | Thù lao quản trị | Currency | `#,##0 "₫"` | Phải | | Thù lao HĐQT/BKS (nếu có) |
| **P** | `ly_do` | Lý do điều chỉnh | Text | `@` | Trái | | Bổ nhiệm mới, nâng bậc, chuyển khối |
| **Q** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HIỆN TẠI` (Active) hoặc `LỊCH SỬ` (Expired) |
| **R** | `link_qd` | Link quyết định Drive| Text/URL| `@` | Trái | | File số hóa quyết định đính kèm |

---

### BẢNG 3: `DM_CHUCDANH` (Khung Chức Danh & 5 Bậc Ngạch - 27 Cột)
- **Mục đích**: Bảng chuẩn 10 vị trí chức danh của Quỹ, định nghĩa hệ số 5 bậc ngạch, chu kỳ nâng bậc và cơ chế vượt khung.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã vị trí, Tên chức danh).

| Cột | Mã trường | Tên cột hiển thị | Kiểu dữ liệu | Định dạng | Căn lề | Khóa | Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_vi_tri` | Mã vị trí | Text | `@` | Giữa | **PK** | `P01` $\rightarrow$ `P10` |
| **B** | `ten_vi_tri` | Tên vị trí chức danh | Text | `@` | Trái | | Chủ tịch, Giám đốc, Kế toán, Tín dụng... |
| **C** | `khoi` | Khối | Text | `@` | Trái | | Lãnh đạo, Điều hành, Kiểm soát, Chuyên môn |
| **D** | `bac` | Bậc | Number | `0` | Giữa | | Bậc khởi điểm |
| **E** | `so_luong` | Số lượng | Number | `0` | Giữa | | Số lượng biên chế theo vị trí |
| **F** | `pa1_hs` | PA1 Hệ số | Decimal | `0.00` | Phải | | Tham chiếu cũ |
| **G** | `pa2_hs` | PA2 Hệ số (Chuẩn) | Decimal | `0.00` | Phải | | Tham chiếu chuẩn |
| **H** | `pa3_hs` | PA3 Hệ số | Decimal | `0.00` | Phải | | Tham chiếu mở rộng |
| **I** | `pa1_kpi` | PA1 KPI | Percent | `0.0%` | Phải | | Tham chiếu |
| **J** | `pa2_kpi` | PA2 KPI | Percent | `0.0%` | Phải | | Tham chiếu |
| **K** | `pa3_kpi` | PA3 KPI | Percent | `0.0%` | Phải | | Tham chiếu |
| **L** | `pa1_thuong` | PA1 Thưởng | Percent | `0.0%` | Phải | | Tham chiếu |
| **M** | `pa2_thuong` | PA2 Thưởng | Percent | `0.0%` | Phải | | Tham chiếu |
| **N** | `pa3_thuong` | PA3 Thưởng | Percent | `0.0%` | Phải | | Tham chiếu |
| **O** | `phu_cap_tn` | Phụ cấp TN ₫ | Currency | `#,##0 "₫"` | Phải | | Định mức phụ cấp chức vụ |
| **P** | `thu_lao_qt` | Thù lao QT ₫ | Currency | `#,##0 "₫"` | Phải | | Định mức thù lao HĐQT/BKS |
| **Q** | `ngay_hieu_luc`| Ngày hiệu lực | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu áp dụng |
| **R** | `quyet_dinh` | Quyết định phê duyệt | Text | `@` | Trái | | Nghị quyết HĐQT phê duyệt |
| **S** | `nhom_khoan` | Nhóm khoán | Text | `@` | Giữa | | `HDQT`, `TP_PP`, `CBNV` |
| **T** | `he_so_bac_1` | Hệ số bậc 1 | Decimal | `0.00` | Phải | | Hệ số Bậc 1 |
| **U** | `he_so_bac_2` | Hệ số bậc 2 | Decimal | `0.00` | Phải | | Hệ số Bậc 2 |
| **V** | `he_so_bac_3` | Hệ số bậc 3 | Decimal | `0.00` | Phải | | Hệ số Bậc 3 |
| **W** | `he_so_bac_4` | Hệ số bậc 4 | Decimal | `0.00` | Phải | | Hệ số Bậc 4 |
| **X** | `he_so_bac_5` | Hệ số bậc 5 | Decimal | `0.00` | Phải | | Hệ số Bậc 5 (Kịch trần ngạch) |
| **Y** | `phan_tram_vk` | % Vượt khung mỗi lần | Percent | `0.0%` | Phải | | 5.0% mỗi chu kỳ |
| **Z** | `lan_vk_max` | Lần vượt khung tối đa| Number | `0` | Giữa | | Mặc định 8 lần (40%) |
| **AA**| `ky_nang_bac` | Kỳ nâng bậc (năm) | Number | `0` | Giữa | | Chu kỳ nâng bậc chuẩn: 3 năm |

---

### BẢNG 4: `DM_KPI` (Từ Điển Chỉ Số KPI Nghiệp Vụ - 6 Cột)
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

### BẢNG 5: `CHAM_CONG` (Chấm Công & Ngày Phép Tháng - 11 Cột)
- **Mục đích**: Bảng chấm công hàng tháng của 12 CBNV.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ky_luong` | Kỳ (YYYY-MM) | Text | `@` | Giữa | **PK/FK**| Định dạng `YYYY-MM` (VD: `2027-01`) |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | **PK/FK**| `NV01` $\rightarrow$ `NV12` |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Họ tên cán bộ |
| **D** | `cong_chuan` | Công chuẩn | Number | `0.0` | Phải | | Mặc định 22 ngày |
| **E** | `cong_thuc` | Công thực tế | Number | `0.0` | Phải | | Số ngày thực tế đi làm |
| **F** | `nghi_phep` | Nghỉ phép | Number | `0.0` | Phải | | Nghỉ phép năm hưởng nguyên lương |
| **G** | `nghi_khong_luong`| Nghỉ không lương | Number | `0.0` | Phải | | Nghỉ việc riêng không lương |
| **H** | `nghi_che_do` | Nghỉ chế độ | Number | `0.0` | Phải | | Nghỉ thai sản, ốm đau BHXH |
| **I** | `tong_cong` | Tổng công tính lương | Number | `0.0` | Phải | | $=\text{Công thực} + \text{Phép}$ |
| **J** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Ghi chú chấm công |
| **K** | `thoi_gian_cap_nhat`| Thời gian cập nhật | Datetime | `dd/MM/yyyy HH:mm:ss` | Giữa | | Thời điểm cập nhật cuối |

---

### BẢNG 6: `DG_KPI` (Đánh Giá Chi Tiết KPI Tháng - 10 Cột)
- **Mục đích**: Bảng chi tiết kết quả thực hiện các chỉ tiêu KPI của từng cán bộ.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 4 (Mã ĐG, Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_danh_gia` | Mã đánh giá | Text | `@` | Giữa | **PK** | `DG_202701_NV09_01` |
| **B** | `ky_luong` | Kỳ (YYYY-MM) | Text | `@` | Giữa | **FK** | `2027-01` |
| **C** | `ma_nv` | Mã NV | Text | `@` | Giữa | **FK** | `NV09` |
| **D** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Tên nhân viên |
| **E** | `ma_kpi` | Mã KPI | Text | `@` | Giữa | **FK** | Liên kết `DM_KPI.ma_kpi` |
| **F** | `chi_tieu` | Chỉ tiêu giao | Text/Num | `@` | Phải | | Kế hoạch giao đầu tháng |
| **G** | `thuc_hien` | Thực tế thực hiện | Text/Num | `@` | Phải | | Số liệu thực tế đạt được |
| **H** | `ty_le_dat` | Tỷ lệ đạt % | Percent | `0.0%` | Phải | | Tỷ lệ % hoàn thành mục tiêu |
| **I** | `diem_trong_so` | Điểm trọng số | Decimal | `0.0` | Phải | | Điểm quy đổi vào KPI tháng |
| **J** | `xep_loai` | Xếp loại tháng | Text | `@` | Giữa | | `A+`, `A`, `B`, `C` |

---

### BẢNG 7: `BL_LICHSU` (Lịch Sử Bảng Lương Khóa Sổ - 35 Cột)
- **Mục đích**: Bảng thanh toán lương tổng hợp đã khóa sổ vĩnh viễn (Immutable), lưu vết chi tiết 22 chỉ tiêu tài chính, tiền thừa BHXH hoàn trả và chi phí Quỹ gánh chịu.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Ý nghĩa tài chính |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | Tháng/Năm (`2027-01`) |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | Khóa định danh cán bộ |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ nhận lương |
| **D** | `chuc_danh` | Chức danh | Text | `@` | Trái | Chức danh tại thời điểm đó |
| **E** | `he_so_luong` | Hệ số lương | Decimal | `0.00` | Phải | Hệ số lương ngạch bậc hưởng tại kỳ |
| **F** | `cong_chuan` | Công chuẩn | Number | `0.0` | Phải | Số ngày công chuẩn của tháng |
| **G** | `cong_thuc` | Công thực | Number | `0.0` | Phải | Số ngày công tính lương |
| **H** | `luong_ngach_bac`| Lương ngạch bậc | Currency| `#,##0 "₫"` | Phải | $\text{Lương cơ sở} \times \text{Hệ số} \times (\text{Công} / \text{Chuẩn})$ |
| **I** | `he_so_kpi` | Hệ số KPI | Decimal | `0.00` | Phải | Hệ số quỹ thưởng KPI chức danh |
| **J** | `luong_kpi` | Lương KPI | Currency| `#,##0 "₫"` | Phải | Lương KPI theo kết quả đánh giá |
| **K** | `tien_thuong` | Tiền thưởng | Currency| `#,##0 "₫"` | Phải | Thưởng hiệu quả định mức + Thưởng thi đua |
| **L** | `phu_cap_tn` | Phụ cấp trách nhiệm| Currency| `#,##0 "₫"` | Phải | Phụ cấp chức danh quản lý |
| **M** | `thu_lao_qt` | Thù lao quản trị | Currency| `#,##0 "₫"` | Phải | Thù lao HĐQT, Ban kiểm soát |
| **N** | `an_trua` | Ăn trưa | Currency| `#,##0 "₫"` | Phải | Tiền ăn ca khoán |
| **O** | `xang_xe` | Xăng xe | Currency| `#,##0 "₫"` | Phải | Hỗ trợ xăng xe công vụ |
| **P** | `dien_thoai` | Điện thoại | Currency| `#,##0 "₫"` | Phải | Hỗ trợ cước viễn thông |
| **Q** | `trang_phuc` | Trang phục | Currency| `#,##0 "₫"` | Phải | Khoán trang phục / đồng phục |
| **R** | `khoan_khac` | Khoán khác | Currency| `#,##0 "₫"` | Phải | Hỗ trợ chuyên môn, trực lễ tết |
| **S** | `tong_gross` | Tổng thu nhập Gross| Currency| `#,##0 "₫"` | Phải | Tổng toàn bộ thu nhập phát sinh |
| **T** | `tong_khau_tru_bh`| BHXH NLĐ (10.5%) | Currency| `#,##0 "₫"` | Phải | Tổng các khoản bảo hiểm trừ vào lương |
| **U** | `giam_tru_gia_canh`| Giảm trừ gia cảnh | Currency| `#,##0 "₫"` | Phải | Bản thân + Số NPT |
| **V** | `thu_nhap_tinh_thue`| Thu nhập tính thuế | Currency| `#,##0 "₫"` | Phải | Thu nhập chịu thuế trừ giảm trừ & bảo hiểm |
| **W** | `thue_tncn` | Thuế TNCN | Currency| `#,##0 "₫"` | Phải | Thuế TNCN khấu trừ lũy tiến |
| **X** | `thuc_linh` | Thực Lĩnh (Net) | Currency| `#,##0 "₫"` | Phải | **Số tiền chuyển vào tài khoản cán bộ** |
| **Y** | `tong_bh_quy` | BHXH Đơn vị (21.5%)| Currency| `#,##0 "₫"` | Phải | Bảo hiểm Quỹ nộp cơ quan BHXH |
| **Z** | `ngay_khoa_so` | Ngày chốt & Khóa sổ| Text | `@` | Giữa | Thời gian khóa sổ & Người duyệt |
| **AA**| `tham_nien_ct` | Thâm niên CT | Currency| `#,##0 "₫"` | Phải | Tiền thâm niên công tác |
| **AB**| `vuot_khung` | Vượt khung | Currency| `#,##0 "₫"` | Phải | Tiền vượt khung sau bậc 5 |
| **AC**| `diem_kpi` | Điểm KPI | Percent | `0.0%` | Phải | Tỷ lệ điểm KPI tháng (%) |
| **AD**| `luong_kpi_chi_tiet`| Lương KPI | Currency| `#,##0 "₫"` | Phải | Chi tiết lương KPI |
| **AE**| `tien_thua_bhxh`| Tiền thừa BHXH | Currency| `#,##0 "₫"` | Phải | Tiền thừa Quỹ hoàn trả khi đóng BHXH thấp hơn chuẩn L1 |
| **AF**| `bhxh_nld_8` | BHXH NLĐ 8% | Currency| `#,##0 "₫"` | Phải | Trừ 8% hưu trí tử tuất |
| **AG**| `bhyt_nld_1_5` | BHYT NLĐ 1.5% | Currency| `#,##0 "₫"` | Phải | Trừ 1.5% y tế |
| **AH**| `bhtn_nld_1` | BHTN NLĐ 1% | Currency| `#,##0 "₫"` | Phải | Trừ 1% thất nghiệp |
| **AI**| `tong_chi_phi_quy`| Tổng chi phí Quỹ | Currency| `#,##0 "₫"` | Phải | $=\text{Tổng Gross} + \text{Tổng BH Quỹ}$ |

---

### BẢNG 8: `TAIKHOAN` (Quản Lý Tài Khoản & Phân Quyền - 9 Cột)
- **Mục đích**: Phân quyền đăng nhập cho 12 cán bộ và Ban quản trị theo mô hình RBAC 4 cấp.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Mã tài khoản, Tên đăng nhập, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ràng buộc & Bảo mật |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_tai_khoan` | Mã tài khoản | Text | `@` | Giữa | **PK** | `ACC_NV01` $\rightarrow$ `ACC_NV12` |
| **B** | `ten_dang_nhap`| Tên đăng nhập / Mã NV | Text | `@` | Giữa | **Unique** | Số điện thoại hoặc Mã cán bộ |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | | Tên hiển thị người dùng |
| **D** | `mat_khau_hash` | Mật khẩu mã hóa | Text | `@` | Trái | | Chuỗi băm bảo mật SHA-256 |
| **E** | `email` | Email | Text | `@` | Trái | | Email cán bộ |
| **F** | `vai_tro` | Vai trò RBAC | Text | `@` | Giữa | | `SUPER_ADMIN`, `KE_TOAN`, `LANH_DAO`, `NHAN_VIEN` |
| **G** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HOẠT ĐỘNG` hoặc `TẠM KHÓA` |
| **H** | `lan_login_cuoi`| Lần đăng nhập cuối | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | | Giám sát an toàn thông tin |
| **I** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Ghi chú quyền hạn |

---

### BẢNG 9: `AUDIT_LOG` (Nhật Ký Hệ Thống - 7 Cột)
- **Mục đích**: Bảng bất biến (Immutable) ghi nhận mọi hành vi đăng nhập, xem lương, tính lương và chỉnh sửa số liệu.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã log, Thời gian).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `id_log` | Mã log | Text | `@` | Giữa | `LOG_001`, `LOG_002`... |
| **B** | `thoi_gian` | Thời gian (GMT+7) | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Giờ Việt Nam GMT+7 |
| **C** | `nguoi_thuc_hien`| Người thực hiện | Text | `@` | Trái | Tên cán bộ / Tài khoản |
| **D** | `thiet_bi` | Địa chỉ IP / Thiết bị | Text | `@` | Trái | Chrome/Windows, Safari/iPhone, IP |
| **E** | `hanh_dong` | Hành động | Text | `@` | Giữa | `DANG_NHAP`, `TINH_LUONG`, `KHOA_SO`... |
| **F** | `chi_tiet` | Chi tiết thao tác | Text | `@` | Trái | Mô tả chi tiết hành động và sự thay đổi |
| **G** | `trang_thai` | Trạng thái | Text | `@` | Giữa | `THÀNH CÔNG` hoặc `THẤT BẠI` |

---

### BẢNG 10: `PHAN_HOI` (Hộp Thư Phản Hồi Thắc Mắc - 9 Cột)
- **Mục đích**: Kênh trao đổi 2 chiều minh bạch giữa Người lao động và Bộ phận Kế toán.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 4 (Mã phản hồi, Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `id_phan_hoi` | Mã phản hồi | Text | `@` | Giữa | `FB_202701_001` |
| **B** | `ky_luong` | Kỳ lương thắc mắc | Text | `@` | Giữa | Tháng thắc mắc (`2027-01`) |
| **C** | `ma_nv` | Mã NV | Text | `@` | Giữa | Người gửi câu hỏi |
| **D** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ gửi |
| **E** | `noi_dung_cau_hoi`| Nội dung câu hỏi | Text | `@` | Trái | Câu hỏi / Trình bày của người lao động |
| **F** | `thoi_gian_gui` | Thời gian gửi | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Thời điểm gửi phản hồi |
| **G** | `nguoi_tiep_nhan`| Người tiếp nhận | Text | `@` | Trái | Kế toán tiền lương phụ trách |
| **H** | `noi_dung_giai_trinh`| Nội dung giải trình | Text | `@` | Trái | Câu trả lời, giải trình, điều chỉnh |
| **I** | `trang_thai` | Trạng thái xử lý | Text | `@` | Giữa | `MỚI GỬI`, `ĐANG XỬ LÝ`, `ĐÃ GIẢI ĐÁP` |

---

### BẢNG 11: `THAM_SO` (Tham Số Chung - 5 Cột)
- **Mục đích**: Cấu hình các tham số hiển thị và thông tin chung toàn hệ thống.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã tham số, Tên tham số).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Căn cứ & Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `ma_param` | Mã tham số | Text | `@` | Giữa | `BASIC_SALARY`, `UNIT_NAME`... |
| **B** | `ten_param` | Tên tham số | Text | `@` | Trái | Tên tiếng Việt rõ ràng |
| **C** | `gia_tri` | Giá trị | Number/Text| Tùy biến | Phải | Tiền tệ, tỷ lệ hoặc chuỗi ký tự |
| **D** | `don_vi_tinh` | Đơn vị tính | Text | `@` | Giữa | `₫/tháng`, `%`, chuỗi |
| **E** | `ghi_chu` | Ghi chú & Căn cứ | Text | `@` | Trái | Căn cứ văn bản và hướng dẫn |

---

### BẢNG 12: `DM_PHU_CAP` (Danh Mục Phụ Cấp & Khoán - 14 Cột)
- **Mục đích**: Cấu hình quy tắc nghiệp vụ cho từng loại phụ cấp và khoản khoán công vụ: Xác định tính đóng BHXH, tính thuế TNCN, hạn mức miễn trừ, nhóm đối tượng áp dụng và điều kiện hưởng.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã khoản, Tên khoản).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa nghiệp vụ |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_khoan` | Mã khoản | Text | `@` | Giữa | **PK** | `AN_TRUA`, `XANG_XE`, `DIEN_THOAI`, `TRANG_PHUC`... |
| **B** | `ten_khoan` | Tên khoản phụ cấp / khoán | Text | `@` | Trái | | Tên tiếng Việt rõ ràng |
| **C** | `phan_loai` | Phân loại chi | Text | `@` | Giữa | | `KHOAN_CONG_VU`, `PHU_CAP_LUONG`, `THU_LAO` |
| **D** | `cot_bang_luong`| Cột bảng lương | Text | `@` | Trái | | Ánh xạ cột hiển thị trên bảng lương |
| **E** | `tinh_bhxh` | Tính BHXH? | Text | `@` | Giữa | | `CÓ` (Tính đóng) hoặc `KHÔNG` (Miễn) |
| **F** | `tinh_thue` | Tính Thuế TNCN? | Text | `@` | Giữa | | `CÓ`, `KHÔNG`, `THEO_DINH_MUC` |
| **G** | `muc_mien_thue`| Mức miễn thuế tối đa ₫ | Currency| `#,##0 "₫"` | Phải | | Trần miễn thuế theo quy định |
| **H** | `phuong_thuc` | Phương thức tính | Text | `@` | Giữa | | `THEO_NGAY_CONG`, `CO_DINH_THANG` |
| **I** | `can_cu` | Căn cứ pháp lý & Quy chế | Text | `@` | Trái | | Căn cứ pháp lý, thông tư |
| **J** | `ghi_chu` | Ghi chú nghiệp vụ | Text | `@` | Trái | | Ghi chú kế toán |
| **K** | `nhom_ap_dung` | Nhóm áp dụng | Text | `@` | Giữa | | `TAT_CA`, `HDQT`, `TP_PP`, `CBNV` |
| **L** | `bat_tat` | Bật/tắt | Boolean | `@` | Giữa | | `TRUE` (Đang bật) / `FALSE` (Tắt) |
| **M** | `muc_co_dinh` | Mức cố định ₫ | Currency| `#,##0 "₫"` | Phải | | Định mức tiền áp dụng |
| **N** | `dieu_kien` | Điều kiện hưởng | Text | `@` | Trái | | Điều kiện được hưởng phụ cấp |

---

### BẢNG 13: `LS_KHOAN` (Lịch Sử Định Mức Khoán SCD-2 - 14 Cột)
- **Mục đích**: Lưu vết lịch sử các quyết định thay đổi mức khoán theo thời gian (Slowly Changing Dimensions Type 2).
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Mã bản ghi, Mã khoản, Tên khoản).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa nghiệp vụ |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `id_lsk` | Mã bản ghi | Text | `@` | Giữa | **PK** | `LSK_AN_2027`, `LSK_XANG_TD_2027`... |
| **B** | `ma_khoan` | Mã khoản | Text | `@` | Giữa | **FK** | Liên kết `DM_PHU_CAP.ma_khoan` |
| **C** | `ten_khoan` | Tên khoản khoán / phụ cấp | Text | `@` | Trái | | Tên khoản chi |
| **D** | `doi_tuong` | Đối tượng áp dụng | Text | `@` | Giữa | | Phạm vi thụ hưởng |
| **E** | `muc_cu` | Mức khoán cũ ₫ | Currency| `#,##0 "₫"` | Phải | | Mức trước khi điều chỉnh |
| **F** | `muc_moi` | Mức khoán mới ₫ | Currency| `#,##0 "₫"` | Phải | | Mức mới được phê duyệt |
| **G** | `don_vi_tinh` | Đơn vị tính | Text | `@` | Giữa | | `₫/tháng`, `₫/ngày công` |
| **H** | `tu_ngay` | Từ ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu áp dụng |
| **I** | `den_ngay` | Đến ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày kết thúc (`31/12/2099`) |
| **J** | `so_qd` | Số quyết định | Text | `@` | Giữa | | Số hiệu văn bản HĐQT |
| **K** | `ngay_qd` | Ngày quyết định | Date | `dd/MM/yyyy` | Giữa | | Ngày ký quyết định |
| **L** | `nguoi_ky` | Người ký | Text | `@` | Trái | | Chủ tịch HĐQT / Giám đốc |
| **M** | `ly_do` | Lý do thay đổi | Text | `@` | Trái | | Trượt giá, thay đổi cơ chế |
| **N** | `trang_thai` | Trạng thái | Text | `@` | Giữa | | `HIỆN TẠI` / `HẾT HIỆU LỰC` |

---

### BẢNG 14: `DM_BAC_LUONG` (Bảng Lương Ngạch Bậc 5 Bậc - 8 Cột)
- **Mục đích**: Bảng ngạch bậc 5 bậc cho 10 chức danh của Quỹ, hệ số tương ứng và mức lương ngạch bậc theo lương cơ sở.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã vị trí, Tên chức danh).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Ý nghĩa |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_vi_tri` | Mã vị trí | Text | `@` | Giữa | **PK** | `P01` $\rightarrow$ `P10` |
| **B** | `ten_chuc_danh` | Tên chức danh | Text | `@` | Trái | | Tên chức danh công tác |
| **C** | `bac` | Bậc | Number | `0` | Giữa | **PK** | `1`, `2`, `3`, `4`, `5` |
| **D** | `loai_bac` | Loại bậc | Text | `@` | Giữa | | `BAC_THUONG` hoặc `VUOT_KHUNG` |
| **E** | `he_so` | Hệ số | Decimal | `0.00` | Phải | | Hệ số lương tương ứng bậc |
| **F** | `luong_ngach_bac`| Lương ngạch bậc (CB 2340K)| Currency| `#,##0 "₫"` | Phải | | $=\text{Lương cơ sở} \times \text{Hệ số}$ |
| **G** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Ghi chú điều kiện nâng bậc |
| **H** | `ngay_hieu_luc` | Ngày hiệu lực | Date | `dd/MM/yyyy` | Giữa | | Ngày bắt đầu áp dụng |

---

### BẢNG 15: `DM_THAM_SO_LUONG` (Tham Số Pháp Lý & Lương Nghiệp Vụ - 10 Cột)
- **Mục đích**: Lưu trữ động toàn bộ tham số pháp lý phục vụ động cơ tính lương (Payroll Engine) mà không hardcode trong mã nguồn: Lương cơ sở, trần BHXH, tỷ lệ đóng bảo hiểm các bên, mức giảm trừ thuế TNCN, tỷ lệ % thâm niên, cơ chế vượt khung.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Nhóm tham số, Mã tham số).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `nhom_tham_so` | Nhóm tham số | Text | `@` | Giữa | | `CO_SO`, `BHXH`, `THUE_TNCN`, `THAM_NIEN`, `VUOT_KHUNG` |
| **B** | `ma_tham_so` | Mã tham số | Text | `@` | Giữa | **PK** | `LUONG_CO_SO`, `BHXH_NLD`, `TNCN_GIAM_TRU_BAN_THAN`... |
| **C** | `ten_tham_so` | Tên tham số | Text | `@` | Trái | | Tên gọi rõ ràng |
| **D** | `gia_tri_so` | Giá trị số | Number | Tùy biến | Phải | | Giá trị số học (VD: 2340000, 0.08, 11000000) |
| **E** | `gia_tri_chuoi`| Giá trị chuỗi | Text | `@` | Trái | | Giá trị chuỗi nếu có |
| **F** | `don_vi` | Đơn vị | Text | `@` | Giữa | | `VNĐ`, `%`, `năm`, `lần` |
| **G** | `tu_ngay` | Từ ngày hiệu lực | Date | `dd/MM/yyyy` | Giữa | | Ngày có hiệu lực |
| **H** | `den_ngay` | Đến ngày | Date | `dd/MM/yyyy` | Giữa | | Ngày hết hạn |
| **I** | `can_cu` | Căn cứ pháp lý | Text | `@` | Trái | | Nghị định, Luật BHXH, Luật Thuế |
| **J** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Ghi chú áp dụng |

---

### BẢNG 16: `DM_CONG_THUC` (Danh Mục Công Thức 4 Tầng Lương - 10 Cột)
- **Mục đích**: Khai báo 13 công thức cấu thành thu nhập và chi phí lương của Quỹ tín dụng, xác định rõ thứ tự tính, cờ tính BHXH, tính thuế và phạm vi áp dụng.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 và 2 (Mã CT, Tên thành phần).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Khóa | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **A** | `ma_ct` | Mã CT | Text | `@` | Giữa | **PK** | `CT01` $\rightarrow$ `CT13` |
| **B** | `ten_thanh_phan`| Tên thành phần | Text | `@` | Trái | | Lương vị trí, thâm niên, KPI, ăn trưa, BHXH... |
| **C** | `thu_tu` | Thứ tự | Number | `0` | Giữa | | Thứ tự bước thực hiện trong động cơ tính |
| **D** | `cach_tinh` | Cách tính | Text | `@` | Trái | | Diễn giải công thức toán học |
| **E** | `tinh_bhxh` | Tính BHXH | Text | `@` | Giữa | | `CÓ` hoặc `KHÔNG` |
| **F** | `tinh_thue` | Tính Thuế | Text | `@` | Giữa | | `CÓ`, `KHÔNG`, `THEO_TRẦN` |
| **G** | `mien_thue_max`| Miễn thuế tối đa | Currency| `#,##0 "₫"` | Phải | | Trần miễn thuế |
| **H** | `pham_vi` | Phạm vi áp dụng | Text | `@` | Giữa | | `TOAN_QUY`, `LÃNH_ĐẠO`, `CHUYÊN_MÔN` |
| **I** | `bat_tat` | Bật/tắt | Boolean | `@` | Giữa | | `TRUE` / `FALSE` |
| **J** | `ghi_chu` | Ghi chú | Text | `@` | Trái | | Quy tắc nghiệp vụ chi tiết |

---

### BẢNG 17: `KQ_LUONG_THANG` (Kết Quả Tính Lương Hàng Tháng - 40 Cột)
- **Mục đích**: Bảng kết quả tính toán chi tiết 22 mục cho 12 CBNV ở trạng thái dự thảo (`DRAFT`) hoặc đã chốt (`LOCKED`), làm nền tảng cho việc xuất báo cáo Excel, Ảnh và PDF trước khi khóa sổ.
- **Cố định**: Hàng 1 (Tiêu đề), Cột 1 đến 3 (Kỳ lương, Mã NV, Họ và tên).

| Cột | Mã trường | Tên cột hiển thị | Kiểu | Định dạng | Căn lề | Diễn giải |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **A** | `ky_luong` | Kỳ lương | Text | `@` | Giữa | Định dạng `YYYY-MM` |
| **B** | `ma_nv` | Mã NV | Text | `@` | Giữa | Khóa cán bộ |
| **C** | `ho_ten` | Họ và tên | Text | `@` | Trái | Tên cán bộ |
| **D** | `chuc_danh` | Chức danh | Text | `@` | Trái | Chức danh công tác |
| **E** | `bac` | Bậc | Number | `0` | Giữa | Bậc ngạch lương hiện hưởng (1-5) |
| **F** | `he_so` | Hệ số | Decimal | `0.00` | Phải | Hệ số lương ngạch bậc |
| **G** | `cong_chuan` | Ngày công chuẩn | Number | `0.0` | Phải | Công chuẩn tháng (22) |
| **H** | `cong_thuc` | Ngày công thực | Number | `0.0` | Phải | Công thực tế đi làm |
| **I** | `luong_ngach_bac`| Lương ngạch bậc | Currency| `#,##0 "₫"` | Phải | Lương ngạch bậc theo ngày công |
| **J** | `tham_nien_ct` | Thâm niên CT | Currency| `#,##0 "₫"` | Phải | Phụ cấp thâm niên công tác |
| **K** | `vuot_khung` | Vượt khung | Currency| `#,##0 "₫"` | Phải | Phụ cấp vượt khung sau bậc 5 |
| **L** | `phu_cap_tn` | Phụ cấp TN | Currency| `#,##0 "₫"` | Phải | Phụ cấp trách nhiệm chức vụ |
| **M** | `an_trua` | Ăn trưa | Currency| `#,##0 "₫"` | Phải | Tiền ăn trưa khoán |
| **N** | `xang_xe` | Xăng xe | Currency| `#,##0 "₫"` | Phải | Tiền xăng xe khoán |
| **O** | `dien_thoai` | Điện thoại | Currency| `#,##0 "₫"` | Phải | Tiền cước điện thoại khoán |
| **P** | `trang_phuc` | Trang phục | Currency| `#,##0 "₫"` | Phải | Tiền trang phục khoán |
| **Q** | `khoan_khac` | Khoán khác | Currency| `#,##0 "₫"` | Phải | Khoán hỗ trợ khác |
| **R** | `diem_kpi` | Điểm KPI | Percent | `0.0%` | Phải | Tỷ lệ điểm KPI tháng (%) |
| **S** | `luong_kpi` | Lương KPI | Currency| `#,##0 "₫"` | Phải | Tiền lương KPI hiệu quả |
| **T** | `tien_thuong` | Tiền thưởng | Currency| `#,##0 "₫"` | Phải | Tiền thưởng định mức / thi đua |
| **U** | `tien_thua_bhxh`| Tiền thừa BHXH | Currency| `#,##0 "₫"` | Phải | Tiền thừa Quỹ hoàn trả cộng vào Gross |
| **V** | `tong_gross` | Tổng Gross | Currency| `#,##0 "₫"` | Phải | Tổng thu nhập trước giảm trừ & bảo hiểm |
| **W** | `can_cu_dong_bh`| Căn cứ đóng BHXH | Currency| `#,##0 "₫"` | Phải | Mức lương làm căn cứ trích BHXH |
| **X** | `bhxh_nld` | BHXH NLĐ 8% | Currency| `#,##0 "₫"` | Phải | Khấu trừ BHXH người lao động |
| **Y** | `bhyt_nld` | BHYT NLĐ 1.5% | Currency| `#,##0 "₫"` | Phải | Khấu trừ BHYT người lao động |
| **Z** | `bhtn_nld` | BHTN NLĐ 1% | Currency| `#,##0 "₫"` | Phải | Khấu trừ BHTN người lao động |
| **AA**| `tong_khau_tru_bh`| Tổng khấu trừ BH | Currency| `#,##0 "₫"` | Phải | Tổng bảo hiểm NLĐ gánh chịu (10.5%) |
| **AB**| `thu_nhap_chiu_thue`| Thu nhập chịu thuế | Currency| `#,##0 "₫"` | Phải | Gross trừ các khoản khoán miễn thuế |
| **AC**| `giam_tru_ban_than`| Giảm trừ bản thân | Currency| `#,##0 "₫"` | Phải | 11.000.000 ₫/tháng |
| **AD**| `giam_tru_npt` | Giảm trừ NPT | Currency| `#,##0 "₫"` | Phải | 4.400.000 ₫ $\times$ Số NPT |
| **AE**| `thu_nhap_tinh_thue`| Thu nhập tính thuế | Currency| `#,##0 "₫"` | Phải | Chịu thuế trừ giảm trừ và bảo hiểm |
| **AF**| `thue_tncn` | Thuế TNCN | Currency| `#,##0 "₫"` | Phải | Thuế TNCN lũy tiến 7 bậc |
| **AG**| `thuc_linh` | Thực lĩnh Net | Currency| `#,##0 "₫"` | Phải | **$=\text{Gross} - \text{Bảo hiểm NLĐ} - \text{Thuế TNCN}$** |
| **AH**| `bhxh_quy` | BHXH Quỹ 17.5% | Currency| `#,##0 "₫"` | Phải | Quỹ đóng cơ quan BHXH |
| **AI**| `bhyt_quy` | BHYT Quỹ 3% | Currency| `#,##0 "₫"` | Phải | Quỹ đóng cơ quan BHYT |
| **AJ**| `bhtn_quy` | BHTN Quỹ 1% | Currency| `#,##0 "₫"` | Phải | Quỹ đóng cơ quan BHTN |
| **AK**| `tong_chi_phi_quy`| Tổng chi phí Quỹ | Currency| `#,##0 "₫"` | Phải | $=\text{Gross} + \text{BH Quỹ (21.5\%)}$ |
| **AL**| `trang_thai` | Trạng thái | Text | `@` | Giữa | `DRAFT` (Dự thảo) hoặc `LOCKED` (Đã chốt) |
| **AM**| `nguoi_tao` | Người tạo | Text | `@` | Trái | Tài khoản thực hiện tính |
| **AN**| `thoi_gian_tao`| Thời gian tạo | Datetime| `dd/MM/yyyy HH:mm:ss` | Giữa | Thời điểm tính toán |

---

## 🛠️ 4. HƯỚNG DẪN KÍCH HOẠT TỰ ĐỘNG CHỮA LÀNH CSDL (SELF-HEALING)

Toàn bộ 17 bảng dữ liệu được bảo đảm tính nhất quán và tự động hoàn thiện thông qua `SchemaManager.ensureDatabaseSchema()`:
- **ID Google Sheet**: `1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8`
- **Link Google Sheet**: [Mở Google Sheet CSDL](https://docs.google.com/spreadsheets/d/1izLMpdJem2Hn4SH62SomExx8RaLjCRRLoiaS2u_IVi8/edit)
- **Link dự án Apps Script**: [Mở Google Apps Script](https://script.google.com/d/14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr/edit)

**Quy tắc tự phục hồi (Self-Healing Rule)**:
1. Khi có bất kỳ request nào nạp dữ liệu (`getAllDataBundle`) hoặc khi khởi động hệ thống, `SchemaManager.ensureDatabaseSchema()` sẽ tự động:
   - Kiểm tra sự tồn tại của toàn bộ 17 Sheet. Nếu thiếu sheet nào, tự động tạo mới sheet đó với hàng Header chuẩn.
   - Kiểm tra toàn bộ danh sách cột của từng Sheet. Nếu thiếu cột mới (ví dụ cột liên kết Google Drive, Bậc lương, Năm vượt khung...), tự động chèn thêm cột vào bên phải bảng mà **bảo toàn 100% dữ liệu cũ (Zero Data Loss)**.
2. Quản trị viên cũng có thể chủ động kích hoạt hàm `khoiTaoHeThongCSDL()` trong `SetupDatabase.js` bất kỳ lúc nào để định dạng lại màu sắc, kẻ viền và nạp dữ liệu chuẩn ban đầu.

---

## 👥 5. DANH SÁCH BIÊN CHẾ 12 CÁN BỘ NHÂN VIÊN THỰC TẾ

| TT | Mã NV | Họ và tên | Chức danh chính quyền | Khối PB | Điện thoại (User Login) | Email | CCCD (12 số) | Giới tính | Ngày vào làm | Ngày đảm nhiệm CV | Bậc |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `NV01` | **Nguyễn Thị Sinh** | Thẩm định tài sản | Tín dụng | `0388232844` | `Sinhtdyt@gmail.com` | `038162004401` | Nữ | 09/03/2005 | 09/03/2006 | 5 |
| 2 | `NV02` | **Nguyễn Thị Mến** | Kế toán trưởng | Kế toán | `0349547779` | `nguyenmen.yt.83@gmail.com` | `038183010925` | Nữ | 09/03/2007 | 08/03/2008 | 5 |
| 3 | `NV03` | **Nguyễn Văn Sơn** | UV HĐQT - Giám đốc | Điều hành | `0941562789` | `nguyenvansontdyt@gmail.com` | `038080021750` | Nam | 09/10/2012 | 09/10/2013 | 4 |
| 4 | `NV04` | **Bùi Thị Thảo** | Trưởng ban kiểm soát | Kiểm soát | `0839062825` | `thao.bui0282@gmail.com` | `038182047645` | Nữ | 19/11/2012 | 19/11/2013 | 4 |
| 5 | `NV05` | **Nguyễn Hữu Nhân** | CB tín dụng | Tín dụng | `0949116817` | `qtdyentho.huunhan@gmail.com` | `038085009285` | Nam | 30/01/2013 | 30/01/2014 | 4 |
| 6 | `NV06` | **Trịnh Thị Hiền** | KST - Kiểm toán nội bộ | Kiểm soát | `0948784333` | `qtdyentho.hienha@gmail.com` | `038183049074` | Nữ | 21/05/2014 | 21/05/2015 | 4 |
| 7 | `NV07` | **Trịnh Đức Anh** | Chủ tịch HĐQT | HĐQT | `0965122111` | `ducanht@gmail.com` | `038086010115` | Nam | 03/06/2016 | 03/06/2017 | 3 |
| 8 | `NV08` | **Vũ Thị Hiền** | UV HĐQT | HĐQT | `0983502181` | `qtdyentho.vuhien@gmail.com` | `038186037786` | Nữ | 04/06/2018 | 04/06/2019 | 3 |
| 9 | `NV09` | **Trần Như Huyền** | CB tín dụng | Tín dụng | `0985709609` | `Huyennhutran@gmail.com` | `038189039532` | Nữ | 11/12/2020 | 11/12/2021 | 2 |
| 10 | `NV10` | **Hoàng Thị Lan** | Kế toán viên | Kế toán | `0965178666` | `hoanglan1289@gmail.com` | `038189040044` | Nữ | 08/10/2021 | 08/10/2022 | 2 |
| 11 | `NV11` | **Phạm Thị Thảo** | Thủ quỹ | Kế toán | `0965567596` | `qtdyentho.phamthao@gmail.com` | `038190051894` | Nữ | 06/09/2023 | 06/09/2024 | 1 |
| 12 | `NV12` | **Lưu Thị Định** | CB tín dụng | Tín dụng | `0961007855` | `qtdyentho.luudinh@gmail.com` | `038189028302` | Nữ | 06/09/2024 | 06/09/2025 | 1 |
