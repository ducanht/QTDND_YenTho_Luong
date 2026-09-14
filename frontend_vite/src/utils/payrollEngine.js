/**
 * =========================================================================
 * PAYROLL ENGINE V3.0 — FRONTEND (PURE FUNCTIONS, KO HARDCODE THAM SỐ)
 * Dự án: QTDND Yên Thọ — Quản trị Lương 2027 Pro V3
 * Đọc toàn bộ tham số từ `data.salaryParams` (từ CSDL DM_THAM_SO_LUONG)
 * =========================================================================
 */

/**
 * Tham số mặc định fallback khi chưa có dữ liệu CSDL
 */
export const DEFAULT_SALARY_PARAMS = {
  LUONG_CO_SO: 2340000,
  BHXH_NLD: 0.08,
  BHYT_NLD: 0.015,
  BHTN_NLD: 0.01,
  BHXH_DON_VI: 0.175,
  BHYT_DON_VI: 0.03,
  BHTN_DON_VI: 0.01,
  BHXH_TRAN_LAN: 20,           // Trần BHXH = 20 × lương cơ sở
  TNCN_GIAM_TRU_BAN_THAN: 11000000,
  TNCN_GIAM_TRU_NPT: 4400000,
  THAM_NIEN_CT_PHAN_TRAM: 5,   // 5%/năm thâm niên công tác
  THAM_NIEN_CT_TOI_DA: 40,     // Trần 40%
  THAM_NIEN_CV_PHAN_TRAM: 10,  // 10% thâm niên chức vụ/lần
  THAM_NIEN_CV_TOI_DA: 30,
  VUOT_KHUNG_PHAN_TRAM: 5,     // 5%/lần vượt khung
  VUOT_KHUNG_TOI_DA_LAN: 8,
  KY_NANG_BAC: 3,              // 3 năm/bậc
};

/**
 * Biểu thuế TNCN lũy tiến 7 bậc (TT 111/2013)
 * Các ngưỡng có thể override từ CSDL trong tương lai
 */
const PIT_BRACKETS = [
  { limit: 5_000_000,  rate: 0.05, deduct: 0 },
  { limit: 10_000_000, rate: 0.10, deduct: 250_000 },
  { limit: 18_000_000, rate: 0.15, deduct: 750_000 },
  { limit: 32_000_000, rate: 0.20, deduct: 1_650_000 },
  { limit: 52_000_000, rate: 0.25, deduct: 3_250_000 },
  { limit: 80_000_000, rate: 0.30, deduct: 5_850_000 },
  { limit: Infinity,   rate: 0.35, deduct: 9_850_000 },
];

/**
 * Tính thuế TNCN lũy tiến từng phần
 * @param {number} taxableIncome Thu nhập tính thuế (đã trừ giảm trừ)
 * @returns {number} Số tiền thuế TNCN
 */
export function calcProgressivePIT(taxableIncome) {
  if (!taxableIncome || taxableIncome <= 0) return 0;
  for (const b of PIT_BRACKETS) {
    if (taxableIncome <= b.limit) {
      return Math.round(taxableIncome * b.rate - b.deduct);
    }
  }
  return 0;
}

/**
 * Tính số năm thâm niên công tác từ chuỗi ngày dd/MM/yyyy
 * @param {string|Date} dateStr
 * @returns {number}
 */
export function calcYearsService(dateStr) {
  if (!dateStr) return 0;
  try {
    let d;
    if (dateStr instanceof Date) {
      d = dateStr;
    } else {
      const parts = String(dateStr).split('/');
      if (parts.length === 3) {
        d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        d = new Date(dateStr);
      }
    }
    if (isNaN(d.getTime())) return 0;
    const now = new Date();
    return Math.max(0, Math.floor((now - d) / (365.25 * 24 * 3600 * 1000)));
  } catch {
    return 0;
  }
}

/**
 * Lấy hệ số bậc từ position theo scenario
 */
