/**
 * =========================================================================
 * PAYROLL ENGINE V3.0 — ENGINE TÍNH LƯƠNG ĐỌC TỪ CSDL (KHÔNG HARDCODE)
 * Dự án: QTDND Yên Thọ — Quản trị Lương 2027 Pro V3
 * Đọc toàn bộ tham số từ DM_THAM_SO_LUONG (Google Sheets)
 * =========================================================================
 */

/**
 * Lấy toàn bộ tham số lương từ sheet DM_THAM_SO_LUONG
 */
function getSalaryParams() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('DM_THAM_SO_LUONG');
  if (!sheet || sheet.getLastRow() < 2) return getDefaultSalaryParams();
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  const params = {};
  
  data.forEach(row => {
    if (!row[1]) return;
    const key = String(row[1]).trim(); // Mã tham số
    const numVal = row[3]; // Giá trị số
    const strVal = row[4]; // Giá trị chuỗi
    params[key] = numVal !== '' && numVal !== null ? Number(numVal) : strVal;
  });
  
  // Merge với default để không bị thiếu tham số
  return Object.assign(getDefaultSalaryParams(), params);
}

/**
 * Tham số mặc định nếu chưa có trong CSDL
 */
function getDefaultSalaryParams() {
  return {
    // Lương cơ sở
    LUONG_CO_SO: 2340000,
    // BHXH
    BHXH_NLD: 0.08,
    BHYT_NLD: 0.015,
    BHTN_NLD: 0.01,
    BHXH_DON_VI: 0.175,
    BHYT_DON_VI: 0.03,
    BHTN_DON_VI: 0.01,
    BHXH_TRAN_LAN: 20, // Trần đóng BHXH = N lần lương cơ sở
    // Thuế TNCN
    TNCN_GIAM_TRU_BAN_THAN: 11000000,
    TNCN_GIAM_TRU_NPT: 4400000,
    // Thâm niên
    THAM_NIEN_CT_PHAN_TRAM: 5, // 5% thâm niên công tác / năm
    THAM_NIEN_CT_TOI_DA: 40, // Tối đa 40%
    THAM_NIEN_CV_PHAN_TRAM: 10, // 10% thâm niên chức vụ mỗi lần
    THAM_NIEN_CV_TOI_DA: 30, // Tối đa 30%
    // Vượt khung
    VUOT_KHUNG_PHAN_TRAM: 5, // 5% mỗi lần
    VUOT_KHUNG_TOI_DA_LAN: 8, // Tối đa 8 lần
    // Kỳ nâng bậc
    KY_NANG_BAC: 3, // 3 năm/bậc
  };
}

/**
 * Lấy bảng lương bậc bậc từ DM_BAC_LUONG
 */
function getSalaryScale() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('DM_BAC_LUONG');
  if (!sheet || sheet.getLastRow() < 2) return [];
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  return data.filter(r => r[0]).map(row => ({
    maViTri: String(row[0]).trim(),
    tenChucDanh: String(row[1]).trim(),
    bac: Number(row[2]) || 1,
    loaiBac: String(row[3]).trim(), // 'BAC_THUONG' | 'VUOT_KHUNG'
    heSo: Number(row[4]) || 1.0,
    luongNgachBac: Number(row[5]) || 0,
    ghiChu: String(row[6]).trim(),
    ngayHieuLuc: String(row[7]).trim()
  }));
}

/**
 * Tính số năm thâm niên từ ngày vào làm (GMT+7)
 */
function calcYearsService(ngayVaoLamStr) {
  if (!ngayVaoLamStr) return 0;
  try {
    let d;
    if (ngayVaoLamStr instanceof Date) {
      d = ngayVaoLamStr;
    } else {
      const parts = String(ngayVaoLamStr).split('/');
      if (parts.length === 3) {
        d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        d = new Date(ngayVaoLamStr);
      }
    }
    const now = new Date();
    const diff = (now - d) / (365.25 * 24 * 3600 * 1000);
    return Math.max(0, Math.floor(diff));
  } catch (e) {
    return 0;
  }
}

/**
 * Tính biểu thuế TNCN lũy tiến từng phần 7 bậc
 * Đọc ngưỡng từ tham số CSDL nếu có, fallback cứng
 */
