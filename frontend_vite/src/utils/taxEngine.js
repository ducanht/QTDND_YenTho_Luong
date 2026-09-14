/**
 * ĐỘNG CƠ TÍNH THUẾ TNCN & TRÍCH ĐÓNG BẢO HIỂM XÃ HỘI (LUẬT BHXH 2024 & TT 111/2013)
 * Áp dụng cho CBNV Quỹ tín dụng nhân dân Yên Thọ
 */

export function calculateProgressiveTax(taxableIncome) {
  if (!taxableIncome || taxableIncome <= 0) return 0;

  // Biểu thuế lũy tiến từng phần 7 bậc
  if (taxableIncome <= 5000000) {
    return taxableIncome * 0.05;
  } else if (taxableIncome <= 10000000) {
    return taxableIncome * 0.10 - 250000;
  } else if (taxableIncome <= 18000000) {
    return taxableIncome * 0.15 - 750000;
  } else if (taxableIncome <= 32000000) {
    return taxableIncome * 0.20 - 1650000;
  } else if (taxableIncome <= 52000000) {
    return taxableIncome * 0.25 - 3250000;
  } else if (taxableIncome <= 80000000) {
    return taxableIncome * 0.30 - 5850000;
  } else {
    return taxableIncome * 0.35 - 9850000;
  }
}

export function computeStaffPayrollItem({
  staff,
  position,
  timesheet,
  allowances = [],
  params = {}
}) {
  const luongCoSo = Number(params.LUONG_CO_SO) || 2340000;
  const congChuan = Number(timesheet?.congChuan) || 22;
  const congThuc = Number(timesheet?.congThucTe) || 0;
  const congPhep = Number(timesheet?.nghiPhep) || 0;

  // 1.  // Hệ số lương & chức danh (Mặc định lấy PA2 - Chuẩn)
  const heSoLuong = Number(position?.pa2HeSo) || 2.85;
  const heSoKpi = Number(position?.pa2Kpi) || 0.15;
  const phuCapTN = Number(position?.phuCapTN) || 0;

  // Tỷ lệ công hưởng lương thời gian
  const tyLeCong = congChuan > 0 ? (congThuc + congPhep) / congChuan : 0;
  const tyLeCongThuc = congChuan > 0 ? congThuc / congChuan : 0;

  // Tầng 1: Lương ngạch bậc
  const luongNgachBac = Math.round(luongCoSo * heSoLuong * tyLeCong);

  // Tầng 2: Lương KPI & Thưởng
  const kpiPercent = 100; // Tỷ lệ đạt KPI (%)
  const luongKpi = Math.round(luongCoSo * heSoKpi * (kpiPercent / 100) * tyLeCongThuc);
  const tienThuong = 0;

  // Tầng 3: Phụ cấp khoán công vụ (Định mức)
  const anTrua = 1000000;
  const xangXe = position?.khoi === 'Nghiệp vụ' ? 400000 : 0;
  const dienThoai = ['P01', 'P02', 'P04', 'P05'].includes(position?.maViTri) ? 300000 : 0;
  const trangPhuc = 500000;
  const khoanKhac = 0;

  // Tổng thu nhập Gross (Đã loại bỏ hoàn toàn Thù lao HĐQT)
  const tongGross = luongNgachBac + luongKpi + tienThuong + phuCapTN + anTrua + xangXe + dienThoai + trangPhuc + khoanKhac;

  // Tầng 4: BHXH & Thuế TNCN
  const luongDongBhxhMax = luongCoSo * 20; // Trần 20 lần lương cơ sở
  const luongDongBhxh = Math.min(luongNgachBac + phuCapTN, luongDongBhxhMax);

  const bhxhNld = Math.round(luongDongBhxh * 0.105); // 8% BHXH + 1.5% BHYT + 1% BHTN
  const bhxhDonVi = Math.round(luongDongBhxh * 0.235);

  // Giảm trừ gia cảnh
  const giamTruBanThan = Number(params.GIAM_TRU_BAN_THAN) || 11000000;
  const giamTruNPT = (Number(staff?.soNPT) || 0) * (Number(params.GIAM_TRU_PHU_THUOC) || 4400000);
  const tongGiamTru = giamTruBanThan + giamTruNPT + bhxhNld;

  // Thu nhập chịu thuế (Miễn tối đa 730k tiền ăn ca, miễn xăng xe/điện thoại công vụ)
  const mienThueAnTrua = Math.min(anTrua, 730000);
  const mienThueKhoan = mienThueAnTrua + xangXe + dienThoai + trangPhuc;
  const thuNhapChiuThue = Math.max(0, tongGross - mienThueKhoan);

  // Thu nhập tính thuế & Thuế TNCN
  const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - tongGiamTru);
  const thueTNCN = Math.round(calculateProgressiveTax(thuNhapTinhThue));

  // Thực lĩnh (Net)
  const thucLinh = tongGross - bhxhNld - thueTNCN;

  return {
    maNV: staff?.maNV || '',
    hoTen: staff?.hoTen || '',
    chucDanh: position?.tenChucDanh || staff?.chucDanh || '',
    heSoLuong,
    congChuan,
    congThuc,
    luongNgachBac,
    heSoKpi,
    luongKpi,
    tienThuong,
    phuCapTN,
    anTrua,
    xangXe,
    dienThoai,
    trangPhuc,
    khoanKhac,
    tongGross,
    bhxhNld,
    giamTruGiaCanh: giamTruBanThan + giamTruNPT,
    thuNhapTinhThue,
    thueTNCN,
    thucLinh,
    bhxhDonVi
  };
}

