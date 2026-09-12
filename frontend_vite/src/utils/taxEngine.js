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