export function getHeSoBac(position, staff, scenario = 'PA2') {
  if (!position) return Number(staff?.heSoLuong) || 2.5;
  const map = { PA1: 'pa1HeSo', PA2: 'pa2HeSo', PA3: 'pa3HeSo' };
  return Number(position[map[scenario] || 'pa2HeSo']) || Number(staff?.heSoLuong) || 2.5;
}

/**
 * Lấy hệ số KPI từ position theo scenario
 */
export function getHeSoKpi(position, scenario = 'PA2') {
  if (!position) return 0.15;
  const map = { PA1: 'pa1Kpi', PA2: 'pa2Kpi', PA3: 'pa3Kpi' };
  return Number(position[map[scenario] || 'pa2Kpi']) || 0.15;
}

/**
 * Tính phụ cấp khoán cho 1 CBNV dựa trên danh mục DM_PHU_CAP
 * @param {Object} staff
 * @param {Object} position
 * @param {Array} allowances - danh sách từ DM_PHU_CAP
 * @returns {{ chiTiet: Object, tongKhoanChi: number, tongMienThue: number }}
 */
export function calcAllowancesForStaff(staff, position, allowances = []) {
  if (!allowances || allowances.length === 0) {
    // Fallback mặc định nếu chưa có cấu hình
    return {
      chiTiet: { anTrua: 1_000_000, xangXe: 400_000, dienThoai: 300_000, trangPhuc: 500_000, khoanKhac: 0 },
      tongKhoanChi: 2_200_000,
      tongMienThue: 730_000 + 500_000 + 400_000 + 300_000,
    };
  }

  const chucDanhStr = String(staff?.chucDanh || position?.tenChucDanh || '');
  const nhomKhoan = detectNhomKhoan(chucDanhStr);
  let tongKhoanChi = 0;
  let tongMienThue = 0;
  const chiTiet = {};

  allowances.forEach(al => {
    if (al.batTat === false || al.batTat === 'false') return; // tắt
    const nhomApDung = al.nhomApDung || 'TAT_CA';
    if (nhomApDung !== 'TAT_CA' && nhomApDung !== nhomKhoan) return;
    const muc = Number(al.mucCoDinh ?? al.mucTieuChuan) || 0;
    const key = String(al.maKhoan || '').toLowerCase().replace(/_/g, '');
    chiTiet[key] = (chiTiet[key] || 0) + muc;
    tongKhoanChi += muc;
    tongMienThue += Math.min(muc, Number(al.mienThueToiDa) || 0);
  });

  return { chiTiet, tongKhoanChi, tongMienThue };
}

/**
 * Xác định nhóm khoán theo chức danh
 */
export function detectNhomKhoan(chucDanhStr) {
  const cd = String(chucDanhStr).toUpperCase();
  if (cd.includes('CHỦ TỊCH') || cd.includes('ỦY VIÊN HĐQT') || cd.includes('UV HĐQT')) return 'HDQT';
  if (cd.includes('GIÁM ĐỐC') || cd.includes('TRƯỞNG') || cd.includes('KẾ TOÁN TRƯỞNG') || cd.includes('TRƯỞNG BKS')) return 'TP_PP';
  return 'CBNV';
}

/**
 * ENGINE CORE: Tính lương đầy đủ 22 bước cho 1 cán bộ
 * @param {Object} opts
 * @param {Object} opts.staff - hồ sơ CBNV từ DM_NS
 * @param {Object} opts.position - chức danh từ DM_CHUCDANH (có thể null)
 * @param {Object} opts.timesheet - chấm công tháng (có thể null → tính đủ công)
 * @param {number} opts.kpiScore - điểm KPI tháng 0-120 (mặc định 100)
 * @param {Array}  opts.allowances - danh mục phụ cấp từ DM_PHU_CAP
 * @param {Object} opts.params - tham số từ DM_THAM_SO_LUONG (merge với DEFAULT_SALARY_PARAMS)
 * @param {string} opts.scenario - 'PA1' | 'PA2' | 'PA3'
 * @returns {Object} Kết quả tính lương đầy đủ
 */
