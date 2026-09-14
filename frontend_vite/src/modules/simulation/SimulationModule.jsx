import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShieldAlert, 
  Save, 
  FileText, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  ArrowRight,
  Info,
  Eye,
  X,
  Filter,
  CreditCard,
  Percent,
  RotateCcw,
  Check,
  Download,
  Image,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  Briefcase
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/currency';
import { calculateProgressiveTax, calcYearsService } from '../../utils/taxEngine';
import { api } from '../../services/api';

/**
 * Định nghĩa vai trò / nhóm vị trí chuẩn để quản lý Lương KPI chuyên biệt
 */
const ROLE_DEFINITIONS = [
  { key: 'CHU_TICH', label: 'Chủ tịch HĐQT', defaultAmount: 6500000, defaultRatio: 40, dept: 'LANH_DAO' },
  { key: 'UV_HDQT', label: 'Ủy viên HĐQT', defaultAmount: 3500000, defaultRatio: 30, dept: 'LANH_DAO' },
  { key: 'GIAM_DOC', label: 'Giám đốc Điều hành', defaultAmount: 6500000, defaultRatio: 40, dept: 'LANH_DAO' },
  { key: 'TRUONG_BKS', label: 'Trưởng Ban Kiểm soát', defaultAmount: 5000000, defaultRatio: 35, dept: 'LANH_DAO' },
  { key: 'KIEM_SOAT_VIEN', label: 'KST - Kiểm toán nội bộ', defaultAmount: 4200000, defaultRatio: 35, dept: 'KE_TOAN' },
  { key: 'KE_TOAN_TRUONG', label: 'Kế toán trưởng', defaultAmount: 5500000, defaultRatio: 35, dept: 'KE_TOAN' },
  { key: 'THAM_DINH', label: 'Thẩm định tài sản', defaultAmount: 5200000, defaultRatio: 45, dept: 'TIN_DUNG' },
  { key: 'TIN_DUNG', label: 'Cán bộ tín dụng', defaultAmount: 5500000, defaultRatio: 50, dept: 'TIN_DUNG' },
  { key: 'KE_TOAN_VIEN', label: 'Kế toán viên', defaultAmount: 3800000, defaultRatio: 30, dept: 'KE_TOAN' },
  { key: 'THU_QUY', label: 'Thủ quỹ', defaultAmount: 3200000, defaultRatio: 25, dept: 'KE_TOAN' },
  { key: 'HO_TRO', label: 'Văn phòng / Hỗ trợ', defaultAmount: 2800000, defaultRatio: 20, dept: 'HO_TRO' },
];

/**
 * Nhận diện vai trò từ chức danh của CBNV
 */
const detectRoleKey = (chucDanhStr) => {
  const cd = (chucDanhStr || '').toUpperCase();
  if (cd.includes('CHỦ TỊCH')) return 'CHU_TICH';
  if (cd.includes('ỦY VIÊN HĐQT') || cd.includes('UV HĐQT')) return 'UV_HDQT';
  if (cd.includes('GIÁM ĐỐC')) return 'GIAM_DOC';
  if (cd.includes('TRƯỞNG BAN KIỂM SOÁT') || cd.includes('TRƯỞNG BKS')) return 'TRUONG_BKS';
  if (cd.includes('KST') || cd.includes('KIỂM TOÁN') || cd.includes('KIỂM SOÁT VIÊN')) return 'KIEM_SOAT_VIEN';
  if (cd.includes('KẾ TOÁN TRƯỞNG')) return 'KE_TOAN_TRUONG';
  if (cd.includes('THẨM ĐỊNH')) return 'THAM_DINH';
  if (cd.includes('TÍN DỤNG')) return 'TIN_DUNG';
  if (cd.includes('KẾ TOÁN VIÊN') || (cd.includes('KẾ TOÁN') && !cd.includes('TRƯỞNG'))) return 'KE_TOAN_VIEN';
  if (cd.includes('THỦ QUỸ')) return 'THU_QUY';
  return 'HO_TRO';
};