/**
 * XÁC ĐỊNH MÃ KHỐI / BỘ PHẬN TỪ HỒ SƠ CBNV
 */
export function detectDepartmentKey(emp, pos) {
  const cd = (emp?.chucDanh || pos?.tenChucDanh || '').toUpperCase();
  if (cd.includes('CHỦ TỊCH') || cd.includes('GIÁM ĐỐC') || cd.includes('KIỂM SOÁT')) return 'LANH_DAO';
  if (cd.includes('TÍN DỤNG')) return 'TIN_DUNG';
  if (cd.includes('KẾ TOÁN') || cd.includes('THỦ QUỸ')) return 'KE_TOAN';
  return 'HO_TRO';
}

/**
 * ĐỘNG CƠ MÔ PHỎNG LƯƠNG & CÁC KHOẢN THEO LƯƠNG 4 TẦNG CHI TIẾT (CHUẨN HĐQT)
 * - Tầng 1: Lương Vị trí Chức danh (Hệ số x Lương cơ sở)
 * - Tầng 2: Lương KPI tính theo % Kết cấu lương của từng bộ phận (có thể thay đổi linh hoạt)
 * - Tầng 3: Các khoản phụ cấp khoán công vụ (Không tính thù lao HĐQT/BKS ở đây)
 * - Tầng 4: Trích nộp BHXH tùy biến từng người; Số thừa so DN trả được cộng vào thu nhập hưởng thêm
 */