export function calculateStaffPayroll({ staff, position, timesheet, kpiScore = 100, allowances = [], params = {}, scenario = 'PA2', customConfig = {} }) {
  const p = { ...DEFAULT_SALARY_PARAMS, ...params };
  const cfg = customConfig || {};

  const luongCoSo = Number(cfg.luongCoSo || p.LUONG_CO_SO) || 2_340_000;
  const congChuan = Number(timesheet?.congChuan) || 22;
  const congThuc = timesheet && timesheet.congThucTe !== undefined && timesheet.congThucTe !== '' ? Number(timesheet.congThucTe) : congChuan;
  const congPhep = Number(timesheet?.nghiPhep) || 0;
  const tyLeCong = congChuan > 0 ? Math.min((congThuc + congPhep) / congChuan, 1) : 1;
  const tyLeCongThuc = congChuan > 0 ? Math.min(congThuc / congChuan, 1) : 1;

  // ── Bước 1-2: Lương ngạch bậc (5 bậc ngạch) ──
  const bac = Number(cfg.bac || staff?.bac) || 1;
  let heSoBac = 2.5;

  if (cfg.customHeSo !== undefined && cfg.customHeSo !== null) {
    heSoBac = Number(cfg.customHeSo);
  } else if (position) {
    const heSoKey = `heSoBac${bac}`;
    if (position[heSoKey]) {
      heSoBac = Number(position[heSoKey]);
    } else {
      const bacScale = [position.heSoBac1 || position.pa1HeSo, position.heSoBac2 || position.pa2HeSo, position.heSoBac3 || position.pa3HeSo, position.heSoBac4, position.heSoBac5];
      heSoBac = Number(bacScale[bac - 1]) || Number(position.pa2HeSo) || Number(staff?.heSoLuong) || 2.5;
    }
  } else {
    heSoBac = Number(staff?.heSoLuong) || 2.5;
  }

  const luongNgachBac = Math.round(luongCoSo * heSoBac * tyLeCong);

  // ── Bước 3: Thâm niên công tác (tính từ ngày vào làm) ──
  const namThamNienCT = calcYearsService(staff?.ngayVaoLam);
  const tyLeThamNienCT = Math.min(
    (namThamNienCT * (Number(p.THAM_NIEN_CT_PHAN_TRAM) || 5)) / 100,
    (Number(p.THAM_NIEN_CT_TOI_DA) || 40) / 100
  );
  const thamNienCT = Math.round(luongNgachBac * tyLeThamNienCT);

  // ── Bước 3b: Thâm niên chức vụ (tính từ ngày đảm nhiệm + năm quy đổi) ──
  const namDamNhiemThucTe = calcYearsService(staff?.ngayDamNhiemCV);
  const namQuyDoi = Number(staff?.thamNienQuyDoi) || 0;
  const tongNamChucVu = namDamNhiemThucTe + namQuyDoi;
  const tyLeThamNienCV = Math.min(
    (tongNamChucVu * (Number(p.THAM_NIEN_CV_PHAN_TRAM) || 5)) / 100,
    (Number(p.THAM_NIEN_CV_TOI_DA) || 30) / 100
  );
  const thamNienCV = Math.round(luongNgachBac * tyLeThamNienCV);

  // ── Bước 4: Vượt khung chung toàn quỹ (sau 5 bậc ngạch) ──
  const soLanVuotKhung = Math.min(Number(cfg.namVuotKhung !== undefined ? cfg.namVuotKhung : staff?.namVuotKhung) || 0, Number(p.VUOT_KHUNG_TOI_DA_LAN) || 8);
  const pctVkChung = Number(p.VUOT_KHUNG_CHUNG_TOAN_QUY_PCT || p.VUOT_KHUNG_PHAN_TRAM) || 5;
  const vuotKhung = Math.round(luongNgachBac * (soLanVuotKhung * pctVkChung / 100));

  // ── Bước 5: Lương cố định ──
  const luongCoDinh = luongNgachBac + thamNienCT + thamNienCV + vuotKhung;

  // ── Bước 6: Phụ cấp trách nhiệm ──
  const phuCapTN = Number(position?.phuCapTN ?? staff?.phuCapTN) || 0;

  // ── Bước 7: Phụ cấp khoán & Khoán HĐQT ──
  const isHdqt = detectNhomKhoan(staff?.chucDanh || '') === 'HDQT';
  const customAl = cfg.allowances || {};
  let tongKhoanChi = 0;
  let tongMienThue = 0;
  let khoanHdqt = 0;
  const chiTietKhoan = {};

  if (!allowances || allowances.length === 0) {
    const anTrua = customAl.lunch !== undefined ? Number(customAl.lunch) : 1000000;
    const xangXe = customAl.fuel !== undefined ? Number(customAl.fuel) : 400000;
    const dienThoai = customAl.phone !== undefined ? Number(customAl.phone) : 300000;
    const trangPhuc = customAl.clothing !== undefined ? Number(customAl.clothing) : 500000;
    khoanHdqt = isHdqt ? (customAl.hdqt !== undefined ? Number(customAl.hdqt) : 3000000) : 0;
    chiTietKhoan.anTrua = anTrua;
    chiTietKhoan.xangXe = xangXe;
    chiTietKhoan.dienThoai = dienThoai;
    chiTietKhoan.trangPhuc = trangPhuc;
    tongKhoanChi = anTrua + xangXe + dienThoai + trangPhuc;
    tongMienThue = Math.min(anTrua, 730000) + xangXe + dienThoai + Math.min(trangPhuc, 416666);
  } else {
    const nhomKhoan = detectNhomKhoan(staff?.chucDanh || '');
    allowances.forEach(al => {
      if (al.batTat === false || al.batTat === 'false') return;
      const nhomApDung = al.nhomApDung || 'TAT_CA';
      if (nhomApDung !== 'TAT_CA' && nhomApDung !== nhomKhoan) return;
      let muc = Number(al.mucCoDinh ?? al.mucTieuChuan) || 0;
      if (al.maKhoan === 'AN_TRUA' && customAl.lunch !== undefined) muc = Number(customAl.lunch);
      if (al.maKhoan === 'XANG_XE' && customAl.fuel !== undefined) muc = Number(customAl.fuel);
      if (al.maKhoan === 'DIEN_THOAI' && customAl.phone !== undefined) muc = Number(customAl.phone);
      if (al.maKhoan === 'TRANG_PHUC' && customAl.clothing !== undefined) muc = Number(customAl.clothing);
      if (al.maKhoan === 'KHOAN_HDQT' && customAl.hdqt !== undefined) muc = Number(customAl.hdqt);

      const key = String(al.maKhoan || '').toLowerCase().replace(/_/g, '');
      chiTietKhoan[key] = muc;

      if (al.maKhoan === 'KHOAN_HDQT' || nhomApDung === 'HDQT') {
        khoanHdqt += muc;
      } else {
        tongKhoanChi += muc;
      }
      tongMienThue += Math.min(muc, Number(al.mienThueToiDa) || 0);
    });
  }

  // ── Bước 8: Lương hiệu quả KPI ──
  const kpiRatio = Math.min(Math.max(Number(kpiScore) || 100, 0), 150) / 100;
  const deptRatio = Number(cfg.deptKpiRatio) || 40;
  let luongKpi = 0;

  if (cfg.kpiCalcMethod === 'FIXED_PRICE') {
    const donGia = Number(cfg.donGiaKpiCoBan) || 3500000;
    const heSoKpi = Number(position?.pa2Kpi || staff?.heSoKpi) || 1.0;
    luongKpi = Math.round(heSoKpi * donGia * kpiRatio * tyLeCongThuc);
  } else {
    const validRatio = Math.max(0, Math.min(deptRatio, 85));
    const multiplier = (100 - validRatio) > 0 ? (validRatio / (100 - validRatio)) : 0;
    luongKpi = Math.round(luongCoDinh * multiplier * kpiRatio * tyLeCongThuc);
  }

  const tienThuong = Number(cfg.tienThuong) || 0;

  // ── Bước 9: BHXH cá nhân hoá ──
  const tranBHXH = luongCoSo * (Number(p.BHXH_TRAN_LAN) || 20);
  const canCuDongBhxhL1 = Math.min(luongNgachBac + phuCapTN, tranBHXH);
  const customBhxh = cfg.customBhxhSalary !== undefined ? cfg.customBhxhSalary : staff?.mucDongBhxh;
  const mucDongBhxhCaNhan = customBhxh
    ? Math.min(Math.max(Number(customBhxh), luongCoSo), tranBHXH)
    : canCuDongBhxhL1;

  const bhxhNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHXH_NLD) || 0.08));
  const bhytNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHYT_NLD) || 0.015));
  const bhtnNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHTN_NLD) || 0.01));
  const tongKhauTruBH = bhxhNld + bhytNld + bhtnNld;

  // Tiền thừa BHXH (phần Quỹ trả dư được hưởng)
  const bhxhDonViDinhMuc = Math.round(canCuDongBhxhL1 * 0.235);
  const bhxhDonViThucTe = Math.round(mucDongBhxhCaNhan * 0.235);
  const tienThuaBhxh = Math.max(0, bhxhDonViDinhMuc - bhxhDonViThucTe);

  // ── Bước 10: Tổng Gross (bao gồm khoán HĐQT) ──
  const tongGross = luongCoDinh + phuCapTN + tongKhoanChi + khoanHdqt + luongKpi + tienThuong + tienThuaBhxh;

  // ── Bước 11-17: Thuế TNCN ──
  const giamTruBanThan = Number(p.TNCN_GIAM_TRU_BAN_THAN) || 11_000_000;
  const soNPT = Number(staff?.soNPT) || 0;
  const giamTruNPT = soNPT * (Number(p.TNCN_GIAM_TRU_NPT) || 4_400_000);
  const tongGiamTru = giamTruBanThan + giamTruNPT;
  const thuNhapChiuThue = Math.max(0, tongGross - tongMienThue);
  const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - tongGiamTru - tongKhauTruBH);
  const thueTNCN = calcProgressivePIT(thuNhapTinhThue);

  // ── Bước 18: Thực lĩnh Net ──
  const thucLinh = tongGross - tongKhauTruBH - thueTNCN;

  // ── Bước 19-22: Chi phí Quỹ ──
  const bhxhQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHXH_DON_VI) || 0.175));
  const bhytQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHYT_DON_VI) || 0.03));
  const bhtnQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHTN_DON_VI) || 0.01));
  const tongChiPhiQuy = tongGross + bhxhQuy + bhytQuy + bhtnQuy;

  return {
    // Định danh
    maNV: staff?.maNV || '',
    hoTen: staff?.hoTen || '',
    chucDanh: position?.tenChucDanh || staff?.chucDanh || '',
    phongBan: staff?.phongBan || '',
    soNPT,
    bac: staff?.bac || 1,
    maViTri: staff?.maViTri || '',
    scenario,

    // Thông số ngày công
    congChuan, congThuc, congPhep,
    tyLeCong: Math.round(tyLeCong * 100) / 100,
    tyLeCongThuc: Math.round(tyLeCongThuc * 100) / 100,

    // Bước 1-5: Lương cố định
    heSoBac,
    luongNgachBac,
    namThamNienCT,
    tyLeThamNienPct: Math.round(tyLeThamNienCT * 100),
    thamNienCT,
    namDamNhiemThucTe,
    namQuyDoi,
    tongNamChucVu,
    tyLeThamNienCV: Math.round(tyLeThamNienCV * 100),
    thamNienCV,
    soLanVuotKhung,
    pctVuotKhung: Math.round((soLanVuotKhung * pctVkChung)),
    pctVkChung,
    vuotKhung,
    luongCoDinh,

    // Bước 6-8: Phụ cấp và KPI
    phuCapTN,
    khoanHdqt,
    ...chiTietKhoan,
    tongKhoanChi,
    heSoKpi,
    kpiScore: Number(kpiScore) || 100,
    kpiRatio: Math.round(kpiRatio * 100),
    luongKpi,
    tienThuong,

    // BHXH
    canCuDongBhxhL1,
    mucDongBhxhCaNhan,
    bhxhNld, bhytNld, bhtnNld,
    tongKhauTruBH,
    tienThuaBhxh,

    // Gross
    tongGross,

    // Thuế
    tongMienThue,
    thuNhapChiuThue,
    giamTruBanThan, giamTruNPT, tongGiamTru,
    thuNhapTinhThue,
    thueTNCN,

    // Net & Chi phí Quỹ
    thucLinh,
    bhxhQuy, bhytQuy, bhtnQuy,
    tongChiPhiQuy,
  };
}

