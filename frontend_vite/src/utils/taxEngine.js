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

  // 1. Hệ số lương & chức danh (Mặc định lấy PA2 - Chuẩn)
  const heSoLuong = Number(position?.pa2HeSo) || 2.85;
  const heSoKpi = Number(position?.pa2Kpi) || 0.15;
  const phuCapTN = Number(position?.phuCapTN) || 0;
  const thuLaoQT = Number(position?.thuLaoQT) || 0;

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

  // Tổng thu nhập Gross
  const tongGross = luongNgachBac + luongKpi + tienThuong + phuCapTN + thuLaoQT + anTrua + xangXe + dienThoai + trangPhuc + khoanKhac;

  // Tầng 4: BHXH & Thuế TNCN
  const luongDongBhxhMax = luongCoSo * 20; // Trần 20 lần lương cơ sở
  const luongDongBhxh = Math.min(luongNgachBac + phuCapTN, luongDongBhxhMax);

  const bhxhNld = Math.round(luongDongBhxh * 0.105); // 8% BHXH + 1.5% BHYT + 1% BHTN
  const bhxhDonVi = Math.round(luongDongBhxh * 0.215);

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
    thuLaoQT,
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
 * ĐỘNG CƠ MÔ PHỎNG LƯƠNG & CÁC KHOẢN THEO LƯƠNG 4 TẦNG CHI TIẾT (CHUẨN HĐQT)
 */
export function simulateStaffCompensation({
  emp,
  pos,
  scenario = 'PA3',
  luongCoSo = 2340000,
  tranKpi = 115,
  donGiaKpiCoBan = 4000000,
  kpiPerformanceRatio = 1.0,
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
  let thuLaoQtChucDanh = 0;

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
    thuLaoQtChucDanh = Number(pos.thuLaoQT) || 0;
  }

  // Tầng 1: Lương Vị Trí / Chức Danh
  const luongViTri = Math.round(heSoLuong * luongCoSo);

  // Tầng 2: Lương Năng Suất KPI
  const luongKpi = Math.round(heSoKpi * donGiaKpiCoBan * (tranKpi / 100) * kpiPerformanceRatio);

  // Tầng 3: Các khoản phụ cấp khoán chi
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
  const tongPhuCapVaThuLao = khoanTrachNhiem + thuLaoQtChucDanh;

  // Tổng Gross
  const tongGross = luongViTri + luongKpi + tongPhuCapVaThuLao + tongKhoanChi;

  // Tầng 4: Trích nộp BHXH & Thuế TNCN
  // Căn cứ đóng BHXH: Lương vị trí (có trần 20 lần lương cơ sở)
  const luongDongBhxh = Math.min(luongViTri, luongCoSo * 20);

  // NLĐ Đóng: 8% BHXH + 1.5% BHYT + 1% BHTN = 10.5%
  const bhxhNld = Math.round(luongDongBhxh * 0.105);
  // Đoàn phí công đoàn: 1% lương đóng BHXH (tối đa 10% mức lương cơ sở = 234.000đ)
  const doanPhiNld = Math.min(Math.round(luongDongBhxh * 0.01), Math.round(luongCoSo * 0.1));

  // Quỹ Đóng: 17.5% BHXH + 3% BHYT + 1% BHTN + 2% KPCĐ = 23.5%
  const bhxhDonVi = Math.round(luongDongBhxh * 0.235);

  // Khoản miễn thuế TNCN hợp lệ:
  const mienThueAnTrua = Math.min(khoanAnTrua, 730000);
  const mienThueTrangPhuc = Math.min(khoanTrangPhuc, 416666);
  const mienThueCongVu = khoanXangXe + khoanDienThoai;
  const tongMienThue = mienThueAnTrua + mienThueTrangPhuc + mienThueCongVu;

  const thuNhapChiuThue = Math.max(0, tongGross - tongMienThue);

  // Giảm trừ gia cảnh
  const mucBanThan = pitRegime === 'DRAFT' ? 15000000 : 11000000;
  const mucPhuThuoc = pitRegime === 'DRAFT' ? 6200000 : 4400000;
  const soNPT = Number(emp?.soNguoiPhuThuoc || emp?.soNPT) || 0;
  const giamTruGiaCanh = mucBanThan + soNPT * mucPhuThuoc;

  // Thu nhập tính thuế
  const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - giamTruGiaCanh - bhxhNld);
  const thueTncn = Math.round(calculateProgressiveTax(thuNhapTinhThue));

  // Thực Lĩnh (Net)
  const thucLinhNet = tongGross - bhxhNld - doanPhiNld - thueTncn;

  // Tổng Chi Phí Quỹ gánh chịu (Gross + BHXH Quỹ 23.5%)
  const tongChiPhiQuy = tongGross + bhxhDonVi;

  return {
    maNV: emp?.maNV || '',
    hoTen: emp?.hoTen || '',
    chucDanh: emp?.chucDanh || '',
    phongBan: emp?.phongBan || '',
    soNPT,
    heSoLuong,
    heSoKpi,
    luongViTri,
    luongKpi,
    khoanTrachNhiem,
    thuLaoQtChucDanh,
    khoanAnTrua,
    khoanXangXe,
    khoanDienThoai,
    khoanTrangPhuc,
    khoanDocHai,
    tongKhoanChi,
    tongGross,
    luongDongBhxh,
    bhxhNld,
    doanPhiNld,
    bhxhDonVi,
    tongMienThue,
    giamTruGiaCanh,
    thuNhapTinhThue,
    thueTncn,
    thucLinhNet,
    tongChiPhiQuy
  };
}