export function SimulationModule({
  data,
  activeSubTab: externalSubTab = 'scenarios',
  onSaveSalaryParams,
  onSaveSalaryScale,
  onSaveAllowances,
  onRefresh
}) {
  const staffList = data?.staffList || [];
  const positions = data?.positions || [];

  // ── 1. THAM SỐ LƯƠNG CƠ SỞ & CHUNG ──
  const [luongCoSo, setLuongCoSo] = useState(2340000);
  const [tyLeThamNienCT, setTyLeThamNienCT] = useState(5); // % / năm
  const [tranThamNienCT, setTranThamNienCT] = useState(40); // % tối đa
  const [tyLeThamNienCV, setTyLeThamNienCV] = useState(5); // % / năm
  const [tranThamNienCV, setTranThamNienCV] = useState(30); // % tối đa
  const [tyLeVuotKhung, setTyLeVuotKhung] = useState(5); // % mỗi 3 năm sau bậc 5 (chung toàn Quỹ)
  const [pitRegime, setPitRegime] = useState('CURRENT'); // 'CURRENT' (11tr/4.4tr) | 'DRAFT' (15tr/6.2tr)

  // ── 2. CẤU HÌNH LƯƠNG KPI THEO TỪNG VỊ TRÍ / BỘ PHẬN ──
  // Hỗ trợ 2 cơ chế: 'AMOUNT' (Mức tiền ₫/tháng trực tiếp) hoặc 'RATIO' (% kết cấu lương L1)
  const [kpiCalculationMode, setKpiCalculationMode] = useState('AMOUNT'); // 'AMOUNT' | 'RATIO'
  const [globalKpiPerformance, setGlobalKpiPerformance] = useState(100); // % Hoàn thành KPI tháng chung (0 - 150%)

  const [roleKpiConfig, setRoleKpiConfig] = useState(() => {
    const init = {};
    ROLE_DEFINITIONS.forEach(r => {
      init[r.key] = { amount: r.defaultAmount, ratio: r.defaultRatio };
    });
    return init;
  });

  const handleUpdateRoleKpi = (roleKey, field, val) => {
    setRoleKpiConfig(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [field]: Number(val) || 0
      }
    }));
  };

  // ── 3. ĐỊNH MỨC TRỢ CẤP KHOÁN CÔNG VỤ ──
  const [anTrua, setAnTrua] = useState(850000);
  const [xangXe, setXangXe] = useState(500000);
  const [dienThoai, setDienThoai] = useState(400000);
  const [trangPhuc, setTrangPhuc] = useState(416666);
  const [docHai, setDocHai] = useState(400000);
  const [khoanHdqtDinhMuc, setKhoanHdqtDinhMuc] = useState(3000000);

  // ── 4. CẤU HÌNH MỨC ĐÓNG BHXH THỎA THUẬN TỪNG CBNV ──
  // { [maNV]: customAmount }
  const [staffBhxhCustom, setStaffBhxhCustom] = useState({});
  const [bulkBhxhMode, setBulkBhxhMode] = useState('PROFILE'); // 'PROFILE' | 'MIN_ZONE' | 'STANDARD'
  const [isSavingBhxh, setIsSavingBhxh] = useState(false);
  const [bhxhSaveMsg, setBhxhSaveMsg] = useState('');

  // ── 5. BẬC LƯƠNG OVERRIDE INLINE CỦA TỪNG CBNV ──
  // { [maNV]: bacNumber (1-5) }
  const [staffBacOverrides, setStaffBacOverrides] = useState({});

  // ── 6. ĐIỀU HƯỚNG GIAO DIỆN & TRẠNG THÁI ──
  const [controlPanelTab, setControlPanelTab] = useState('kpi'); // 'base' | 'kpi' | 'bhxh' | 'allowance'
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [displayMode, setDisplayMode] = useState('SUMMARY'); // 'SUMMARY' | 'DETAILED'
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [inspectingStaff, setInspectingStaff] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSavingParams, setIsSavingParams] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Cập nhật mức BHXH riêng cho 1 người
  const handleUpdateStaffBhxh = (maNV, amount) => {
    setStaffBhxhCustom(prev => ({
      ...prev,
      [maNV]: Number(amount) || 0
    }));
  };

  // Áp dụng đồng loạt mức BHXH
  const handleApplyBulkBhxh = (mode) => {
    setBulkBhxhMode(mode);
    if (mode === 'PROFILE') {
      setStaffBhxhCustom({});
    } else if (mode === 'MIN_ZONE') {
      const updated = {};
      staffList.forEach(s => { updated[s.maNV] = 5000000; });
      setStaffBhxhCustom(updated);
    } else if (mode === 'STANDARD') {
      const updated = {};
      staffList.forEach(s => { updated[s.maNV] = -1; }); // -1 đánh dấu theo chuẩn L1
      setStaffBhxhCustom(updated);
    }
  };

  // Lưu cấu hình BHXH vào CSDL
  const handleSaveBatchBhxhToStaff = async () => {
    if (!simulationResults || simulationResults.length === 0) return;
    const confirmSave = window.confirm(
      `XÁC NHẬN LƯU MỨC ĐÓNG BHXH CÁ NHÂN?\n\nBạn có chắc chắn muốn lưu mức đóng BHXH thỏa thuận của 12 cán bộ trong bảng mô phỏng vào CSDL Hồ sơ nhân sự (DM_NS) không?`
    );
    if (!confirmSave) return;

    setIsSavingBhxh(true);
    setBhxhSaveMsg('');
    try {
      const bhxhList = simulationResults.map(r => ({
        maNV: r.maNV,
        mucDongBhxh: r.moPhong.luongDongBhxhThucTe
      }));
      const res = await api.saveBatchBhxh(bhxhList);
      if (res && res.status === 'success') {
        setBhxhSaveMsg(`✅ ${res.message || 'Đã lưu thành công mức đóng BHXH cho 12 CBNV vào CSDL!'}`);
        if (onRefresh) onRefresh();
      } else {
        setBhxhSaveMsg(`❌ Lỗi khi lưu: ${res?.message || 'Không xác định'}`);
      }
    } catch (err) {
      setBhxhSaveMsg(`❌ Lỗi kết nối: ${err.message}`);
    } finally {
      setIsSavingBhxh(false);
      setTimeout(() => setBhxhSaveMsg(''), 6000);
    }
  };

  // Khôi phục toàn bộ tham số về mặc định
  const handleResetDefaults = () => {
    if (!window.confirm('Khôi phục toàn bộ thông số mô phỏng về mặc định ban đầu?')) return;
    setLuongCoSo(2340000);
    setTyLeThamNienCT(5);
    setTranThamNienCT(40);
    setTyLeThamNienCV(5);
    setTranThamNienCV(30);
    setTyLeVuotKhung(5);
    setGlobalKpiPerformance(100);
    setKpiCalculationMode('AMOUNT');
    const resetKpi = {};
    ROLE_DEFINITIONS.forEach(r => {
      resetKpi[r.key] = { amount: r.defaultAmount, ratio: r.defaultRatio };
    });
    setRoleKpiConfig(resetKpi);
    setAnTrua(850000);
    setXangXe(500000);
    setDienThoai(400000);
    setTrangPhuc(416666);
    setDocHai(400000);
    setKhoanHdqtDinhMuc(3000000);
    setStaffBhxhCustom({});
    setStaffBacOverrides({});
    setBulkBhxhMode('PROFILE');
  };

  // ── ĐỘNG CƠ MÔ PHỎNG ĐỘNG 12 CBNV (REACTIVE LIVE ENGINE) ──
  const simulationResults = useMemo(() => {
    if (!staffList || staffList.length === 0) return [];

    return staffList.map(emp => {
      const pos = positions.find(p => p.tenChucDanh === emp.chucDanh || p.maViTri === emp.chucDanh);
      const chucDanhStr = String(emp.chucDanh || pos?.tenChucDanh || '');
      const roleKey = detectRoleKey(chucDanhStr);
      const roleConfig = roleKpiConfig[roleKey] || { amount: 4000000, ratio: 35 };

      // Bậc ngạch & Hệ số
      const bac = staffBacOverrides[emp.maNV] ?? (Number(emp.bac) || 1);
      let heSoLuong = Number(emp.heSoLuong) || 2.5;
      if (pos) {
        const heSoKey = `heSoBac${bac}`;
        if (pos[heSoKey] !== undefined) {
          heSoLuong = Number(pos[heSoKey]);
        } else {
          const bacScale = [pos.heSoBac1 || pos.pa1HeSo, pos.heSoBac2 || pos.pa2HeSo, pos.heSoBac3 || pos.pa3HeSo, pos.heSoBac4, pos.heSoBac5];
          heSoLuong = Number(bacScale[bac - 1]) || Number(pos.pa2HeSo) || heSoLuong;
        }
      }

      // ── TẦNG 1: LƯƠNG VỊ TRÍ (L1) ──
      const luongNgachBac = Math.round(heSoLuong * luongCoSo);
      const namThamNienCT = calcYearsService(emp.ngayVaoLam);
      const tyLeCT = Math.min((namThamNienCT * tyLeThamNienCT) / 100, tranThamNienCT / 100);
      const thamNienCT = Math.round(luongNgachBac * tyLeCT);

      const namDamNhiemThucTe = calcYearsService(emp.ngayDamNhiemCV || emp.ngayVaoLam);
      const namQuyDoi = Number(emp.thamNienQuyDoi) || 0;
      const tongNamChucVu = namDamNhiemThucTe + namQuyDoi;
      const tyLeCV = Math.min((tongNamChucVu * tyLeThamNienCV) / 100, tranThamNienCV / 100);
      const thamNienCV = Math.round(luongNgachBac * tyLeCV);

      const soLanVuotKhung = Math.min(Number(emp.namVuotKhung) || 0, 8);
      const vuotKhung = Math.round(luongNgachBac * (soLanVuotKhung * (tyLeVuotKhung / 100)));
      const luongViTri = luongNgachBac + thamNienCT + thamNienCV + vuotKhung;

      // ── TẦNG 2: LƯƠNG NĂNG SUẤT KPI (L2) THEO VỊ TRÍ / BỘ PHẬN ──
      let luongKpi = 0;
      const kpiPerf = globalKpiPerformance / 100;
      if (kpiCalculationMode === 'AMOUNT') {
        luongKpi = Math.round(roleConfig.amount * kpiPerf);
      } else {
        const ratio = Math.max(5, Math.min(roleConfig.ratio, 80));
        const multiplier = (100 - ratio) > 0 ? (ratio / (100 - ratio)) : 0;
        luongKpi = Math.round(luongViTri * multiplier * kpiPerf);
      }

      // ── TẦNG 3: PHỤ CẤP & KHOÁN CÔNG VỤ ──
      let khoanXangXe = xangXe;
      if (chucDanhStr.includes('Tín dụng')) khoanXangXe = Math.round(xangXe * 1.5);
      else if (chucDanhStr.includes('Giám đốc') || chucDanhStr.includes('Chủ tịch')) khoanXangXe = Math.round(xangXe * 1.2);

      let khoanDienThoai = dienThoai;
      if (['Giám đốc', 'Chủ tịch', 'Kế toán trưởng', 'Tín dụng'].some(t => chucDanhStr.includes(t))) {
        khoanDienThoai = Math.round(dienThoai * 1.2);
      }

      const phuCapTN = Number(pos?.phuCapTN || emp?.phuCapTN) || 0;
      const khoanDocHai = chucDanhStr.includes('Thủ quỹ') ? docHai : 0;
      const khoanAnTrua = anTrua;
      const khoanTrangPhuc = trangPhuc;

      const isHdqt = chucDanhStr.toUpperCase().includes('CHỦ TỊCH') || chucDanhStr.toUpperCase().includes('ỦY VIÊN HĐQT') || pos?.nhomKhoan === 'HDQT';
      const khoanHdqt = isHdqt ? (Number(emp.khoanHdqt) || khoanHdqtDinhMuc) : 0;
      const tongKhoanChi = khoanAnTrua + khoanXangXe + khoanDienThoai + khoanTrangPhuc + khoanDocHai;

      // ── TẦNG 4: BHXH THỎA THUẬN & TIỀN THỪA QUỸ TRẢ ──
      const maxLuongDongBhxh = luongCoSo * 20;
      const minLuongDongBhxh = 2340000;
      const luongDongBhxhChuan = Math.min(luongNgachBac + phuCapTN, maxLuongDongBhxh);
      const bhxhDonViDinhMuc = Math.round(luongDongBhxhChuan * 0.235); // 23.5% định mức Quỹ chi trả

      let luongDongBhxhThucTe = luongDongBhxhChuan;
      const empCustom = staffBhxhCustom[emp.maNV];
      const empGoc = Number(emp.mucDongBhxh) || 0;

      if (empCustom !== undefined) {
        if (empCustom === -1) luongDongBhxhThucTe = luongDongBhxhChuan;
        else if (empCustom > 0) luongDongBhxhThucTe = Math.min(Math.max(empCustom, minLuongDongBhxh), maxLuongDongBhxh);
      } else if (bulkBhxhMode === 'MIN_ZONE') {
        luongDongBhxhThucTe = 5000000;
      } else if (bulkBhxhMode === 'STANDARD') {
        luongDongBhxhThucTe = luongDongBhxhChuan;
      } else {
        // 'PROFILE'
        luongDongBhxhThucTe = empGoc > 0 ? Math.min(Math.max(empGoc, minLuongDongBhxh), maxLuongDongBhxh) : luongDongBhxhChuan;
      }

      const bhxhDonViThucTe = Math.round(luongDongBhxhThucTe * 0.235);
      // Phần thừa Quỹ chi ít hơn định mức được cộng trực tiếp vào thu nhập của NLĐ
      const tienThuaBhxhHuong = Math.max(0, bhxhDonViDinhMuc - bhxhDonViThucTe);

      const bhxhNld = Math.round(luongDongBhxhThucTe * 0.105);
      const doanPhiNld = Math.min(Math.round(luongDongBhxhThucTe * 0.01), Math.round(luongCoSo * 0.1));

      // ── TỔNG THU NHẬP GROSS ──
      const tongGross = luongViTri + luongKpi + phuCapTN + tongKhoanChi + khoanHdqt + tienThuaBhxhHuong;

      // ── THUẾ TNCN LŨY TIẾN ──
      const mienThueAnTrua = Math.min(khoanAnTrua, 730000);
      const mienThueTrangPhuc = Math.min(khoanTrangPhuc, 416666);
      const mienThueCongVu = khoanXangXe + khoanDienThoai;
      const tongMienThue = mienThueAnTrua + mienThueTrangPhuc + mienThueCongVu;
      const thuNhapChiuThue = Math.max(0, tongGross - tongMienThue);

      const mucBanThan = pitRegime === 'DRAFT' ? 15000000 : 11000000;
      const mucPhuThuoc = pitRegime === 'DRAFT' ? 6200000 : 4400000;
      const soNPT = Number(emp.soNguoiPhuThuoc || emp.soNPT) || 0;
      const giamTruGiaCanh = mucBanThan + soNPT * mucPhuThuoc;
      const thuNhapTinhThue = Math.max(0, thuNhapChiuThue - giamTruGiaCanh - bhxhNld);
      const thueTncn = Math.round(calculateProgressiveTax(thuNhapTinhThue));

      // ── THỰC LĨNH NET ──
      const thucLinhNet = tongGross - bhxhNld - doanPhiNld - thueTncn;

      // ── TỔNG CHI PHÍ QUỸ GÁNH CHỊU ──
      const tongChiPhiQuy = tongGross + bhxhDonViThucTe;

      // Tính tham chiếu Lương Hiện Tại cũ (để thấy độ tăng trưởng)
      const luongCuCoSo = 2340000;
      const heSoCu = Number(pos?.pa1HeSo) || heSoLuong;
      const grossCu = Math.round(heSoCu * luongCuCoSo) + Math.round(heSoCu * luongCuCoSo * 0.15) + phuCapTN + 1500000;
      const chenhLechGross = tongGross - grossCu;

      return {
        maNV: emp.maNV,
        hoTen: emp.hoTen,
        chucDanh: emp.chucDanh,
        phongBan: emp.phongBan || 'Nghiệp vụ',
        roleKey,
        roleLabel: roleConfig.label || chucDanhStr,
        soNPT,
        moPhong: {
          bac,
          heSoLuong,
          luongNgachBac,
          namThamNienCT,
          thamNienCT,
          tongNamChucVu,
          thamNienCV,
          soLanVuotKhung,
          vuotKhung,
          luongViTri,
          luongKpi,
          phuCapTN,
          khoanAnTrua,
          khoanXangXe,
          khoanDienThoai,
          khoanTrangPhuc,
          khoanDocHai,
          khoanHdqt,
          tongKhoanChi,
          // BHXH & Thừa
          luongDongBhxhChuan,
          luongDongBhxhThucTe,
          bhxhDonViDinhMuc,
          bhxhDonVi: bhxhDonViThucTe,
          tienThuaBhxhHuong,
          bhxhNld,
          doanPhiNld,
          // Thuế & Net
          tongMienThue,
          giamTruGiaCanh,
          thuNhapTinhThue,
          thueTncn,
          tongGross,
          thucLinhNet,
          tongChiPhiQuy
        },
        grossCu,
        chenhLechGross
      };
    });
  }, [
    staffList,
    positions,
    luongCoSo,
    tyLeThamNienCT,
    tranThamNienCT,
    tyLeThamNienCV,
    tranThamNienCV,
    tyLeVuotKhung,
    pitRegime,
    kpiCalculationMode,
    globalKpiPerformance,
    roleKpiConfig,
    anTrua,
    xangXe,
    dienThoai,
    trangPhuc,
    docHai,
    khoanHdqtDinhMuc,
    staffBhxhCustom,
    bulkBhxhMode,
    staffBacOverrides
  ]);

  // Lọc theo phòng ban
  const filteredResults = useMemo(() => {
    if (departmentFilter === 'ALL') return simulationResults;
    return simulationResults.filter(r => {
      const cd = (r.chucDanh || '').toUpperCase();
      if (departmentFilter === 'LANH_DAO') return cd.includes('CHỦ TỊCH') || cd.includes('GIÁM ĐỐC') || cd.includes('KIỂM SOÁT') || cd.includes('HĐQT');
      if (departmentFilter === 'TIN_DUNG') return cd.includes('TÍN DỤNG') || cd.includes('THẨM ĐỊNH');
      if (departmentFilter === 'KE_TOAN') return cd.includes('KẾ TOÁN') || cd.includes('THỦ QUỸ') || cd.includes('KST');
      if (departmentFilter === 'HO_TRO') return cd.includes('VĂN PHÒNG') || cd.includes('BẢO VỆ');
      return true;
    });
  }, [simulationResults, departmentFilter]);

  // Tổng hợp chỉ số tài chính vĩ mô
  const macroMetrics = useMemo(() => {
    const count = simulationResults.length;
    const tongGrossThang = simulationResults.reduce((s, r) => s + r.moPhong.tongGross, 0);
    const tongNetThang = simulationResults.reduce((s, r) => s + r.moPhong.thucLinhNet, 0);
    const tongTienThuaBhxh = simulationResults.reduce((s, r) => s + r.moPhong.tienThuaBhxhHuong, 0);
    const tongBhxhDonVi = simulationResults.reduce((s, r) => s + r.moPhong.bhxhDonVi, 0);
    const tongChiPhiThang = simulationResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0);
    const tongThueTncn = simulationResults.reduce((s, r) => s + r.moPhong.thueTncn, 0);
    const tongGrossCu = simulationResults.reduce((s, r) => s + r.grossCu, 0);
    const chenhLechGross = tongGrossThang - tongGrossCu;

    const thuNhapBqGross = count > 0 ? tongGrossThang / count : 0;
    const thuNhapBqNet = count > 0 ? tongNetThang / count : 0;

    const grossList = simulationResults.map(r => r.moPhong.tongGross);
    const maxGross = Math.max(...grossList, 0);
    const minGross = Math.min(...grossList.filter(g => g > 0), 1);
    const heSoKhoangCach = minGross > 0 ? (maxGross / minGross).toFixed(2) : '1.00';

    return {
      count,
      tongGrossThang,
      tongGrossNam: tongGrossThang * 12,
      tongNetThang,
      tongNetNam: tongNetThang * 12,
      tongTienThuaBhxh,
      tongBhxhDonVi,
      tongChiPhiThang,
      tongChiPhiNam: tongChiPhiThang * 12,
      tongThueTncn,
      chenhLechGross,
      thuNhapBqGross,
      thuNhapBqNet,
      heSoKhoangCach
    };
  }, [simulationResults]);

  // ── XUẤT EXCEL (.XLS) ──
  const exportToExcel = () => {
    const dateStr = new Date().toLocaleDateString('vi-VN');
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'Times New Roman', serif; font-size: 11pt; }
          th, td { border: 1px solid #999; padding: 6px; }
          .header-title { font-size: 14pt; font-weight: bold; text-align: center; color: #17365d; }
          .sub-title { font-size: 11pt; text-align: center; font-style: italic; color: #444; }
          .th-main { background-color: #17365d; color: #ffffff; font-weight: bold; text-align: center; }
          .num { text-align: right; mso-number-format: "#,##0"; }
          .text-center { text-align: center; }
          .total-row { background-color: #e6edf5; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="19" class="header-title">QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ</td></tr>
          <tr><td colspan="19" class="sub-title">Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá</td></tr>
          <tr><td colspan="19" style="height: 8px;"></td></tr>
          <tr><td colspan="19" class="header-title">BẢNG MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027</td></tr>
          <tr><td colspan="19" class="sub-title">Lương cơ sở: <b>${formatCurrency(luongCoSo)}</b> | Hiệu suất KPI: <b>${globalKpiPerformance}%</b> | Ngày xuất: ${dateStr}</td></tr>
          <tr><td colspan="19" style="height: 12px;"></td></tr>
          <thead>
            <tr>
              <th class="th-main">STT</th>
              <th class="th-main">Mã NV</th>
              <th class="th-main">Họ và tên</th>
              <th class="th-main">Chức danh</th>
              <th class="th-main">Bậc</th>
              <th class="th-main">Hệ số</th>
              <th class="th-main">Lương Vị trí (L1)</th>
              <th class="th-main">Lương KPI (L2)</th>
              <th class="th-main">Phụ cấp TN</th>
              <th class="th-main">Khoán công tác</th>
              <th class="th-main">Khoán HĐQT</th>
              <th class="th-main">Mức đóng BHXH</th>
              <th class="th-main">Tiền thừa BHXH</th>
              <th class="th-main">Tổng Gross</th>
              <th class="th-main">BHXH NLĐ (10.5%)</th>
              <th class="th-main">Thuế TNCN</th>
              <th class="th-main">Thực Lĩnh Net</th>
              <th class="th-main">BHXH Quỹ (23.5%)</th>
              <th class="th-main">Tổng Chi Phí Quỹ</th>
            </tr>
          </thead>
          <tbody>
    `;

    simulationResults.forEach((r, idx) => {
      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${r.maNV}</td>
          <td><b>${r.hoTen}</b></td>
          <td>${r.chucDanh}</td>
          <td class="text-center">${r.moPhong.bac}</td>
          <td class="num">${r.moPhong.heSoLuong.toFixed(2)}</td>
          <td class="num">${r.moPhong.luongViTri}</td>
          <td class="num">${r.moPhong.luongKpi}</td>
          <td class="num">${r.moPhong.phuCapTN}</td>
          <td class="num">${r.moPhong.tongKhoanChi}</td>
          <td class="num">${r.moPhong.khoanHdqt}</td>
          <td class="num">${r.moPhong.luongDongBhxhThucTe}</td>
          <td class="num" style="color: #047857;"><b>${r.moPhong.tienThuaBhxhHuong}</b></td>
          <td class="num"><b>${r.moPhong.tongGross}</b></td>
          <td class="num">${r.moPhong.bhxhNld}</td>
          <td class="num">${r.moPhong.thueTncn}</td>
          <td class="num" style="color: #047857;"><b>${r.moPhong.thucLinhNet}</b></td>
          <td class="num">${r.moPhong.bhxhDonVi}</td>
          <td class="num"><b>${r.moPhong.tongChiPhiQuy}</b></td>
        </tr>
      `;
    });

    html += `
        <tr class="total-row">
          <td colspan="6" class="text-center"><b>TỔNG CỘNG TOÀN QUỸ (${simulationResults.length} CBNV)</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0)}</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0)}</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.phuCapTN, 0)}</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.tongKhoanChi, 0)}</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.khoanHdqt, 0)}</b></td>
          <td class="num">-</td>
          <td class="num"><b>${macroMetrics.tongTienThuaBhxh}</b></td>
          <td class="num"><b>${macroMetrics.tongGrossThang}</b></td>
          <td class="num"><b>${simulationResults.reduce((s, r) => s + r.moPhong.bhxhNld, 0)}</b></td>
          <td class="num"><b>${macroMetrics.tongThueTncn}</b></td>
          <td class="num"><b>${macroMetrics.tongNetThang}</b></td>
          <td class="num"><b>${macroMetrics.tongBhxhDonVi}</b></td>
          <td class="num"><b>${macroMetrics.tongChiPhiThang}</b></td>
        </tr>
        <tr><td colspan="19" style="height: 25px;"></td></tr>
        <tr>
          <td colspan="6" class="text-center"><b>NGƯỜI LẬP BIỂU</b><br><br><br><br><i>(Ký, ghi rõ họ tên)</i></td>
          <td colspan="6" class="text-center"><b>KẾ TOÁN TRƯỞNG</b><br><br><br><br><i>(Ký, ghi rõ họ tên)</i></td>
          <td colspan="7" class="text-center"><b>CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ</b><br><br><br><br><i>(Ký tên, đóng dấu)</i></td>
        </tr>
      </tbody>
    </table>
    </body>
    </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Mo_Phong_Luong_QTD_YenTho_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── XUẤT ẢNH PNG (2X HIGH-DPI CANVAS) ──
  const exportToImage = () => {
    const canvas = document.createElement('canvas');
    const scale = 2;
    const width = 1920;
    const height = 1100;

    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Header Navy Banner
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 130);

    ctx.fillStyle = '#9acd32';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText('🏛️ QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ • XÃ QUÝ LỘC, TỈNH THANH HOÁ', 40, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText('BẢNG MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027', 40, 68);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Lương cơ sở: ${formatCurrency(luongCoSo)}  |  KPI Hiệu suất: ${globalKpiPerformance}%  |  Tổng Quỹ: ${formatCurrency(macroMetrics.tongChiPhiNam)}/năm  |  Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 40, 100);

    // 4 Macro Cards
    const cardWidth = (width - 80 - 3 * 20) / 4;
    const cardY = 150;
    const cardH = 85;
    const cards = [
      { title: 'TỔNG QUỸ LƯƠNG GROSS', val: formatCurrency(macroMetrics.tongGrossThang), sub: `${formatCurrency(macroMetrics.tongGrossNam)}/năm`, color: '#1e3a8a' },
      { title: 'THỰC LĨNH NET (CHUYỂN KHOẢN)', val: formatCurrency(macroMetrics.tongNetThang), sub: `Bình quân: ${formatCurrency(macroMetrics.thuNhapBqNet)}/người`, color: '#047857' },
      { title: 'TIỀN THỪA BHXH HOÀN TRẢ', val: `+${formatCurrency(macroMetrics.tongTienThuaBhxh)}`, sub: 'Hưởng thêm từ thỏa thuận đóng', color: '#b45309' },
      { title: 'TỔNG CHI PHÍ QUỸ (GỒM BHXH)', val: formatCurrency(macroMetrics.tongChiPhiThang), sub: `Tổng năm: ${formatCurrency(macroMetrics.tongChiPhiNam)}`, color: '#6d28d9' },
    ];

    cards.forEach((c, idx) => {
      const cx = 40 + idx * (cardWidth + 20);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cardY, cardWidth, cardH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
      ctx.fillText(c.title, cx + 16, cardY + 24);

      ctx.fillStyle = c.color;
      ctx.font = 'bold 17px "Be Vietnam Pro", sans-serif';
      ctx.fillText(c.val, cx + 16, cardY + 50);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Be Vietnam Pro", sans-serif';
      ctx.fillText(c.sub, cx + 16, cardY + 72);
    });

    // Data Table
    const tblY = 255;
    const colDefs = [
      { label: 'STT', w: 45, align: 'center' },
      { label: 'Họ và tên', w: 210, align: 'left' },
      { label: 'Chức danh', w: 180, align: 'left' },
      { label: 'Bậc', w: 55, align: 'center' },
      { label: 'Hệ số', w: 65, align: 'right' },
      { label: 'Lương Vị trí (L1)', w: 145, align: 'right' },
      { label: 'Lương KPI (L2)', w: 145, align: 'right' },
      { label: 'Khoán & PC', w: 130, align: 'right' },
      { label: 'Lương Đóng BH', w: 140, align: 'right' },
      { label: 'Tiền thừa BH', w: 130, align: 'right' },
      { label: 'Tổng Gross', w: 160, align: 'right' },
      { label: 'Thực Lĩnh Net', w: 165, align: 'right' },
      { label: 'Chi Phí Quỹ', w: 170, align: 'right' },
      { label: 'So Cũ', w: 100, align: 'right' }
    ];

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, tblY, width - 80, 36);

    let curX = 40;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
    colDefs.forEach(c => {
      if (c.align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(c.label, curX + c.w / 2, tblY + 22);
      } else if (c.align === 'right') {
        ctx.textAlign = 'right';
        ctx.fillText(c.label, curX + c.w - 10, tblY + 22);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(c.label, curX + 10, tblY + 22);
      }
      curX += c.w;
    });

    let rowY = tblY + 36;
    simulationResults.forEach((r, idx) => {
      ctx.fillStyle = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(40, rowY, width - 80, 34);
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(40, rowY + 34);
      ctx.lineTo(width - 40, rowY + 34);
      ctx.stroke();

      const cells = [
        String(idx + 1),
        r.hoTen,
        r.chucDanh,
        `Bậc ${r.moPhong.bac}`,
        r.moPhong.heSoLuong.toFixed(2),
        formatCurrency(r.moPhong.luongViTri),
        formatCurrency(r.moPhong.luongKpi),
        formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanHdqt + r.moPhong.phuCapTN),
        formatCurrency(r.moPhong.luongDongBhxhThucTe),
        r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '0',
        formatCurrency(r.moPhong.tongGross),
        formatCurrency(r.moPhong.thucLinhNet),
        formatCurrency(r.moPhong.tongChiPhiQuy),
        (r.chenhLechGross >= 0 ? '+' : '') + formatCurrency(r.chenhLechGross)
      ];

      curX = 40;
      cells.forEach((val, cIdx) => {
        if (cIdx === 1) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 9) {
          ctx.fillStyle = '#047857';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 10) {
          ctx.fillStyle = '#b45309';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 11) {
          ctx.fillStyle = '#047857';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else {
          ctx.fillStyle = '#334155';
          ctx.font = '11px "Be Vietnam Pro", sans-serif';
        }

        const c = colDefs[cIdx];
        if (c.align === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(val, curX + c.w / 2, rowY + 21);
        } else if (c.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(val, curX + c.w - 10, rowY + 21);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(val, curX + 10, rowY + 21);
        }
        curX += c.w;
      });
      rowY += 34;
    });

    // Dòng Tổng Cộng
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, rowY, width - 80, 36);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TỔNG CỘNG TOÀN QUỸ (12 CBNV)', 40 + 250, rowY + 23);

    ctx.textAlign = 'right';
    ctx.fillText(formatCurrency(macroMetrics.tongGrossThang), 40 + 1205, rowY + 23);
    ctx.fillStyle = '#047857';
    ctx.fillText(formatCurrency(macroMetrics.tongNetThang), 40 + 1370, rowY + 23);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(formatCurrency(macroMetrics.tongChiPhiThang), 40 + 1540, rowY + 23);

    // Chân trang
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Be Vietnam Pro", sans-serif';
    ctx.fillText('HỆ THỐNG QUẢN TRỊ LƯƠNG 2027 PRO V3 • QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ • BẢO MẬT NỘI BỘ', width / 2, height - 20);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bang_Mo_Phong_Luong_QTD_YenTho_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER: HIỆN ĐẠI, THÔNG THOÁNG, KHÔNG RƯỜM RÀ ── */}
      <div className="bg-gradient-to-r from-brand-navy via-[#1b3d68] to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-lime/20 text-brand-lime border border-brand-lime/30 flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 mr-1" />
                <span>MÔ PHỎNG ĐỘNG 2027</span>
              </span>
              <span className="text-xs text-slate-300">| QTDND Yên Thọ</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-300">
                ⚡ Tự động tính toán theo thông số nhập
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Bảng Mô Phỏng Chi Trả Lương & Chi Phí Quỹ
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Thay đổi linh hoạt Lương cơ sở, Hệ số bậc ngạch, Mức lương KPI theo chức vụ, Trợ cấp khoán và Mức đóng BHXH thỏa thuận.
              Số liệu tự động cập nhật ngay lập tức.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Nút Khôi phục mặc định */}
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all border border-white/10"
              title="Khôi phục lại toàn bộ thông số chuẩn ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Khôi Phục Mặc Định</span>
            </button>

            {/* Nút Xuất Excel */}
            <button
              onClick={exportToExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md border border-emerald-400/30"
              title="Xuất bảng mô phỏng 12 CBNV ra tệp Excel (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất Excel</span>
            </button>

            {/* Nút Xuất Ảnh PNG */}
            <button
              onClick={exportToImage}
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md border border-sky-400/30"
              title="Xuất ảnh chất lượng cao 2x gửi Zalo/Telegram cho HĐQT"
            >
              <Image className="w-4 h-4 text-sky-200" />
              <span>Xuất Ảnh</span>
            </button>

            {/* Nút In Báo Cáo / PDF */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-lime hover:bg-lime-400 text-brand-navy font-black text-xs flex items-center space-x-1.5 transition-all shadow-md border border-lime-300"
              title="In báo cáo hoặc lưu PDF khổ A4 Ngang chuẩn Quỹ"
            >
              <Printer className="w-4 h-4 text-brand-navy" />
              <span>In / PDF A4</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 THẺ CHỈ SỐ VĨ MÔ THOÁNG ĐÃNG ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Thẻ 1: Tổng Quỹ Lương Gross */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Quỹ Gross / Tháng</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 font-numeric">
            {formatCurrency(macroMetrics.tongGrossThang)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Năm: <b className="font-numeric">{formatCurrency(macroMetrics.tongGrossNam)}</b></span>
            {macroMetrics.chenhLechGross >= 0 ? (
              <span className="text-emerald-700 font-bold">+{formatCurrency(macroMetrics.chenhLechGross)}</span>
            ) : (
              <span className="text-rose-600 font-bold">{formatCurrency(macroMetrics.chenhLechGross)}</span>
            )}
          </div>
        </div>

        {/* Thẻ 2: Tổng Thực Lĩnh Net */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Thực Lĩnh Net (Về TK)</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800"><CreditCard className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-2 font-numeric">
            {formatCurrency(macroMetrics.tongNetThang)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng năm: <b className="text-emerald-900 font-numeric">{formatCurrency(macroMetrics.tongNetNam)}</b>
          </div>
        </div>

        {/* Thẻ 3: Tiền Thừa BHXH Hoàn Trả Cho NLĐ */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-b from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tiền Thừa BHXH Quỹ Trả</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800"><ShieldAlert className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-extrabold text-amber-800 mt-2 font-numeric">
            {macroMetrics.tongTienThuaBhxh > 0 ? `+${formatCurrency(macroMetrics.tongTienThuaBhxh)}` : '0 ₫'}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Hưởng thêm từ thỏa thuận đóng thấp hơn L1
          </div>
        </div>

        {/* Thẻ 4: Tổng Chi Phí Quỹ Gánh Chịu */}
        <div className="bg-white p-4.5 rounded-2xl border border-indigo-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-b from-white to-indigo-50/20">
          <div className="flex items-center justify-between text-indigo-900">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Chi Phí Quỹ / Tháng</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800"><Building2 className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-extrabold text-indigo-950 mt-2 font-numeric">
            {formatCurrency(macroMetrics.tongChiPhiThang)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gồm Gross + BHXH Quỹ (23.5%)
          </div>
        </div>

        {/* Thẻ 5: Thu Nhập Net Bình Quân */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Thu Nhập Net BQ / Người</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700"><Users className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-extrabold text-purple-900 mt-2 font-numeric">
            {formatCurrency(macroMetrics.thuNhapBqNet)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Khoảng cách Max/Min: <b className="text-purple-800 font-numeric">{macroMetrics.heSoKhoangCach} lần</b>
          </div>
        </div>
      </div>

      {/* ── BỘ THÔNG SỐ ĐIỀU CHỈNH MÔ PHỎNG (COLLAPSIBLE & THÔNG THOÁNG) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        {/* Thanh Tiêu Đề Panel Điều Khiển */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-navy text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Bảng Điều Khiển Thông Số Mô Phỏng
              </h2>
              <p className="text-[11px] text-slate-500">
                Nhập số trực tiếp bằng tay. Toàn bộ kết quả bảng tính phía dưới sẽ tự động tính toán lại tức thì.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Tabs chọn nhóm thông số */}
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs">
              {[
                { id: 'kpi', label: '🎯 Lương KPI Từng Bộ Phận', icon: Award },
                { id: 'base', label: '💰 Lương Cơ Sở & Trợ Cấp', icon: DollarSign },
                { id: 'bhxh', label: '🛡️ BHXH Thỏa Thuận & Bậc', icon: ShieldAlert },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setControlPanelTab(tab.id); if (!isPanelExpanded) setIsPanelExpanded(true); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                    controlPanelTab === tab.id
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Nút Thu Gọn / Mở Rộng */}
            <button
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              title={isPanelExpanded ? 'Thu gọn bảng tham số' : 'Mở rộng bảng tham số'}
            >
              {isPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nội dung tab mở rộng */}
        {isPanelExpanded && (
          <div className="p-6">
            {/* ── TAB 1: LƯƠNG KPI THEO TỪNG VỊ TRÍ / BỘ PHẬN (TRỌNG TÂM YÊU CẦU) ── */}
            {controlPanelTab === 'kpi' && (
              <div className="space-y-5">
                {/* Header thanh công cụ KPI */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-amber-950 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-amber-700" />
                      <span>Cấu Hình Mức Lương KPI Chuyên Biệt Theo Từng Vị Trí (HĐQT, Giám Đốc, Kế Toán Trưởng...)</span>
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Cho phép thay đổi mức tiền lương KPI (₫/tháng) hoặc % kết cấu lương độc lập cho từng vị trí chức danh của Quỹ.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    {/* Chế độ tính */}
                    <div className="inline-flex rounded-xl bg-white p-1 border border-amber-300 font-bold shadow-2xs">
                      <button
                        onClick={() => setKpiCalculationMode('AMOUNT')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          kpiCalculationMode === 'AMOUNT' ? 'bg-amber-600 text-white' : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        Nhập Tiền ₫ / Tháng
                      </button>
                      <button
                        onClick={() => setKpiCalculationMode('RATIO')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          kpiCalculationMode === 'RATIO' ? 'bg-amber-600 text-white' : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        % Kết Cấu Lương L1
                      </button>
                    </div>

                    {/* Hiệu suất hoàn thành KPI chung */}
                    <div className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-xl border border-amber-300">
                      <span className="text-[11px] font-bold text-slate-600">Hiệu suất KPI Quỹ:</span>
                      <input
                        type="number"
                        min="50"
                        max="150"
                        step="5"
                        value={globalKpiPerformance}
                        onChange={e => setGlobalKpiPerformance(Number(e.target.value) || 100)}
                        className="w-14 text-right font-numeric font-bold text-amber-900 border-b border-amber-400 focus:outline-none text-xs"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                {/* Grid 11 Vị Trí Chức Danh */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {ROLE_DEFINITIONS.map(r => {
                    const currentCfg = roleKpiConfig[r.key] || { amount: r.defaultAmount, ratio: r.defaultRatio };
                    const isLeader = r.dept === 'LANH_DAO';
                    const isCredit = r.dept === 'TIN_DUNG';

                    return (
                      <div
                        key={r.key}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isLeader
                            ? 'bg-blue-50/40 border-blue-200'
                            : isCredit
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-slate-900 truncate" title={r.label}>
                            {r.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isLeader ? 'bg-blue-100 text-blue-800' : isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {r.dept === 'LANH_DAO' ? 'HĐQT & BĐH' : r.dept === 'TIN_DUNG' ? 'Tín Dụng' : 'Kế Toán / Quỹ'}
                          </span>
                        </div>

                        {kpiCalculationMode === 'AMOUNT' ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 block">
                              Mức Lương KPI Định Mức (₫/tháng):
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                step="200000"
                                min="1000000"
                                max="15000000"
                                value={currentCfg.amount}
                                onChange={e => handleUpdateRoleKpi(r.key, 'amount', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-numeric font-bold text-slate-900 bg-white focus:ring-1 focus:ring-brand-navy focus:outline-none text-right"
                              />
                              <span className="text-[11px] font-bold text-slate-400">₫</span>
                            </div>
                            <div className="text-[10px] text-slate-500 text-right font-numeric">
                              Thực nhận (ở {globalKpiPerformance}%): <b className="text-emerald-800">{formatCurrency(Math.round(currentCfg.amount * (globalKpiPerformance / 100)))}</b>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 block">
                              Tỷ Lệ Lương KPI (% Trong Thu Nhập L1):
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                step="1"
                                min="5"
                                max="80"
                                value={currentCfg.ratio}
                                onChange={e => handleUpdateRoleKpi(r.key, 'ratio', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-numeric font-bold text-slate-900 bg-white focus:ring-1 focus:ring-brand-navy focus:outline-none text-right"
                              />
                              <span className="text-[11px] font-bold text-slate-400">%</span>
                            </div>
                            <div className="text-[10px] text-slate-500 text-right">
                              Tỷ lệ KPI: <b>{currentCfg.ratio}%</b> ({100 - currentCfg.ratio}% Lương Vị Trí)
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 2: LƯƠNG CƠ SỞ, THÂM NIÊN, VƯỢT KHUNG & TRỢ CẤP KHOÁN ── */}
            {controlPanelTab === 'base' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cột 1: Lương Cơ Sở, Thâm Niên & Vượt Khung */}
                <div className="p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                    <DollarSign className="w-4 h-4 text-brand-navy" />
                    <span>Lương Cơ Sở, Thâm Niên & Vượt Khung Toàn Quỹ</span>
                  </h3>

                  {/* Lương cơ sở */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Mức Lương Cơ Sở Nội Bộ:</span>
                      <span className="font-numeric font-extrabold text-brand-navy bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {formatCurrency(luongCoSo)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="10000"
                        min="1500000"
                        max="5000000"
                        value={luongCoSo}
                        onChange={e => setLuongCoSo(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-numeric font-extrabold text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        placeholder="Nhập mức lương cơ sở..."
                      />
                    </div>
                    {/* Gợi ý nhanh */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: '2.340.000 ₫ (Hiện hành)', val: 2340000 },
                        { label: '2.500.000 ₫ (Đề xuất)', val: 2500000 },
                        { label: '2.800.000 ₫', val: 2800000 },
                        { label: '3.000.000 ₫', val: 3000000 },
                      ].map(p => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setLuongCoSo(p.val)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            luongCoSo === p.val
                              ? 'bg-brand-navy text-white border-brand-navy font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thâm niên công tác & Vượt khung */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Thâm niên CT (%/năm):</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="10"
                        value={tyLeThamNienCT}
                        onChange={e => setTyLeThamNienCT(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Tối đa: {tranThamNienCT}%</span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vượt khung sau bậc 5:</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="10"
                        value={tyLeVuotKhung}
                        onChange={e => setTyLeVuotKhung(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">+5% / 3 năm giữ bậc 5</span>
                    </div>
                  </div>

                  {/* Giảm trừ gia cảnh */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="font-bold text-xs text-slate-700 block">Chính Sách Giảm Trừ Thuế TNCN:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPitRegime('CURRENT')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          pitRegime === 'CURRENT'
                            ? 'bg-brand-navy text-white border-brand-navy font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">Hiện Hành</div>
                        <div className="text-[10px] opacity-80">11tr bản thân / 4.4tr NPT</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPitRegime('DRAFT')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          pitRegime === 'DRAFT'
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">Dự Thảo Mới</div>
                        <div className="text-[10px] opacity-80">15tr bản thân / 6.2tr NPT</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Các Khoản Phụ Cấp Khoán Công Vụ & Khoán HĐQT */}
                <div className="p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                    <Briefcase className="w-4 h-4 text-brand-navy" />
                    <span>Định Mức Trợ Cấp Khoán Công Vụ & Khoán HĐQT</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Ăn trưa */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Ăn trưa giữa ca (₫):</label>
                      <input
                        type="number"
                        step="50000"
                        value={anTrua}
                        onChange={e => setAnTrua(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">Miễn thuế max 730k</span>
                    </div>

                    {/* Xăng xe */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Xăng xe cơ bản (₫):</label>
                      <input
                        type="number"
                        step="50000"
                        value={xangXe}
                        onChange={e => setXangXe(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">Tín dụng nhân 1.5</span>
                    </div>

                    {/* Điện thoại */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Điện thoại cơ bản (₫):</label>
                      <input
                        type="number"
                        step="50000"
                        value={dienThoai}
                        onChange={e => setDienThoai(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">Lãnh đạo nhân 1.2</span>
                    </div>

                    {/* Trang phục */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Trang phục / tháng (₫):</label>
                      <input
                        type="number"
                        step="50000"
                        value={trangPhuc}
                        onChange={e => setTrangPhuc(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">5.000.000 ₫ / năm</span>
                    </div>

                    {/* Độc hại */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Độc hại thủ quỹ (₫):</label>
                      <input
                        type="number"
                        step="50000"
                        value={docHai}
                        onChange={e => setDocHai(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">Thủ quỹ tiền mặt</span>
                    </div>

                    {/* Khoán HĐQT */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Khoán HĐQT định mức (₫):</label>
                      <input
                        type="number"
                        step="500000"
                        value={khoanHdqtDinhMuc}
                        onChange={e => setKhoanHdqtDinhMuc(Number(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-slate-300 font-numeric font-bold bg-white text-slate-900 text-right"
                      />
                      <span className="text-[10px] text-slate-500">Tính vào chi phí Quỹ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: BHXH THỎA THUẬN & TIỀN THỪA HOÀN TRẢ ── */}
            {controlPanelTab === 'bhxh' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-700" />
                      <span>Cơ Chế Đóng BHXH Thỏa Thuận & Phần Thừa Tính Vào Thu Nhập (Gross)</span>
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      Mức chuẩn quy định (L1) = Lương ngạch bậc + Phụ cấp TN. Khi NLĐ đăng ký mức thỏa thuận (vd: 5Tr, 6Tr),
                      toàn bộ chênh lệch bảo hiểm 23.5% của Quỹ được hoàn trả cộng trực tiếp vào thu nhập của người lao động!
                    </p>
                  </div>

                  {/* Nút thiết lập nhanh */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleApplyBulkBhxh('PROFILE')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        bulkBhxhMode === 'PROFILE' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      Theo Hồ Sơ Gốc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBulkBhxh('MIN_ZONE')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        bulkBhxhMode === 'MIN_ZONE' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      Đồng Loạt Sàn 5Tr
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBulkBhxh('STANDARD')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        bulkBhxhMode === 'STANDARD' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      Chuẩn L1 (100%)
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveBatchBhxhToStaff}
                      disabled={isSavingBhxh}
                      className="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl font-bold flex items-center space-x-1 shadow-sm transition-all disabled:opacity-50 ml-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingBhxh ? 'Đang lưu...' : 'Lưu Vào CSDL'}</span>
                    </button>
                  </div>
                </div>

                {bhxhSaveMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl font-bold text-xs border border-emerald-300 flex items-center justify-between">
                    <span>{bhxhSaveMsg}</span>
                    <button onClick={() => setBhxhSaveMsg('')}><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BẢNG MÔ PHỎNG CHI TRẢ LƯƠNG 12 CBNV (LIVE TABLE) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Thanh Bộ Lọc & Chế Độ Xem Bảng */}
        <div className="p-4.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
          {/* Bộ lọc phòng ban */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500 mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Lọc:
            </span>
            {[
              { id: 'ALL', label: `Tất cả (${macroMetrics.count})` },
              { id: 'LANH_DAO', label: 'Lãnh Đạo & HĐQT' },
              { id: 'TIN_DUNG', label: 'Tín Dụng & Thẩm Định' },
              { id: 'KE_TOAN', label: 'Kế Toán & Ngân Quỹ' },
              { id: 'HO_TRO', label: 'Hỗ Trợ' },
            ].map(flt => (
              <button
                key={flt.id}
                onClick={() => setDepartmentFilter(flt.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  departmentFilter === flt.id
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {flt.label}
              </button>
            ))}
          </div>

          {/* Chế độ xem */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 text-xs">
            <button
              onClick={() => setDisplayMode('SUMMARY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                displayMode === 'SUMMARY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng Hợp Đối Soát
            </button>
            <button
              onClick={() => setDisplayMode('DETAILED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                displayMode === 'DETAILED'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chi Tiết 4 Tầng Lương
            </button>
          </div>
        </div>

        {/* ── BẢNG 1: TỔNG HỢP ĐỐI SOÁT ── */}
        {displayMode === 'SUMMARY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3 min-w-[140px]">Họ Và Tên</th>
                  <th className="p-3 min-w-[130px]">Chức Vụ</th>
                  <th className="p-3 text-center w-24">Bậc Ngạch</th>
                  <th className="p-3 text-right bg-blue-50/70 text-blue-950 font-extrabold">Lương Vị Trí (L1)</th>
                  <th className="p-3 text-right bg-amber-50/70 text-amber-950 font-extrabold">Lương KPI (L2)</th>
                  <th className="p-3 text-right">Khoán & PC (L3)</th>
                  <th className="p-3 text-right bg-emerald-100/80 text-emerald-950 font-extrabold min-w-[150px]">
                    BHXH Thỏa Thuận
                  </th>
                  <th className="p-3 text-right bg-emerald-50 text-emerald-800 font-extrabold">
                    Tiền Thừa BHXH
                  </th>
                  <th className="p-3 text-right font-extrabold bg-amber-100/60 text-amber-950">
                    Tổng Gross
                  </th>
                  <th className="p-3 text-right font-extrabold bg-emerald-100 text-emerald-950">
                    Thực Lĩnh Net
                  </th>
                  <th className="p-3 text-right font-extrabold text-indigo-950 bg-indigo-50/50">
                    Chi Phí Quỹ
                  </th>
                  <th className="p-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r, idx) => (
                  <tr key={r.maNV} className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="p-3 text-center text-slate-400 font-numeric">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{r.hoTen}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.maNV}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-700">{r.chucDanh}</span>
                    </td>
                    {/* Bậc lương có thể chọn trực tiếp */}
                    <td className="p-3 text-center">
                      <select
                        value={r.moPhong.bac}
                        onChange={e => setStaffBacOverrides(prev => ({ ...prev, [r.maNV]: Number(e.target.value) }))}
                        className="px-2 py-1 rounded-lg border border-slate-300 font-numeric font-bold text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-navy"
                      >
                        {[1, 2, 3, 4, 5].map(b => (
                          <option key={b} value={b}>Bậc {b}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right font-numeric font-bold text-blue-900 bg-blue-50/30">
                      {formatCurrency(r.moPhong.luongViTri)}
                    </td>
                    <td className="p-3 text-right font-numeric font-bold text-amber-900 bg-amber-50/30">
                      {formatCurrency(r.moPhong.luongKpi)}
                    </td>
                    <td className="p-3 text-right font-numeric text-slate-700">
                      {formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanHdqt + r.moPhong.phuCapTN)}
                    </td>

                    {/* Mức đóng BHXH thỏa thuận (cho phép sửa trực tiếp vd: 5tr, 6tr...) */}
                    <td className="p-3 text-right bg-emerald-50/50">
                      <div className="flex items-center space-x-1 justify-end">
                        <input
                          type="number"
                          step="500000"
                          min="2340000"
                          max="46800000"
                          value={r.moPhong.luongDongBhxhThucTe || ''}
                          onChange={e => handleUpdateStaffBhxh(r.maNV, e.target.value)}
                          className="w-24 px-2 py-1 text-right text-xs font-numeric font-extrabold border border-emerald-300 rounded-lg bg-white text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                          placeholder="5.000.000"
                          title="Sửa mức đóng BHXH theo yêu cầu của cán bộ này"
                        />
                        <span className="text-[10px] text-emerald-700 font-bold">₫</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-numeric">
                        Chuẩn L1: {formatCurrency(r.moPhong.luongDongBhxhChuan)}
                      </div>
                    </td>

                    {/* Tiền thừa BHXH */}
                    <td className="p-3 text-right font-numeric font-bold text-emerald-700 bg-emerald-50/30">
                      {r.moPhong.tienThuaBhxhHuong > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          +{formatCurrency(r.moPhong.tienThuaBhxhHuong)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-numeric font-extrabold text-amber-950 bg-amber-50/50">
                      {formatCurrency(r.moPhong.tongGross)}
                    </td>

                    <td className="p-3 text-right font-numeric font-extrabold text-emerald-900 bg-emerald-100/60">
                      {formatCurrency(r.moPhong.thucLinhNet)}
                    </td>

                    <td className="p-3 text-right font-numeric font-bold text-indigo-950 bg-indigo-50/30">
                      {formatCurrency(r.moPhong.tongChiPhiQuy)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setInspectingStaff(r)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-600 transition-colors"
                        title="Xem chi tiết phiếu lương mô phỏng"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Dòng Tổng Toàn Cơ Quan */}
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs">
                  <td colSpan={4} className="p-3 text-right uppercase text-slate-800">
                    TỔNG CỘNG ({filteredResults.length} CBNV):
                  </td>
                  <td className="p-3 text-right font-numeric text-blue-950 font-extrabold">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-amber-950 font-extrabold">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-slate-800">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tongKhoanChi + r.moPhong.khoanHdqt + r.moPhong.phuCapTN, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-slate-500">-</td>
                  <td className="p-3 text-right font-numeric text-emerald-900 font-extrabold">
                    +{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tienThuaBhxhHuong, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-amber-950 font-black bg-amber-100/70">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tongGross, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-emerald-950 font-black bg-emerald-200/80">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.thucLinhNet, 0))}
                  </td>
                  <td className="p-3 text-right font-numeric text-indigo-950 font-black bg-indigo-100/70">
                    {formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ── BẢNG 2: CHI TIẾT 4 TẦNG LƯƠNG ── */}
        {displayMode === 'DETAILED' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-brand-navy text-white font-bold border-b border-slate-700 text-center">
                  <th colSpan={3} className="p-2.5 border-r border-slate-600">HỒ SƠ CBNV</th>
                  <th colSpan={3} className="p-2.5 border-r border-slate-600 bg-blue-900">TẦNG 1 & 2 (LƯƠNG & KPI)</th>
                  <th colSpan={5} className="p-2.5 border-r border-slate-600 bg-slate-800">TẦNG 3 (KHOÁN & PHỤ CẤP)</th>
                  <th colSpan={5} className="p-2.5 border-r border-slate-600 bg-emerald-900">TẦNG 4 (BHXH & THỪA)</th>
                  <th colSpan={3} className="p-2.5 bg-slate-900">KẾT QUẢ CUỐI CÙNG</th>
                </tr>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                  <th className="p-2 border-r text-center w-8">STT</th>
                  <th className="p-2 border-r min-w-[120px]">Họ Tên</th>
                  <th className="p-2 border-r">Chức Danh</th>
                  {/* Tầng 1 & 2 */}
                  <th className="p-2 text-right border-r bg-blue-50/50">Lương Vị Trí (L1)</th>
                  <th className="p-2 text-right border-r bg-blue-50/50">Lương KPI (L2)</th>
                  <th className="p-2 text-right border-r bg-blue-50/50">Phụ Cấp TN</th>
                  {/* Tầng 3 */}
                  <th className="p-2 text-right border-r">Ăn Trưa</th>
                  <th className="p-2 text-right border-r">Xăng Xe</th>
                  <th className="p-2 text-right border-r">Điện Thoại</th>
                  <th className="p-2 text-right border-r">Trang Phục</th>
                  <th className="p-2 text-right border-r">Khoán HĐQT</th>
                  {/* Tầng 4 */}
                  <th className="p-2 text-right border-r bg-emerald-50 text-emerald-950 font-bold min-w-[140px]">Đóng BHXH (Chỉnh)</th>
                  <th className="p-2 text-right border-r bg-emerald-100 text-emerald-950 font-bold">Thừa Quỹ Trả</th>
                  <th className="p-2 text-right border-r text-rose-700">BHXH NLĐ (10.5%)</th>
                  <th className="p-2 text-right border-r text-rose-700">Thuế TNCN</th>
                  <th className="p-2 text-right border-r font-extrabold bg-amber-50">Tổng Gross</th>
                  {/* Kết quả */}
                  <th className="p-2 text-right border-r font-black text-emerald-900 bg-emerald-100">Thực Lĩnh Net</th>
                  <th className="p-2 text-right border-r text-slate-700">BHXH Quỹ (23.5%)</th>
                  <th className="p-2 text-right font-black text-indigo-950 bg-indigo-50">Tổng Chi Quỹ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.map((r, idx) => (
                  <tr key={r.maNV} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="p-2 text-center text-slate-400 font-numeric border-r">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900 border-r">{r.hoTen}</td>
                    <td className="p-2 text-slate-600 border-r">{r.chucDanh}</td>
                    {/* Tầng 1 & 2 */}
                    <td className="p-2 text-right font-numeric bg-blue-50/30 border-r">{formatCurrency(r.moPhong.luongViTri)}</td>
                    <td className="p-2 text-right font-numeric bg-blue-50/30 border-r font-bold text-amber-900">{formatCurrency(r.moPhong.luongKpi)}</td>
                    <td className="p-2 text-right font-numeric bg-blue-50/30 border-r">{formatCurrency(r.moPhong.phuCapTN)}</td>
                    {/* Tầng 3 */}
                    <td className="p-2 text-right font-numeric border-r">{formatCurrency(r.moPhong.khoanAnTrua)}</td>
                    <td className="p-2 text-right font-numeric border-r">{formatCurrency(r.moPhong.khoanXangXe)}</td>
                    <td className="p-2 text-right font-numeric border-r">{formatCurrency(r.moPhong.khoanDienThoai)}</td>
                    <td className="p-2 text-right font-numeric border-r">{formatCurrency(r.moPhong.khoanTrangPhuc)}</td>
                    <td className="p-2 text-right font-numeric border-r">{formatCurrency(r.moPhong.khoanHdqt)}</td>
                    {/* Tầng 4 */}
                    <td className="p-2 text-right font-numeric bg-emerald-50/40 border-r">
                      <input
                        type="number"
                        step="500000"
                        min="2340000"
                        max="46800000"
                        value={r.moPhong.luongDongBhxhThucTe || ''}
                        onChange={e => handleUpdateStaffBhxh(r.maNV, e.target.value)}
                        className="w-24 px-1.5 py-0.5 text-right text-[11px] font-numeric font-bold border border-emerald-300 rounded bg-white text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                      />
                    </td>
                    <td className="p-2 text-right font-numeric font-bold text-emerald-700 bg-emerald-100/50 border-r">
                      {r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '-'}
                    </td>
                    <td className="p-2 text-right font-numeric text-rose-700 border-r">{formatCurrency(r.moPhong.bhxhNld)}</td>
                    <td className="p-2 text-right font-numeric text-rose-700 border-r">{formatCurrency(r.moPhong.thueTncn)}</td>
                    <td className="p-2 text-right font-numeric font-extrabold bg-amber-50 border-r">{formatCurrency(r.moPhong.tongGross)}</td>
                    {/* Kết quả */}
                    <td className="p-2 text-right font-numeric font-black text-emerald-950 bg-emerald-100 border-r">{formatCurrency(r.moPhong.thucLinhNet)}</td>
                    <td className="p-2 text-right font-numeric text-slate-700 border-r">{formatCurrency(r.moPhong.bhxhDonVi)}</td>
                    <td className="p-2 text-right font-numeric font-black text-indigo-950 bg-indigo-50">{formatCurrency(r.moPhong.tongChiPhiQuy)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200/80 font-bold border-t-2 border-slate-400 text-[11px]">
                  <td colSpan={3} className="p-2.5 text-center uppercase text-slate-800">TỔNG CỘNG ({filteredResults.length} CBNV):</td>
                  <td className="p-2 text-right font-numeric text-blue-900">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}</td>
                  <td className="p-2 text-right font-numeric text-amber-900">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}</td>
                  <td className="p-2 text-right font-numeric text-blue-900">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.phuCapTN, 0))}</td>
                  <td colSpan={5} className="p-2 text-center text-slate-500 font-normal italic">5 Khoản phụ cấp khoán</td>
                  <td className="p-2 text-center font-numeric text-slate-400">-</td>
                  <td className="p-2 text-right font-numeric font-bold text-emerald-800">+{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tienThuaBhxhHuong, 0))}</td>
                  <td className="p-2 text-right font-numeric text-rose-800">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.bhxhNld, 0))}</td>
                  <td className="p-2 text-right font-numeric text-rose-800">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.thueTncn, 0))}</td>
                  <td className="p-2 text-right font-numeric font-black text-amber-950 bg-amber-100">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tongGross, 0))}</td>
                  <td className="p-2 text-right font-numeric font-black text-emerald-950 bg-emerald-200">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.thucLinhNet, 0))}</td>
                  <td className="p-2 text-right font-numeric text-slate-800">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.bhxhDonVi, 0))}</td>
                  <td className="p-2 text-right font-numeric font-black text-indigo-950 bg-indigo-100">{formatCurrency(filteredResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: XEM PHIẾU LƯƠNG MÔ PHỎNG CHI TIẾT CỦA 1 CBNV ── */}
      {inspectingStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{inspectingStaff.hoTen}</h3>
                <p className="text-xs text-slate-500">{inspectingStaff.chucDanh} • Mã: {inspectingStaff.maNV}</p>
              </div>
              <button onClick={() => setInspectingStaff(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-950">TẦNG 1: LƯƠNG VỊ TRÍ (L1)</div>
                <div className="flex justify-between"><span>Ngạch Bậc:</span><b>Bậc {inspectingStaff.moPhong.bac} (Hệ số: {inspectingStaff.moPhong.heSoLuong.toFixed(2)})</b></div>
                <div className="flex justify-between"><span>Lương ngạch bậc:</span><b className="font-numeric">{formatCurrency(inspectingStaff.moPhong.luongNgachBac)}</b></div>
                <div className="flex justify-between"><span>Thâm niên CT ({inspectingStaff.moPhong.namThamNienCT} năm):</span><b className="font-numeric">+{formatCurrency(inspectingStaff.moPhong.thamNienCT)}</b></div>
                <div className="flex justify-between"><span>Thâm niên chức vụ ({inspectingStaff.moPhong.tongNamChucVu} năm):</span><b className="font-numeric">+{formatCurrency(inspectingStaff.moPhong.thamNienCV)}</b></div>
                {inspectingStaff.moPhong.vuotKhung > 0 && (
                  <div className="flex justify-between"><span>Vượt khung (+5%/3 năm sau bậc 5):</span><b className="font-numeric">+{formatCurrency(inspectingStaff.moPhong.vuotKhung)}</b></div>
                )}
                <div className="flex justify-between border-t border-blue-200 pt-1 font-bold text-blue-900">
                  <span>Tổng Lương Vị Trí (L1):</span><span className="font-numeric">{formatCurrency(inspectingStaff.moPhong.luongViTri)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1">
                <div className="font-bold text-amber-950">TẦNG 2 & 3: LƯƠNG KPI & PHỤ CẤP KHOÁN</div>
                <div className="flex justify-between"><span>Lương năng suất KPI:</span><b className="font-numeric text-amber-900">{formatCurrency(inspectingStaff.moPhong.luongKpi)}</b></div>
                <div className="flex justify-between"><span>Phụ cấp trách nhiệm:</span><b className="font-numeric">{formatCurrency(inspectingStaff.moPhong.phuCapTN)}</b></div>
                <div className="flex justify-between"><span>Khoán ăn trưa, xăng xe, ĐT, trang phục:</span><b className="font-numeric">{formatCurrency(inspectingStaff.moPhong.tongKhoanChi)}</b></div>
                {inspectingStaff.moPhong.khoanHdqt > 0 && (
                  <div className="flex justify-between"><span>Khoán hoạt động HĐQT:</span><b className="font-numeric">{formatCurrency(inspectingStaff.moPhong.khoanHdqt)}</b></div>
                )}
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-950">TẦNG 4: BHXH THỎA THUẬN & TIỀN THỪA</div>
                <div className="flex justify-between"><span>Mức chuẩn quy định (L1):</span><span className="font-numeric">{formatCurrency(inspectingStaff.moPhong.luongDongBhxhChuan)}</span></div>
                <div className="flex justify-between"><span>Mức đóng thỏa thuận:</span><b className="font-numeric text-emerald-900">{formatCurrency(inspectingStaff.moPhong.luongDongBhxhThucTe)}</b></div>
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Tiền thừa BHXH Quỹ hoàn trả (Cộng vào Gross):</span>
                  <span className="font-numeric">+{formatCurrency(inspectingStaff.moPhong.tienThuaBhxhHuong)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1.5 font-numeric">
                <div className="flex justify-between text-amber-300 font-bold text-sm">
                  <span>TỔNG THU NHẬP GROSS:</span><span>{formatCurrency(inspectingStaff.moPhong.tongGross)}</span>
                </div>
                <div className="flex justify-between text-rose-300 text-xs">
                  <span>Trừ BHXH NLĐ (10.5%):</span><span>-{formatCurrency(inspectingStaff.moPhong.bhxhNld)}</span>
                </div>
                <div className="flex justify-between text-rose-300 text-xs">
                  <span>Trừ Thuế TNCN:</span><span>-{formatCurrency(inspectingStaff.moPhong.thueTncn)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-black text-base border-t border-slate-700 pt-1.5">
                  <span>THỰC LĨNH NET VỀ TÀI KHOẢN:</span><span>{formatCurrency(inspectingStaff.moPhong.thucLinhNet)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectingStaff(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: XEM TRƯỚC IN BÁO CÁO & XUẤT PDF KHỔ A4 NGANG (CÓ 3 CHỮ KÝ) ── */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-brand-navy" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Bản In / Xuất PDF Khổ A4 Ngang</h3>
                  <p className="text-[11px] text-slate-500">Chuẩn thể thức Quỹ tín dụng nhân dân có Quốc hiệu & Khối 3 chữ ký</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Ngay / Lưu PDF</span>
                </button>
                <button onClick={() => setShowPrintModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="print-salary-report" className="printable-salary-report p-6 bg-white text-slate-900 text-[11px] space-y-4">
              {/* Header Quốc Hiệu */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div className="text-left space-y-0.5">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                    QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
                  </div>
                  <div className="text-[10px] text-slate-600">Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá</div>
                  <div className="text-[10px] text-slate-600 font-medium">Số: ..... /BC-QTD</div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-[10px] text-slate-800">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="text-[10px] italic text-slate-600 pt-0.5">
                    Quý Lộc, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              {/* Tiêu đề báo cáo */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">
                  BẢNG MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027
                </h2>
                <div className="text-[11px] text-slate-600">
                  Lương cơ sở: <b className="font-numeric">{formatCurrency(luongCoSo)}</b>
                  {'  •  '}Hiệu suất KPI: <b className="font-numeric">{globalKpiPerformance}%</b>
                  {'  •  '}Giảm trừ thuế: <b>{pitRegime === 'CURRENT' ? '11tr / 4.4tr' : '15tr / 6.2tr'}</b>
                </div>
              </div>

              {/* Bảng in dữ liệu */}
              <table className="w-full border-collapse text-[10px] border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                    <th className="border border-slate-400 p-1 w-8">STT</th>
                    <th className="border border-slate-400 p-1 w-14">Mã NV</th>
                    <th className="border border-slate-400 p-1 text-left min-w-[120px]">Họ và tên</th>
                    <th className="border border-slate-400 p-1 text-left min-w-[110px]">Chức danh</th>
                    <th className="border border-slate-400 p-1 w-10">Bậc</th>
                    <th className="border border-slate-400 p-1 w-12">Hệ số</th>
                    <th className="border border-slate-400 p-1 text-right">Lương L1</th>
                    <th className="border border-slate-400 p-1 text-right">Lương KPI</th>
                    <th className="border border-slate-400 p-1 text-right">Khoán & PC</th>
                    <th className="border border-slate-400 p-1 text-right">Tiền thừa BH</th>
                    <th className="border border-slate-400 p-1 text-right font-bold bg-amber-50">Tổng Gross</th>
                    <th className="border border-slate-400 p-1 text-right">BHXH (10.5%)</th>
                    <th className="border border-slate-400 p-1 text-right">Thuế TNCN</th>
                    <th className="border border-slate-400 p-1 text-right font-bold bg-emerald-50">Thực Lĩnh Net</th>
                    <th className="border border-slate-400 p-1 text-right">Chi Phí Quỹ</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.map((r, idx) => (
                    <tr key={r.maNV} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      <td className="border border-slate-300 p-1 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{r.maNV}</td>
                      <td className="border border-slate-300 p-1 font-bold">{r.hoTen}</td>
                      <td className="border border-slate-300 p-1">{r.chucDanh}</td>
                      <td className="border border-slate-300 p-1 text-center font-numeric">{r.moPhong.bac}</td>
                      <td className="border border-slate-300 p-1 text-center font-numeric">{r.moPhong.heSoLuong.toFixed(2)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.luongViTri)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.luongKpi)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanHdqt + r.moPhong.phuCapTN)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '-'}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric font-bold bg-amber-50/50">{formatCurrency(r.moPhong.tongGross)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.bhxhNld)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.thueTncn)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric font-bold bg-emerald-50/50">{formatCurrency(r.moPhong.thucLinhNet)}</td>
                      <td className="border border-slate-300 p-1 text-right font-numeric font-bold">{formatCurrency(r.moPhong.tongChiPhiQuy)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={6} className="border border-slate-400 p-1.5 text-center uppercase">TỔNG CỘNG TOÀN QUỸ ({simulationResults.length} CBNV)</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongKhoanChi + r.moPhong.khoanHdqt + r.moPhong.phuCapTN, 0))}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric text-emerald-800">+{formatCurrency(macroMetrics.tongTienThuaBhxh)}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold bg-amber-50">{formatCurrency(macroMetrics.tongGrossThang)}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.bhxhNld, 0))}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(macroMetrics.tongThueTncn)}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold bg-emerald-50">{formatCurrency(macroMetrics.tongNetThang)}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold">{formatCurrency(macroMetrics.tongChiPhiThang)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* 3 Khối Chữ Ký */}
              <div className="flex justify-between items-start pt-6 text-center text-xs font-bold">
                <div className="w-1/3">
                  <div className="uppercase">NGƯỜI LẬP BIỂU</div>
                  <div className="font-normal italic text-slate-500 mt-14">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="w-1/3">
                  <div className="uppercase">KẾ TOÁN TRƯỞNG</div>
                  <div className="font-normal italic text-slate-500 mt-14">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="w-1/3">
                  <div className="uppercase">CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ</div>
                  <div className="font-normal italic text-slate-500 mt-14">(Ký tên, đóng dấu)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