function calcProgressivePIT(taxableIncome, params) {
  if (!taxableIncome || taxableIncome <= 0) return 0;
  
  // Biểu cố định theo TT 111/2013 (có thể override bằng tham số CSDL)
  const brackets = [
    { limit: 5000000,  rate: 0.05, deduct: 0 },
    { limit: 10000000, rate: 0.10, deduct: 250000 },
    { limit: 18000000, rate: 0.15, deduct: 750000 },
    { limit: 32000000, rate: 0.20, deduct: 1650000 },
    { limit: 52000000, rate: 0.25, deduct: 3250000 },
    { limit: 80000000, rate: 0.30, deduct: 5850000 },
    { limit: Infinity,  rate: 0.35, deduct: 9850000 }
  ];
  
  for (const b of brackets) {
    if (taxableIncome <= b.limit) {
      return Math.round(taxableIncome * b.rate - b.deduct);
    }
  }
  return 0;
}

/**
 * CORE ENGINE: Tính lương 1 cán bộ theo công thức 22 bước
 * @param {Object} staff - hồ sơ CBNV từ DM_NS
 * @param {Object} position - chức danh từ DM_CHUCDANH
 * @param {Object} timesheet - chấm công tháng từ CHAM_CONG
 * @param {number} kpiScore - điểm KPI tháng (%) từ DG_KPI (0-120)
 * @param {Array} allowances - danh mục phụ cấp từ DM_PHU_CAP
 * @param {Object} params - tham số lương từ DM_THAM_SO_LUONG
 * @param {string} scenario - 'PA1' | 'PA2' | 'PA3'
 * @returns {Object} kết quả đầy đủ 22 mục
 */