/**
 * Tính lương toàn bộ danh sách CBNV
 * @param {Array} staffList
 * @param {Array} positions
 * @param {Array} timesheets - kết quả chấm công tháng
 * @param {Array} kpiEvals - đánh giá KPI tháng
 * @param {Array} allowances
 * @param {Object} params
 * @param {string} scenario
 * @returns {Array} mảng kết quả tính lương
 */
export function calculatePayrollList({ staffList, positions, timesheets, kpiEvals, allowances, params, scenario }) {
  const posMap = {};
  (positions || []).forEach(p => { posMap[p.maViTri] = p; });

  const tsMap = {};
  (timesheets || []).forEach(t => { tsMap[t.maNV] = t; });

  const kpiMap = {};
  (kpiEvals || []).forEach(k => { kpiMap[k.maNV] = Number(k.tongDiem ?? k.tyleDat ?? 100); });

  return (staffList || []).map(staff => calculateStaffPayroll({
    staff,
    position: posMap[staff.maViTri] || null,
    timesheet: tsMap[staff.maNV] || null,
    kpiScore: kpiMap[staff.maNV] ?? 100,
    allowances: allowances || [],
    params: params || {},
    scenario: scenario || 'PA2',
  }));
}

/**
 * Tổng hợp kết quả bảng lương (footer summary)
 */
export function summarizePayroll(rows) {
  const sum = (key) => (rows || []).reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
  return {
    tongLuongCoDinh: sum('luongCoDinh'),
    tongPhuCapTN: sum('phuCapTN'),
    tongKhoanChi: sum('tongKhoanChi'),
    tongKpi: sum('luongKpi'),
    tongThuong: sum('tienThuong'),
    tongThuaBhxh: sum('tienThuaBhxh'),
    tongGross: sum('tongGross'),
    tongBhxhNld: sum('bhxhNld'),
    tongBhytNld: sum('bhytNld'),
    tongBhtnNld: sum('bhtnNld'),
    tongKhauTruBH: sum('tongKhauTruBH'),
    tongThueTNCN: sum('thueTNCN'),
    tongThucLinh: sum('thucLinh'),
    tongBhxhQuy: sum('bhxhQuy'),
    tongBhytQuy: sum('bhytQuy'),
    tongBhtnQuy: sum('bhtnQuy'),
    tongChiPhiQuy: sum('tongChiPhiQuy'),
    soLuong: (rows || []).length,
  };
}