export function simulateStaffCompensation({
  emp,
  pos,
  scenario = 'PA3',
  luongCoSo = 2340000,
  // Cấu hình tính KPI:
  kpiCalcMethod = 'DEPT_RATIO', // 'DEPT_RATIO' (% kết cấu bộ phận) | 'FIXED_PRICE'
  deptKpiRatio = 40, // % Lương KPI trong kết cấu thu nhập (ví dụ: 40% KPI, 60% Vị trí)
  tranKpi = 115,
  donGiaKpiCoBan = 4000000,
  kpiPerformanceRatio = 1.0,

  // Cấu hình BHXH tùy biến từng người:
  customBhxhSalary = null, // Mức lương BHXH cá nhân chọn đăng ký đóng
  
  // Định mức phụ cấp Tầng 3:
  anTrua = 850000,
  xangXe = 500000,
  dienThoai = 400000,
  trangPhuc = 416666,
  trachNhiem = 600000,
  docHai = 400000,
  pitRegime = 'CURRENT'
}) {
  let heSoLuong = Number(emp?.heSoLuong) || 2.5;
  let heSoKpi = Number(emp?.heSoKpi) || 1.0;
  let phuCapTnChucDanh = 0;

  if (pos) {
    if (scenario === 'PA1') {
      heSoLuong = Number(pos.pa1HeSo) || heSoLuong;
      heSoKpi = Number(pos.pa1Kpi) || heSoKpi;
    } else if (scenario === 'PA2') {
      heSoLuong = Number(pos.pa2HeSo) || heSoLuong;
      heSoKpi = Number(pos.pa2Kpi) || heSoKpi;
    } else {
      heSoLuong = Number(pos.pa3HeSo) || heSoLuong;
      heSoKpi = Number(pos.pa3Kpi) || heSoKpi;
    }
    phuCapTnChucDanh = Number(pos.phuCapTN) || 0;
  }

  // TẦNG 1: LƯƠNG VỊ TRÍ CHỨC DANH
  const luongViTri = Math.round(heSoLuong * luongCoSo);

  // TẦNG 2: LƯƠNG NĂNG SUẤT KPI THEO % KẾT CẤU BỘ PHẬN
  let luongKpi = 0;
  if (kpiCalcMethod === 'DEPT_RATIO') {
    // Tỷ lệ KPI p% trong kết cấu (L1 + L2). Tỷ lệ chuyển đổi r = p / (100 - p)
    const validRatio = Math.max(0, Math.min(deptKpiRatio, 85));
    const multiplier = (100 - validRatio) > 0 ? (validRatio / (100 - validRatio)) : 0;
    const luongKpiCoSoTheoKetCau = luongViTri * multiplier;
    // Nhân với hệ số năng lực cá nhân và mức độ hoàn thành
    const personalWeight = heSoKpi > 0 ? (heSoKpi / 1.0) : 1.0;
    luongKpi = Math.round(luongKpiCoSoTheoKetCau * personalWeight * (tranKpi / 100) * kpiPerformanceRatio);
  } else {
    // Phương pháp đơn giá điểm KPI truyền thống
    luongKpi = Math.round(heSoKpi * donGiaKpiCoBan * (tranKpi / 100) * kpiPerformanceRatio);
  }

  // TẦNG 3: CÁC KHOẢN PHỤ CẤP KHOÁN CÔNG VỤ (100% KHÔNG TÍNH THÙ LAO HĐQT Ở ĐÂY)
  const chucDanhStr = String(emp?.chucDanh || '');
  let khoanXangXe = xangXe;
  if (chucDanhStr.includes('Tín dụng')) khoanXangXe = Math.round(xangXe * 1.5);
  else if (chucDanhStr.includes('Giám đốc') || chucDanhStr.includes('Chủ tịch')) khoanXangXe = Math.round(xangXe * 1.2);

  let khoanDienThoai = dienThoai;
  if (['Giám đốc', 'Chủ tịch', 'Kế toán trưởng', 'Tín dụng'].some(t => chucDanhStr.includes(t))) {
    khoanDienThoai = Math.round(dienThoai * 1.2);
  }

  const khoanTrachNhiem = phuCapTnChucDanh || (chucDanhStr.includes('Giám đốc') || chucDanhStr.includes('Chủ tịch') ? trachNhiem : 0);
  const khoanDocHai = chucDanhStr.includes('Thủ quỹ') ? docHai : 0;
  const khoanAnTrua = anTrua;
  const khoanTrangPhuc = trangPhuc;

  const tongKhoanChi = khoanAnTrua + khoanXangXe + khoanDienThoai + khoanTrangPhuc + khoanDocHai;
  const tongPhuCap = khoanTrachNhiem; // Chỉ tính phụ cấp trách nhiệm công việc chuyên môn, không tính thù lao HĐQT

  // TẦNG 4: BHXH TÙY BIẾN & SỐ THỪA SO VỚI DOANH NGHIỆP TRẢ ĐƯỢC HƯỞNG
  const maxLuongDongBhxh = luongCoSo * 20; // Trần 20 lần lương cơ sở (46.800.000đ)
  const minLuongDongBhxh = 2340000; // Mức sàn cơ sở tối thiểu

  // 1. Mức chuẩn Quỹ chi trả theo chức danh (Định mức DN trả cho vị trí)
  const luongDongBhxhChuan = Math.min(luongViTri, maxLuongDongBhxh);
  const bhxhDonViDinhMuc = Math.round(luongDongBhxhChuan * 0.235); // 23.5%

  // 2. Mức lương đóng BHXH cá nhân thực tế đăng ký
  let luongDongBhxhThucTe = luongDongBhxhChuan;
  if (customBhxhSalary !== null && customBhxhSalary !== undefined && customBhxhSalary !== '') {
    luongDongBhxhThucTe = Math.min(Math.max(Number(customBhxhSalary) || minLuongDongBhxh, minLuongDongBhxh), maxLuongDongBhxh);
  }

  // 3. Quỹ thực đóng vào cơ quan BHXH: 23.5% trên mức thực tế
  const bhxhDonViThucTe = Math.round(luongDongBhxhThucTe * 0.235);

  // 4. Số tiền thừa so với mức Quỹ trả mà người lao động được hưởng (Cộng vào thu nhập)
  const tienThuaBhxhHuong = Math.max(0, bhxhDonViDinhMuc - bhxhDonViThucTe);

  // 5. NLĐ đóng BHXH (10.5%) & Đoàn phí (1%) trên mức thực tế đăng ký
  const bhxhNld = Math.round(luongDongBhxhThucTe * 0.105);
  const doanPhiNld = Math.min(Math.round(luongDongBhxhThucTe * 0.01), Math.round(luongCoSo * 0.1));

  // TỔNG THU NHẬP GROSS (Bao gồm số thừa BHXH được hưởng)
  const tongGross = luongViTri + luongKpi + tongPhuCap + tongKhoanChi + tienThuaBhxhHuong;

  // KHOẢN MIỄN THUẾ TNCN HỢP LỆ
  const mienThueAnTrua = Math.min(khoanAnTrua, 730000);
  const mienThueTrangPhuc = Math.min(khoanTrangPhuc, 416666);
  const mienThueCongVu = khoanXangXe + khoanDienThoai;
  const tongMienThue = mienThueAnTrua + mienThueTrangPhuc + mienThueCongVu;

  const thuNhapChiuThue = Math.max(0, tongGross - tongMienThue);

  // GIẢM TRỪ GIA CẢNH
  const mucBanThan = pitRegime === 'DRAFT' ? 15000000 : 11000000;
  const mucPhuThuoc = pitRegime === 'DRAFT' ? 6200000 : 4400000;
  const soNPT = Number(emp?.soNguoiPhuThuoc || emp?.soNPT) || 0;
  const giamTruGiaCanh = mucBanThan + soNPT * mucPhuThuoc;

  // THU NHẬP TÍNH THUẾ & THUẾ TNCN
  const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - giamTruGiaCanh - bhxhNld);
  const thueTncn = Math.round(calculateProgressiveTax(thuNhapTinhThue));

  // THỰC LĨNH NET (Về tài khoản)
  const thucLinhNet = tongGross - bhxhNld - doanPhiNld - thueTncn;

  // TỔNG CHI PHÍ QUỸ GÁNH CHỊU (Gross + BHXH Quỹ thực đóng)
  // Lưu ý: tongGross + bhxhDonViThucTe = (luongViTri + luongKpi + tongPhuCap + tongKhoanChi) + bhxhDonViDinhMuc
  // Chi phí của Quỹ luôn được bảo toàn đúng định mức ban đầu, không bị phát sinh vượt ngân sách!
  const tongChiPhiQuy = tongGross + bhxhDonViThucTe;

  return {
    maNV: emp?.maNV || '',
    hoTen: emp?.hoTen || '',
    chucDanh: emp?.chucDanh || '',
    phongBan: emp?.phongBan || '',
    soNPT,
    heSoLuong,
    heSoKpi,
    deptKpiRatio,
    luongViTri,
    luongKpi,
    khoanTrachNhiem,
    khoanAnTrua,
    khoanXangXe,
    khoanDienThoai,
    khoanTrangPhuc,
    khoanDocHai,
    tongKhoanChi,
    tongGross,
    // BHXH & Thừa DN:
    luongDongBhxhChuan,
    luongDongBhxhThucTe,
    bhxhDonViDinhMuc,
    bhxhDonVi: bhxhDonViThucTe, // Quỹ thực đóng
    tienThuaBhxhHuong, // NLĐ hưởng số thừa Quỹ trả
    bhxhNld,
    doanPhiNld,
    // Thuế & Net:
    tongMienThue,
    giamTruGiaCanh,
    thuNhapTinhThue,
    thueTncn,
    thucLinhNet,
    tongChiPhiQuy
  };
}