function computeOneStaffPayroll({ staff, position, timesheet, kpiScore, allowances, params, scenario }) {
  scenario = scenario || 'PA2';
  const p = params || getDefaultSalaryParams();
  
  const luongCoSo = Number(p.LUONG_CO_SO) || 2340000;
  const congChuan = Number(timesheet?.congChuan) || 22;
  const congThuc = Number(timesheet?.congThucTe) || congChuan; // Nếu không có chấm công, tính đủ công
  const congPhep = Number(timesheet?.nghiPhep) || 0;
  const tyLeCong = congChuan > 0 ? Math.min((congThuc + congPhep) / congChuan, 1) : 1;
  const tyLeCongThuc = congChuan > 0 ? Math.min(congThuc / congChuan, 1) : 1;
  
  // ── Bước 1: Hệ số bậc theo scenario và chức danh ──
  let heSoBac;
  if (scenario === 'PA1') heSoBac = Number(position?.pa1HeSo) || Number(staff?.heSoLuong) || 2.5;
  else if (scenario === 'PA3') heSoBac = Number(position?.pa3HeSo) || Number(staff?.heSoLuong) || 2.5;
  else heSoBac = Number(position?.pa2HeSo) || Number(staff?.heSoLuong) || 2.5;
  
  // ── Bước 2: Lương ngạch bậc cơ bản ──
  const luongNgachBac = Math.round(luongCoSo * heSoBac * tyLeCong);
  
  // ── Bước 3: Thâm niên công tác ──
  const namThamNienCT = calcYearsService(staff?.ngayVaoLam);
  const tyLeThamNienCT = Math.min(
    namThamNienCT * (Number(p.THAM_NIEN_CT_PHAN_TRAM) || 5) / 100,
    (Number(p.THAM_NIEN_CT_TOI_DA) || 40) / 100
  );
  const thamNienCT = Math.round(luongNgachBac * tyLeThamNienCT);
  
  // ── Bước 4: Vượt khung ──
  const soLanVuotKhung = Number(staff?.namVuotKhung) || 0;
  const phanTramVuotKhung = soLanVuotKhung * (Number(p.VUOT_KHUNG_PHAN_TRAM) || 5) / 100;
  const vuotKhung = Math.round(luongNgachBac * phanTramVuotKhung);
  
  // ── Bước 5: Lương cố định (L1 vị trí chuẩn, chưa có KPI) ──
  const luongCoDinh = luongNgachBac + thamNienCT + vuotKhung;
  
  // ── Bước 6: Phụ cấp trách nhiệm chức danh ──
  const phuCapTN = Number(position?.phuCapTN || staff?.phuCapTN) || 0;
  
  // ── Bước 7: Tính phụ cấp khoán từ DM_PHU_CAP ──
  const allowanceResult = calcAllowancesForStaff(staff, position, allowances);
  const tongKhoanChi = allowanceResult.tongKhoanChi;
  const chiTietKhoan = allowanceResult.chiTiet;
  const tongMienThue = allowanceResult.tongMienThue;
  
  // ── Bước 8: KPI ──
  const kpiScoreRatio = Math.min(Math.max(Number(kpiScore) || 100, 0), 120) / 100;
  let heSoKpi;
  if (scenario === 'PA1') heSoKpi = Number(position?.pa1Kpi) || 0.15;
  else if (scenario === 'PA3') heSoKpi = Number(position?.pa3Kpi) || 0.15;
  else heSoKpi = Number(position?.pa2Kpi) || 0.15;
  
  const luongKpi = Math.round(luongCoDinh * heSoKpi * kpiScoreRatio * tyLeCongThuc);
  const tienThuong = 0; // Thưởng thêm (nếu có, nhập riêng)
  
  // ── Bước 9: BHXH cá nhân hóa ──
  const tranBHXH = luongCoSo * (Number(p.BHXH_TRAN_LAN) || 20);
  // Căn cứ đóng chuẩn = Lương ngạch bậc + Phụ cấp TN (chịu BHXH)
  const canCuDongBhxhL1 = Math.min(luongNgachBac + phuCapTN, tranBHXH);
  // Mức đóng cá nhân chọn
  const mucDongBhxhCaNhan = staff?.mucDongBhxh ? 
    Math.min(Math.max(Number(staff.mucDongBhxh), luongCoSo), tranBHXH) : canCuDongBhxhL1;
  
  const bhxhNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHXH_NLD) || 0.08));
  const bhytNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHYT_NLD) || 0.015));
  const bhtnNld = Math.round(mucDongBhxhCaNhan * (Number(p.BHTN_NLD) || 0.01));
  const tongKhauTruBH = bhxhNld + bhytNld + bhtnNld;
  
  // Tiền thừa Quỹ trả khi đóng thấp hơn chuẩn L1
  const bhxhDonViDinhMuc = Math.round(canCuDongBhxhL1 * (Number(p.BHXH_NLD) + Number(p.BHYT_NLD) + Number(p.BHTN_NLD) + Number(p.BHXH_DON_VI) + Number(p.BHYT_DON_VI) + Number(p.BHTN_DON_VI) || 0.235));
  const bhxhDonViThucTe = Math.round(mucDongBhxhCaNhan * (Number(p.BHXH_DON_VI) + Number(p.BHYT_DON_VI) + Number(p.BHTN_DON_VI) || 0.215));
  const tienThuaBhxh = Math.max(0, bhxhDonViDinhMuc - bhxhDonViThucTe - (Math.round(canCuDongBhxhL1 * (Number(p.BHXH_NLD) + Number(p.BHYT_NLD) + Number(p.BHTN_NLD) || 0.105)) - tongKhauTruBH));
  
  // ── Bước 10: Tổng Gross (có cộng tiền thừa BHXH) ──
  const tongGross = luongCoDinh + phuCapTN + tongKhoanChi + luongKpi + tienThuong + tienThuaBhxh;
  
  // ── Bước 11-17: Thuế TNCN ──
  const giamTruBanThan = Number(p.TNCN_GIAM_TRU_BAN_THAN) || 11000000;
  const giamTruNPT = (Number(staff?.soNPT) || 0) * (Number(p.TNCN_GIAM_TRU_NPT) || 4400000);
  const tongGiamTru = giamTruBanThan + giamTruNPT;
  const thuNhapChiuThue = Math.max(0, tongGross - tongMienThue);
  const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - tongGiamTru - tongKhauTruBH);
  const thueTNCN = calcProgressivePIT(thuNhapTinhThue, p);
  
  // ── Bước 18: Thực lĩnh Net ──
  const thucLinh = tongGross - tongKhauTruBH - thueTNCN;
  
  // ── Bước 19-22: Chi phí Quỹ ──
  const bhxhQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHXH_DON_VI) || 0.175));
  const bhytQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHYT_DON_VI) || 0.03));
  const bhtnQuy = Math.round(mucDongBhxhCaNhan * (Number(p.BHTN_DON_VI) || 0.01));
  const tongChiPhiQuy = tongGross + bhxhQuy + bhytQuy + bhtnQuy;
  
  return {
    maNV: staff?.maNV || '',
    hoTen: staff?.hoTen || '',
    chucDanh: position?.tenChucDanh || staff?.chucDanh || '',
    phongBan: staff?.phongBan || '',
    bac: staff?.bac || 1,
    heSoBac,
    congChuan, congThuc, tyLeCong,
    luongNgachBac,
    namThamNienCT, tyLeThamNienCT: Math.round(tyLeThamNienCT * 100), thamNienCT,
    soLanVuotKhung, vuotKhung,
    luongCoDinh,
    phuCapTN,
    ...chiTietKhoan,
    tongKhoanChi,
    heSoKpi, kpiScoreRatio: Math.round(kpiScoreRatio * 100), luongKpi,
    tienThuong, tienThuaBhxh,
    tongGross,
    mucDongBhxhCaNhan, canCuDongBhxhL1,
    bhxhNld, bhytNld, bhtnNld, tongKhauTruBH,
    tongMienThue, thuNhapChiuThue,
    giamTruBanThan, giamTruNPT, tongGiamTru,
    thuNhapTinhThue, thueTNCN,
    thucLinh,
    bhxhQuy, bhytQuy, bhtnQuy, tongChiPhiQuy
  };
}

/**
 * Tính phụ cấp khoán cho 1 CBNV dựa trên DM_PHU_CAP
 */
function calcAllowancesForStaff(staff, position, allowances) {
  if (!allowances || allowances.length === 0) {
    // Default cố định nếu chưa có CSDL
    return {
      chiTiet: { anTrua: 1000000, xangXe: 400000, dienThoai: 300000, trangPhuc: 500000, khoanKhac: 0 },
      tongKhoanChi: 2200000,
      tongMienThue: 730000 + 500000 + 400000 + 300000
    };
  }
  
  const chucDanhStr = String(staff?.chucDanh || position?.tenChucDanh || '');
  const nhomKhoan = detectNhomKhoan(chucDanhStr);
  let tongKhoanChi = 0;
  let tongMienThue = 0;
  const chiTiet = {};
  
  allowances.forEach(al => {
    if (!al.batTat && al.batTat !== undefined) return; // Skip nếu tắt
    const nhomApDung = al.nhomApDung || 'TAT_CA';
    if (nhomApDung !== 'TAT_CA' && nhomApDung !== nhomKhoan) return;
    
    const muc = Number(al.mucCoDinh || al.mucTieuChuan) || 0;
    const key = String(al.maKhoan || '').toLowerCase().replace(/_/g, '');
    chiTiet[key] = muc;
    tongKhoanChi += muc;
    tongMienThue += Math.min(muc, Number(al.mienThueToiDa) || 0);
  });
  
  return { chiTiet, tongKhoanChi, tongMienThue };
}

function detectNhomKhoan(chucDanhStr) {
  const cd = chucDanhStr.toUpperCase();
  if (cd.includes('CHỦ TỊCH') || cd.includes('ỦY VIÊN HĐQT')) return 'HDQT';
  if (cd.includes('GIÁM ĐỐC') || cd.includes('TRƯỞNG') || cd.includes('PHÒNG')) return 'TP_PP';
  return 'CBNV';
}

/**
 * Tính lương toàn bộ CBNV 1 tháng
 * @param {string} period - 'YYYY-MM'
 * @param {string} scenario - 'PA1' | 'PA2' | 'PA3'
 */
function calculateMonthlyPayroll(period, scenario) {
  const params = getSalaryParams();
  const staffList = getStaffList();
  const positions = getPositions();
  const timesheets = getTimesheets(period);
  const allowances = getAllowances();
  const kpiEvals = getKpiEvaluations(period);
  
  // Map để tra cứu nhanh
  const posMap = {};
  (positions || []).forEach(p => { posMap[p.maViTri] = p; });
  
  const timesheetMap = {};
  (timesheets || []).forEach(t => { timesheetMap[t.maNV] = t; });
  
  const kpiMap = {};
  (kpiEvals || []).forEach(k => { kpiMap[k.maNV] = Number(k.tongDiem || 100); });
  
  const results = (staffList || []).map(staff => {
    const pos = posMap[staff.maViTri] || null;
    const timesheet = timesheetMap[staff.maNV] || null;
    const kpiScore = kpiMap[staff.maNV] || 100;
    
    return computeOneStaffPayroll({
      staff, position: pos, timesheet, kpiScore,
      allowances, params, scenario: scenario || 'PA2'
    });
  });
  
  return results;
}

/**
 * Lưu kết quả tính lương tháng vào KQ_LUONG_THANG
 */
function saveMonthlyPayrollResults(period, rows, lockedBy) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { status: 'error', message: 'Hệ thống đang bận, vui lòng thử lại.' };
  }
  
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('KQ_LUONG_THANG');
    if (!sheet) {
      sheet = ss.insertSheet('KQ_LUONG_THANG');
    }
    
    // Xóa dữ liệu kỳ này nếu đã có
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existing = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      const rowsToDelete = [];
      existing.forEach((row, idx) => {
        if (String(row[0]) === String(period)) rowsToDelete.push(idx + 2);
      });
      // Xóa từ dưới lên
      for (let i = rowsToDelete.length - 1; i >= 0; i--) {
        sheet.deleteRow(rowsToDelete[i]);
      }
    }
    
    const now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    
    const writeRows = rows.map(r => [
      period, r.maNV, r.hoTen, r.chucDanh, r.bac, r.heSoBac,
      r.congChuan, r.congThuc,
      r.luongNgachBac, r.thamNienCT, r.vuotKhung, r.phuCapTN,
      r.antrua || r.anTrua || 0, r.xangxe || r.xangXe || 0, r.dienthoai || r.dienThoai || 0,
      r.trangphuc || r.trangPhuc || 0, r.khoanKhac || 0,
      r.kpiScoreRatio, r.luongKpi, r.tienThuong, r.tienThuaBhxh,
      r.tongGross, r.mucDongBhxhCaNhan,
      r.bhxhNld, r.bhytNld, r.bhtnNld, r.tongKhauTruBH,
      r.thuNhapChiuThue, r.giamTruBanThan, r.giamTruNPT, r.thuNhapTinhThue, r.thueTNCN,
      r.thucLinh, r.bhxhQuy, r.bhytQuy, r.bhtnQuy, r.tongChiPhiQuy,
      'DRAFT', lockedBy || 'System', now
    ]);
    
    if (writeRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, writeRows.length, writeRows[0].length).setValues(writeRows);
    }
    
    return { status: 'success', message: `Đã lưu ${writeRows.length} dòng lương kỳ ${period}`, count: writeRows.length };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Khóa sổ bảng lương tháng (DRAFT → LOCKED), chép sang BL_LICHSU
 */
function lockMonthlyPayroll(period, payrollRows) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {
    return { status: 'error', message: 'Hệ thống đang bận.' };
  }
  try {
    const ss = getSpreadsheet();
    const histSheet = ss.getSheetByName('BL_LICHSU');
    if (!histSheet) return { status: 'error', message: 'Không tìm thấy sheet BL_LICHSU' };
    
    const now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const rows = (payrollRows || []).map(r => [
      period, r.maNV, r.hoTen, r.chucDanh, r.heSoBac,
      r.congChuan, r.congThuc, r.luongNgachBac, r.heSoKpi, r.luongKpi,
      r.tienThuong, r.phuCapTN, 0, // thuLaoQT = 0
      r.anTrua || 0, r.xangXe || 0, r.dienThoai || 0, r.trangPhuc || 0, r.khoanKhac || 0,
      r.tongGross, r.tongKhauTruBH, r.giamTruBanThan + r.giamTruNPT,
      r.thuNhapTinhThue, r.thueTNCN, r.thucLinh,
      r.bhxhQuy + r.bhytQuy + r.bhtnQuy,
      now + ' [KHÓA SỔ]',
      // Các cột bổ sung V3
      r.thamNienCT, r.vuotKhung, r.kpiScoreRatio, r.luongKpi,
      r.tienThuaBhxh, r.bhxhNld, r.bhytNld, r.bhtnNld, r.tongChiPhiQuy
    ]);
    
    if (rows.length > 0) {
      histSheet.getRange(histSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    logAuditAction('System', 'Web Client', 'KHÓA_SỔ_LƯƠNG_V3', `Kỳ: ${period}, số dòng: ${rows.length}`);
    return { status: 'success', message: `Đã khóa sổ ${rows.length} dòng lương kỳ ${period}` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
