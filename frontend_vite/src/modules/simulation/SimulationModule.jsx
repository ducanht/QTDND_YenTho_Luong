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
  BarChart3, 
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
  Plus,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/currency';
import { simulateStaffCompensation, detectDepartmentKey } from '../../utils/taxEngine';
import { api } from '../../services/api';

const formatShort = (amount) => {
  if (!amount) return '0';
  if (amount >= 1000000) {
    const tr = amount / 1000000;
    return tr % 1 === 0 ? `${tr}Tr` : `${tr.toFixed(1)}Tr`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}K`;
  }
  return String(amount);
};

const DEFAULT_SCENARIOS = [
  {
    id: 'SCENARIO_STANDARD_2027',
    name: 'Chuẩn HĐQT 2027',
    luongCoSo: 2340000,
    tranKpi: 115,
    donGiaKpiCoBan: 4000000,
    kpiCalcMethod: 'DEPT_RATIO',
    deptKpiRatios: { LANH_DAO: 40, TIN_DUNG: 50, KE_TOAN: 35, HO_TRO: 20 },
    bulkBhxhOption: 'INDIVIDUAL',
    anTrua: 850000,
    xangXe: 500000,
    dienThoai: 400000,
    trangPhuc: 416666,
    trachNhiem: 600000,
    docHai: 400000,
    quyThuongNam: 200000000
  },
  {
    id: 'SCENARIO_BASE_2500',
    name: 'Lương Cơ Sở 2.50Tr',
    luongCoSo: 2500000,
    tranKpi: 110,
    donGiaKpiCoBan: 4200000,
    kpiCalcMethod: 'DEPT_RATIO',
    deptKpiRatios: { LANH_DAO: 40, TIN_DUNG: 50, KE_TOAN: 35, HO_TRO: 20 },
    bulkBhxhOption: 'INDIVIDUAL',
    anTrua: 900000,
    xangXe: 500000,
    dienThoai: 400000,
    trangPhuc: 416666,
    trachNhiem: 600000,
    docHai: 400000,
    quyThuongNam: 220000000
  },
  {
    id: 'SCENARIO_HIGH_KPI',
    name: 'Đột Phá Kinh Doanh',
    luongCoSo: 2340000,
    tranKpi: 125,
    donGiaKpiCoBan: 4500000,
    kpiCalcMethod: 'DEPT_RATIO',
    deptKpiRatios: { LANH_DAO: 45, TIN_DUNG: 60, KE_TOAN: 40, HO_TRO: 25 },
    bulkBhxhOption: 'INDIVIDUAL',
    anTrua: 850000,
    xangXe: 600000,
    dienThoai: 500000,
    trangPhuc: 416666,
    trachNhiem: 600000,
    docHai: 400000,
    quyThuongNam: 250000000
  },
  {
    id: 'SCENARIO_COST_OPTIMAL',
    name: 'Tối Ưu Chi Phí Quỹ',
    luongCoSo: 2340000,
    tranKpi: 100,
    donGiaKpiCoBan: 3500000,
    kpiCalcMethod: 'DEPT_RATIO',
    deptKpiRatios: { LANH_DAO: 35, TIN_DUNG: 40, KE_TOAN: 30, HO_TRO: 15 },
    bulkBhxhOption: 'INDIVIDUAL',
    anTrua: 730000,
    xangXe: 400000,
    dienThoai: 300000,
    trangPhuc: 416666,
    trachNhiem: 500000,
    docHai: 300000,
    quyThuongNam: 150000000
  }
];

export function SimulationModule({
  data,
  activeSubTab: externalSubTab = 'scenarios',
  onSaveScenario,
  onSaveSalaryParams,
  onSaveSalaryScale,
  onSaveAllowances,
  onRefresh
}) {
  // Lấy dữ liệu 12 CBNV và Chức danh từ CSDL
  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const scenarios = data?.scenarios || [];

  // Ánh xạ sub-tab routing V3 → nội dung hiện có
  const subTabMapping = {
    salary_structure: 'tuner',  // Cơ cấu lương & hệ số
    allowances: 'tuner',        // Khoán & phụ cấp (tạm dùng tuner)
    insurance_tax: 'tuner',     // BHXH & Thuế (tạm dùng tuner)
    scenarios: 'matrix',        // Bảng so sánh 12 CBNV
    proposal: 'proposal',       // Tờ trình HĐQT
  };

  // Quản lý danh sách kịch bản mô phỏng động
  const [customScenarios, setCustomScenarios] = useState(() => {
    if (scenarios && scenarios.length > 0) return scenarios;
    return DEFAULT_SCENARIOS;
  });

  // Trạng thái kịch bản đang chọn và chế độ xem
  const [selectedScenarioId, setSelectedScenarioId] = useState(() => {
    if (scenarios && scenarios.length > 0) return scenarios[0].id;
    return 'SCENARIO_STANDARD_2027';
  });

  // Modal tạo kịch bản mới & Modal xem trước in ấn A4
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioBaseSalary, setNewScenarioBaseSalary] = useState(2340000);
  const [newScenarioTranKpi, setNewScenarioTranKpi] = useState(115);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState(subTabMapping[externalSubTab] || 'matrix');
  const [displayMode, setDisplayMode] = useState('SUMMARY'); // 'SUMMARY' | 'DETAILED'
  const [pitRegime, setPitRegime] = useState('CURRENT'); // 'CURRENT' (11tr/4.4tr) | 'DRAFT' (15tr/6.2tr)
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [inspectingStaff, setInspectingStaff] = useState(null); // Modal xem chi tiết 1 CBNV

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Cấu hình % Kết cấu Lương KPI theo 4 Khối Nghiệp Vụ
  const [kpiCalcMethod, setKpiCalcMethod] = useState('DEPT_RATIO'); // 'DEPT_RATIO' (% kết cấu) | 'FIXED_PRICE'
  const [deptKpiRatios, setDeptKpiRatios] = useState({
    LANH_DAO: 40, // 40% KPI (60% Lương Vị Trí)
    TIN_DUNG: 50, // 50% KPI (50% Lương Vị Trí)
    KE_TOAN: 35,  // 35% KPI (65% Lương Vị Trí)
    HO_TRO: 20    // 20% KPI (80% Lương Vị Trí)
  });

  // Cấu hình Mức Đóng BHXH Tùy Biến Độc Lập Cho Từng Cá Nhân
  // Mỗi người được tự do chọn mức đóng khác nhau, số thừa so với DN trả được cộng vào thu nhập
  // { [maNV]: { mode: 'STANDARD' | 'MIN' | 'CUSTOM' | 'PROFILE', customAmount: number } }
  const [staffBhxhCustom, setStaffBhxhCustom] = useState({});
  const [bulkBhxhOption, setBulkBhxhOption] = useState('INDIVIDUAL'); // 'INDIVIDUAL' (theo hồ sơ riêng) | 'MIN_ZONE' | 'STANDARD'
  const [isSavingBhxh, setIsSavingBhxh] = useState(false);
  const [bhxhSaveMsg, setBhxhSaveMsg] = useState('');

  const handleUpdateStaffBhxh = (maNV, mode, customAmount) => {
    setStaffBhxhCustom(prev => ({
      ...prev,
      [maNV]: { mode, customAmount: Number(customAmount) || 0 }
    }));
  };

  const handleApplyBulkBhxh = (option) => {
    setBulkBhxhOption(option);
    if (option === 'INDIVIDUAL' || option === 'PROFILE') {
      // Khôi phục mức riêng của từng cá nhân đã lưu trong hồ sơ
      setStaffBhxhCustom({});
    } else if (option === 'MIN_ZONE') {
      const updated = {};
      staffList.forEach(s => {
        updated[s.maNV] = { mode: 'MIN', customAmount: 5000000 };
      });
      setStaffBhxhCustom(updated);
    } else if (option === 'STANDARD') {
      const updated = {};
      staffList.forEach(s => {
        updated[s.maNV] = { mode: 'STANDARD', customAmount: 0 };
      });
      setStaffBhxhCustom(updated);
    }
  };

  const handleSaveBatchBhxhToStaff = async () => {
    if (!simulationResults || simulationResults.length === 0) return;
    const confirmSave = window.confirm(
      `XÁC NHẬN LƯU MỨC ĐÓNG BHXH CÁ NHÂN?\n\nBạn có chắc chắn muốn lưu mức đóng BHXH của 12 cán bộ trong bảng mô phỏng vào CSDL Hồ sơ nhân sự (DM_NS) không?\n\nThao tác này sẽ cập nhật mức đóng chính thức cho từng cá nhân.`
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

  // Tham số mô phỏng có thể tùy chỉnh
  const [luongCoSo, setLuongCoSo] = useState(2340000);
  const [tranKpi, setTranKpi] = useState(115); // %
  const [donGiaKpiCoBan, setDonGiaKpiCoBan] = useState(4000000); // ₫/tháng chuẩn
  const [anTrua, setAnTrua] = useState(850000); // ₫/tháng
  const [xangXe, setXangXe] = useState(500000); // ₫/tháng
  const [dienThoai, setDienThoai] = useState(400000); // ₫/tháng
  const [trangPhuc, setTrangPhuc] = useState(416666); // ₫/tháng (5tr/năm)
  const [trachNhiem, setTrachNhiem] = useState(600000); // ₫/tháng
  const [docHai, setDocHai] = useState(400000); // ₫/tháng
  const [quyThuongNam, setQuyThuongNam] = useState(200000000); // ₫/năm
  const [sensitivityFactor, setSensitivityFactor] = useState(100); // 80%, 100%, 120%

  // Tải cấu hình khi đổi kịch bản
  const handleSelectScenario = (scId) => {
    setSelectedScenarioId(scId);
    const sc = customScenarios.find(s => s.id === scId);
    if (sc) {
      if (sc.luongCoSo !== undefined) setLuongCoSo(sc.luongCoSo);
      if (sc.tranKpi !== undefined) setTranKpi(sc.tranKpi);
      if (sc.donGiaKpiCoBan !== undefined) setDonGiaKpiCoBan(sc.donGiaKpiCoBan);
      if (sc.kpiCalcMethod) setKpiCalcMethod(sc.kpiCalcMethod);
      if (sc.deptKpiRatios) setDeptKpiRatios(sc.deptKpiRatios);
      if (sc.bulkBhxhOption) setBulkBhxhOption(sc.bulkBhxhOption);
      if (sc.anTrua !== undefined) setAnTrua(sc.anTrua);
      if (sc.xangXe !== undefined) setXangXe(sc.xangXe);
      if (sc.dienThoai !== undefined) setDienThoai(sc.dienThoai);
      if (sc.trangPhuc !== undefined) setTrangPhuc(sc.trangPhuc);
      if (sc.trachNhiem !== undefined) setTrachNhiem(sc.trachNhiem);
      if (sc.docHai !== undefined) setDocHai(sc.docHai);
      if (sc.quyThuongNam !== undefined) setQuyThuongNam(sc.quyThuongNam);
    }
  };

  // Tính toán mô phỏng chi tiết 12 CBNV với động cơ simulateStaffCompensation
  const simulationResults = useMemo(() => {
    if (!staffList || staffList.length === 0) return [];

    return staffList.map(emp => {
      const pos = positions.find(p => p.tenChucDanh === emp.chucDanh || p.maViTri === emp.chucDanh);
      const deptKey = detectDepartmentKey(emp, pos);
      const deptRatio = deptKpiRatios[deptKey] ?? 40;

      // Mức đóng BHXH gốc trong hồ sơ cán bộ
      const empBhxhGoc = Number(emp.mucDongBhxh) || 0;
      const empBhxhConfig = staffBhxhCustom[emp.maNV];
      let customBhxhSalary = null;

      if (empBhxhConfig !== undefined) {
        if (empBhxhConfig.mode === 'STANDARD') {
          customBhxhSalary = null; // Theo chuẩn L1
        } else if (empBhxhConfig.mode === 'MIN') {
          customBhxhSalary = 5000000;
        } else if (empBhxhConfig.mode === 'CUSTOM') {
          customBhxhSalary = Number(empBhxhConfig.customAmount) > 0 ? Number(empBhxhConfig.customAmount) : 5000000;
        } else if (empBhxhConfig.mode === 'PROFILE') {
          customBhxhSalary = empBhxhGoc > 0 ? empBhxhGoc : null;
        }
      } else if (bulkBhxhOption === 'MIN_ZONE') {
        customBhxhSalary = 5000000;
      } else if (bulkBhxhOption === 'STANDARD') {
        customBhxhSalary = null;
      } else {
        // Mặc định 'INDIVIDUAL': mỗi người đóng theo mức riêng đã lưu trong hồ sơ cá nhân
        customBhxhSalary = empBhxhGoc > 0 ? empBhxhGoc : null;
      }

      // 1. Tính toán Phương Án Hiện Tại (Cơ sở PA1, lương cơ sở 2.340.000, trần KPI 100%)
      const hienTai = simulateStaffCompensation({
        emp,
        pos,
        scenario: 'PA1',
        luongCoSo: 2340000,
        kpiCalcMethod: 'FIXED_PRICE',
        tranKpi: 100,
        donGiaKpiCoBan: 3500000,
        kpiPerformanceRatio: 1.0,
        customBhxhSalary: null,
        anTrua: 730000,
        xangXe: 400000,
        dienThoai: 300000,
        trangPhuc: 416666,
        trachNhiem: 500000,
        docHai: 300000,
        pitRegime: 'CURRENT'
      });

      // 2. Tính toán Phương Án Mô Phỏng theo kịch bản và tham số HĐQT tinh chỉnh
      const moPhong = simulateStaffCompensation({
        emp,
        pos,
        scenario: selectedScenarioId,
        luongCoSo,
        kpiCalcMethod,
        deptKpiRatio: deptRatio,
        tranKpi,
        donGiaKpiCoBan,
        kpiPerformanceRatio: sensitivityFactor / 100,
        customBhxhSalary,
        anTrua,
        xangXe,
        dienThoai,
        trangPhuc,
        trachNhiem,
        docHai,
        pitRegime
      });

      const chenhLechGross = moPhong.tongGross - hienTai.tongGross;
      const phanTramGross = hienTai.tongGross > 0 ? (chenhLechGross / hienTai.tongGross) * 100 : 0;
      const chenhLechNet = moPhong.thucLinhNet - hienTai.thucLinhNet;
      const chenhLechBhxhDonVi = moPhong.bhxhDonVi - hienTai.bhxhDonVi;
      const chenhLechTongChiPhiQuy = moPhong.tongChiPhiQuy - hienTai.tongChiPhiQuy;

      return {
        maNV: emp.maNV,
        hoTen: emp.hoTen,
        chucDanh: emp.chucDanh,
        phongBan: emp.phongBan || 'Nghiệp vụ',
        deptKey,
        deptRatio,
        empBhxhGoc,
        empBhxhConfig,
        soNPT: moPhong.soNPT,
        hienTai,
        moPhong,
        chenhLechGross,
        phanTramGross,
        chenhLechNet,
        chenhLechBhxhDonVi,
        chenhLechTongChiPhiQuy
      };
    });
  }, [
    staffList, 
    positions, 
    selectedScenarioId, 
    luongCoSo, 
    kpiCalcMethod,
    deptKpiRatios,
    staffBhxhCustom,
    bulkBhxhOption,
    tranKpi, 
    donGiaKpiCoBan, 
    anTrua, 
    xangXe, 
    dienThoai, 
    trangPhuc, 
    trachNhiem, 
    docHai, 
    sensitivityFactor, 
    pitRegime
  ]);

  // Lọc theo phòng ban
  const filteredResults = useMemo(() => {
    if (departmentFilter === 'ALL') return simulationResults;
    return simulationResults.filter(r => {
      const pb = (r.phongBan || '').toUpperCase();
      const cd = (r.chucDanh || '').toUpperCase();
      if (departmentFilter === 'LANH_DAO') return cd.includes('CHỦ TỊCH') || cd.includes('GIÁM ĐỐC') || cd.includes('KIỂM SOÁT');
      if (departmentFilter === 'TIN_DUNG') return cd.includes('TÍN DỤNG');
      if (departmentFilter === 'KE_TOAN') return cd.includes('KẾ TOÁN') || cd.includes('THỦ QUỸ');
      if (departmentFilter === 'HO_TRO') return cd.includes('VĂN PHÒNG') || cd.includes('BẢO VỆ');
      return true;
    });
  }, [simulationResults, departmentFilter]);

  // Tổng hợp chỉ số tài chính vĩ mô
  const macroMetrics = useMemo(() => {
    const tongGrossThangHienTai = simulationResults.reduce((sum, r) => sum + r.hienTai.tongGross, 0);
    const tongGrossThangMoPhong = simulationResults.reduce((sum, r) => sum + r.moPhong.tongGross, 0);
    const tongBhxhDonViThangHienTai = simulationResults.reduce((sum, r) => sum + r.hienTai.bhxhDonVi, 0);
    const tongBhxhDonViThangMoPhong = simulationResults.reduce((sum, r) => sum + r.moPhong.bhxhDonVi, 0);
    const tongNetThangHienTai = simulationResults.reduce((sum, r) => sum + r.hienTai.thucLinhNet, 0);
    const tongNetThangMoPhong = simulationResults.reduce((sum, r) => sum + r.moPhong.thucLinhNet, 0);
    const tongThueTncnThangMoPhong = simulationResults.reduce((sum, r) => sum + r.moPhong.thueTncn, 0);
    const tongTienThuaBhxhThangMoPhong = simulationResults.reduce((sum, r) => sum + (r.moPhong.tienThuaBhxhHuong || 0), 0);

    const tongChiPhiThangHienTai = simulationResults.reduce((sum, r) => sum + r.hienTai.tongChiPhiQuy, 0);
    const tongChiPhiThangMoPhong = simulationResults.reduce((sum, r) => sum + r.moPhong.tongChiPhiQuy, 0);

    const tongChiPhiNamHienTai = tongChiPhiThangHienTai * 12 + 150000000;
    const tongChiPhiNamMoPhong = tongChiPhiThangMoPhong * 12 + quyThuongNam;

    const chenhLechChiPhiNam = tongChiPhiNamMoPhong - tongChiPhiNamHienTai;
    const phanTramChenhLechNam = tongChiPhiNamHienTai > 0 ? (chenhLechChiPhiNam / tongChiPhiNamHienTai) * 100 : 0;

    const thuNhapBqMoPhong = simulationResults.length > 0 ? tongGrossThangMoPhong / simulationResults.length : 0;
    const thuNhapBqHienTai = simulationResults.length > 0 ? tongGrossThangHienTai / simulationResults.length : 0;

    // Khoảng cách lương Max / Min
    const grossList = simulationResults.map(r => r.moPhong.tongGross);
    const maxGross = Math.max(...grossList, 0);
    const minGross = Math.min(...grossList.filter(g => g > 0), 1);
    const heSoKhoangCach = minGross > 0 ? (maxGross / minGross).toFixed(2) : '1.00';

    return {
      tongGrossThangHienTai,
      tongGrossThangMoPhong,
      tongChiPhiNamHienTai,
      tongChiPhiNamMoPhong,
      chenhLechChiPhiNam,
      phanTramChenhLechNam,
      thuNhapBqMoPhong,
      thuNhapBqHienTai,
      tongNetThangHienTai,
      tongNetThangMoPhong,
      tongThueTncnThangMoPhong,
      tongTienThuaBhxhThangMoPhong,
      heSoKhoangCach,
      tongBhxhDonViNamMoPhong: tongBhxhDonViThangMoPhong * 12
    };
  }, [simulationResults, quyThuongNam]);

  // Thống kê phân bổ mức đóng BHXH của 12 CBNV
  const bhxhStats = useMemo(() => {
    let countMin = 0;
    let countStandard = 0;
    let countCustom = 0;
    let countSurplus = 0;

    simulationResults.forEach(r => {
      if (r.moPhong.tienThuaBhxhHuong > 0) countSurplus++;
      if (r.moPhong.luongDongBhxhThucTe === 5000000) countMin++;
      else if (r.moPhong.luongDongBhxhThucTe === r.moPhong.luongDongBhxhChuan) countStandard++;
      else countCustom++;
    });

    return { countMin, countStandard, countCustom, countSurplus };
  }, [simulationResults]);

  const handleCreateNewScenario = (e) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    const newId = `SCENARIO_${Date.now()}`;
    const newSc = {
      id: newId,
      name: newScenarioName.trim(),
      luongCoSo: newScenarioBaseSalary,
      tranKpi: newScenarioTranKpi,
      donGiaKpiCoBan,
      deptKpiRatios: { ...deptKpiRatios },
      kpiCalcMethod,
      bulkBhxhOption,
      anTrua,
      xangXe,
      dienThoai,
      trangPhuc,
      trachNhiem,
      docHai,
      quyThuongNam
    };

    setCustomScenarios(prev => [...prev, newSc]);
    setSelectedScenarioId(newId);
    setLuongCoSo(newScenarioBaseSalary);
    setTranKpi(newScenarioTranKpi);
    setShowNewScenarioModal(false);
    setNewScenarioName('');
    setSaveSuccessMsg(`✅ Đã tạo kịch bản mới "${newSc.name}"! Bạn có thể chỉnh sửa tham số và bấm "Lưu Kịch Bản".`);
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleSaveCurrentScenario = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const activeSc = customScenarios.find(s => s.id === selectedScenarioId);
      const scenarioPayload = {
        id: selectedScenarioId,
        name: activeSc ? activeSc.name : `Kịch bản ${selectedScenarioId}`,
        luongCoSo,
        kpiCalcMethod,
        deptKpiRatios,
        bulkBhxhOption,
        tranKpi,
        donGiaKpiCoBan,
        anTrua,
        xangXe,
        dienThoai,
        trangPhuc,
        trachNhiem,
        docHai,
        quyThuongNam
      };

      setCustomScenarios(prev => prev.map(s => s.id === selectedScenarioId ? { ...s, ...scenarioPayload } : s));

      if (onSaveScenario) {
        await onSaveScenario(scenarioPayload);
      }
      setSaveSuccessMsg(`✅ Đã lưu kịch bản "${scenarioPayload.name}" vào CSDL thành công!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Lỗi lưu kịch bản: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 1. XUẤT BẢNG SO SÁNH RA EXCEL (.XLS)
  const exportToExcel = () => {
    const activeSc = customScenarios.find(s => s.id === selectedScenarioId);
    const scenarioName = activeSc ? activeSc.name : `Kịch bản ${selectedScenarioId}`;
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
          <tr><td colspan="22" class="header-title">QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ</td></tr>
          <tr><td colspan="22" class="sub-title">Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá</td></tr>
          <tr><td colspan="22" style="height: 10px;"></td></tr>
          <tr><td colspan="22" class="header-title">BẢNG SO SÁNH MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027</td></tr>
          <tr><td colspan="22" class="sub-title">Kịch bản: <b>${scenarioName}</b> | Lương cơ sở: <b>${formatCurrency(luongCoSo)}</b> | Trần KPI: <b>${tranKpi}%</b> | Ngày xuất: ${dateStr}</td></tr>
          <tr><td colspan="22" style="height: 15px;"></td></tr>
          <thead>
            <tr>
              <th class="th-main">STT</th>
              <th class="th-main">Mã NV</th>
              <th class="th-main">Họ và tên</th>
              <th class="th-main">Chức danh</th>
              <th class="th-main">Phòng ban</th>
              <th class="th-main">Bậc</th>
              <th class="th-main">Hệ số</th>
              <th class="th-main">TN Công tác</th>
              <th class="th-main">TN Chức vụ</th>
              <th class="th-main">Vượt khung</th>
              <th class="th-main">Lương Vị trí (L1)</th>
              <th class="th-main">Lương KPI (L2)</th>
              <th class="th-main">Khoán & PC (L3)</th>
              <th class="th-main">Tiền thừa BHXH</th>
              <th class="th-main">Tổng Gross Đề xuất</th>
              <th class="th-main">Trích BHXH NLĐ (10.5%)</th>
              <th class="th-main">Thuế TNCN</th>
              <th class="th-main">Thực lĩnh Net</th>
              <th class="th-main">BHXH Quỹ (23.5%)</th>
              <th class="th-main">Tổng Chi Phí Quỹ</th>
              <th class="th-main">Gross Cũ (Hiện tại)</th>
              <th class="th-main">Chênh lệch Gross</th>
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
          <td>${r.phongBan}</td>
          <td class="text-center">${r.moPhong.bac || 1}</td>
          <td class="num">${r.moPhong.heSoLuong.toFixed(2)}</td>
          <td class="text-center">${r.moPhong.namThamNienCT || 0} năm</td>
          <td class="text-center">${r.moPhong.tongNamChucVu || 0} năm</td>
          <td class="text-center">${(r.moPhong.soLanVuotKhung || 0) * 5}%</td>
          <td class="num">${r.moPhong.luongViTri}</td>
          <td class="num">${r.moPhong.luongKpi}</td>
          <td class="num">${r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem}</td>
          <td class="num">${r.moPhong.tienThuaBhxhHuong || 0}</td>
          <td class="num"><b>${r.moPhong.tongGross}</b></td>
          <td class="num">${r.moPhong.tongKhauTruBh}</td>
          <td class="num">${r.moPhong.thueTncn}</td>
          <td class="num"><b>${r.moPhong.thucLinhNet}</b></td>
          <td class="num">${r.moPhong.bhxhDonVi}</td>
          <td class="num"><b>${r.moPhong.tongChiPhiQuy}</b></td>
          <td class="num">${r.hienTai.tongGross}</td>
          <td class="num" style="color: ${r.chenhLechGross >= 0 ? '#047857' : '#e11d48'}">${r.chenhLechGross}</td>
        </tr>
      `;
    });

    const totalViTri = simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0);
    const totalKpi = simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0);
    const totalKhoan = simulationResults.reduce((s, r) => s + r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem, 0);
    const totalThuaBhxh = simulationResults.reduce((s, r) => s + (r.moPhong.tienThuaBhxhHuong || 0), 0);
    const totalGross = macroMetrics.tongGrossThangMoPhong;
    const totalKhauTruBh = simulationResults.reduce((s, r) => s + r.moPhong.tongKhauTruBh, 0);
    const totalThue = macroMetrics.tongThueTncnThangMoPhong;
    const totalNet = macroMetrics.tongNetThangMoPhong;
    const totalBhxhQuy = simulationResults.reduce((s, r) => s + r.moPhong.bhxhDonVi, 0);
    const totalChiPhi = simulationResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0);
    const totalGrossCu = macroMetrics.tongGrossThangHienTai;
    const totalChenhLech = totalGross - totalGrossCu;

    html += `
        <tr class="total-row">
          <td colspan="10" class="text-center"><b>TỔNG CỘNG TOÀN QUỸ (12 CBNV)</b></td>
          <td class="num"><b>${totalViTri}</b></td>
          <td class="num"><b>${totalKpi}</b></td>
          <td class="num"><b>${totalKhoan}</b></td>
          <td class="num"><b>${totalThuaBhxh}</b></td>
          <td class="num"><b>${totalGross}</b></td>
          <td class="num"><b>${totalKhauTruBh}</b></td>
          <td class="num"><b>${totalThue}</b></td>
          <td class="num"><b>${totalNet}</b></td>
          <td class="num"><b>${totalBhxhQuy}</b></td>
          <td class="num"><b>${totalChiPhi}</b></td>
          <td class="num"><b>${totalGrossCu}</b></td>
          <td class="num"><b>${totalChenhLech}</b></td>
        </tr>
        <tr><td colspan="22" style="height: 20px;"></td></tr>
        <tr>
          <td colspan="7" class="text-center"><b>NGƯỜI LẬP BIỂU</b><br><br><br><br><i>(Ký, ghi rõ họ tên)</i></td>
          <td colspan="7" class="text-center"><b>KẾ TOÁN TRƯỞNG</b><br><br><br><br><i>(Ký, ghi rõ họ tên)</i></td>
          <td colspan="8" class="text-center"><b>CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ</b><br><br><br><br><i>(Ký tên, đóng dấu)</i></td>
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
    const cleanScName = scenarioName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    a.download = `Bang_So_Sanh_Mo_Phong_Luong_${cleanScName}_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. XUẤT ẢNH PNG ĐỘ PHÂN GIẢI CAO (2X HIGH-DPI) GỬI ZALO/TELEGRAM
  const exportToImage = () => {
    const activeSc = customScenarios.find(s => s.id === selectedScenarioId);
    const scenarioName = activeSc ? activeSc.name : `Kịch bản ${selectedScenarioId}`;

    const canvas = document.createElement('canvas');
    const scale = 2;
    const width = 1920;
    const height = 1120;

    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Nền trắng / slate sáng
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Banner tiêu đề Navy
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 140);

    ctx.fillStyle = '#a3e635';
    ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText('🏛️ QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ • XÃ QUÝ LỘC, TỈNH THANH HOÁ', 40, 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Be Vietnam Pro", sans-serif';
    ctx.fillText('BẢNG SO SÁNH MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027', 40, 72);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Kịch bản: ${scenarioName}  |  Lương cơ sở: ${formatCurrency(luongCoSo)}  |  Trần KPI: ${tranKpi}%  |  Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}  |  Đơn vị: VNĐ`, 40, 105);

    // 4 Thẻ KPI vĩ mô
    const cardWidth = (width - 80 - 3 * 20) / 4;
    const cardY = 160;
    const cardH = 90;
    const cards = [
      { title: 'TỔNG QUỸ LƯƠNG & BH NĂM', val: formatCurrency(macroMetrics.tongChiPhiNamMoPhong), sub: `Chênh lệch: +${formatCurrency(macroMetrics.chenhLechChiPhiNam)}/năm`, color: '#1e3a8a' },
      { title: 'BHXH ĐƠN VỊ GÁNH CHỊU', val: formatCurrency(macroMetrics.tongBhxhDonViNamMoPhong), sub: 'Tỷ lệ 23.5% toàn Quỹ', color: '#b45309' },
      { title: 'THU NHẬP BÌNH QUÂN / THÁNG', val: `${formatCurrency(macroMetrics.thuNhapBqMoPhong)}`, sub: `Hiện tại: ${formatCurrency(macroMetrics.thuNhapBqHienTai)}`, color: '#047857' },
      { title: 'HỆ SỐ KHOẢNG CÁCH MAX/MIN', val: `${macroMetrics.heSoKhoangCach} lần`, sub: 'Chủ tịch/GĐ so với Hỗ trợ (<3.5)', color: '#6d28d9' },
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
      ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText(c.val, cx + 16, cardY + 54);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Be Vietnam Pro", sans-serif';
      ctx.fillText(c.sub, cx + 16, cardY + 76);
    });

    // Bảng dữ liệu
    const tblY = 270;
    const colDefs = [
      { label: 'STT', w: 50, align: 'center' },
      { label: 'Họ và tên', w: 220, align: 'left' },
      { label: 'Chức danh', w: 180, align: 'left' },
      { label: 'Bậc', w: 60, align: 'center' },
      { label: 'Hệ số', w: 70, align: 'right' },
      { label: 'Lương Vị trí (L1)', w: 150, align: 'right' },
      { label: 'Lương KPI (L2)', w: 150, align: 'right' },
      { label: 'Khoán & PC', w: 130, align: 'right' },
      { label: 'Tiền thừa BH', w: 120, align: 'right' },
      { label: 'Gross Đề xuất', w: 160, align: 'right' },
      { label: 'Net Thực lĩnh', w: 160, align: 'right' },
      { label: 'Chi phí Quỹ', w: 170, align: 'right' },
      { label: 'Gross Cũ', w: 130, align: 'right' },
      { label: 'Chênh lệch', w: 100, align: 'right' }
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
        ctx.fillText(c.label, curX + c.w - 12, tblY + 22);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(c.label, curX + 12, tblY + 22);
      }
      curX += c.w;
    });

    let rowY = tblY + 36;
    simulationResults.forEach((r, idx) => {
      ctx.fillStyle = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(40, rowY, width - 80, 36);
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(40, rowY + 36);
      ctx.lineTo(width - 40, rowY + 36);
      ctx.stroke();

      const cells = [
        String(idx + 1),
        r.hoTen,
        r.chucDanh,
        `Bậc ${r.moPhong.bac || 1}`,
        r.moPhong.heSoLuong.toFixed(2),
        formatCurrency(r.moPhong.luongViTri),
        formatCurrency(r.moPhong.luongKpi),
        formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem),
        r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '0',
        formatCurrency(r.moPhong.tongGross),
        formatCurrency(r.moPhong.thucLinhNet),
        formatCurrency(r.moPhong.tongChiPhiQuy),
        formatCurrency(r.hienTai.tongGross),
        (r.chenhLechGross >= 0 ? '+' : '') + formatCurrency(r.chenhLechGross)
      ];

      curX = 40;
      cells.forEach((val, cIdx) => {
        if (cIdx === 1) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 9) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 10) {
          ctx.fillStyle = '#047857';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else if (cIdx === 13) {
          ctx.fillStyle = r.chenhLechGross >= 0 ? '#047857' : '#e11d48';
          ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        } else {
          ctx.fillStyle = '#334155';
          ctx.font = '11px "Be Vietnam Pro", sans-serif';
        }

        const c = colDefs[cIdx];
        if (c.align === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(val, curX + c.w / 2, rowY + 22);
        } else if (c.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(val, curX + c.w - 12, rowY + 22);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(val, curX + 12, rowY + 22);
        }
        curX += c.w;
      });

      rowY += 36;
    });

    // Dòng tổng
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, rowY, width - 80, 40);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TỔNG CỘNG (12 CBNV):', 52, rowY + 25);

    ctx.textAlign = 'right';
    const grossX = 40 + colDefs.slice(0, 10).reduce((s, c) => s + c.w, 0);
    ctx.fillText(formatCurrency(macroMetrics.tongGrossThangMoPhong), grossX - 12, rowY + 25);

    const netX = grossX + colDefs[10].w;
    ctx.fillStyle = '#047857';
    ctx.fillText(formatCurrency(macroMetrics.tongNetThangMoPhong), netX - 12, rowY + 25);

    const cpX = netX + colDefs[11].w;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0)), cpX - 12, rowY + 25);

    const cuX = cpX + colDefs[12].w;
    ctx.fillStyle = '#475569';
    ctx.fillText(formatCurrency(macroMetrics.tongGrossThangHienTai), cuX - 12, rowY + 25);

    const diffX = cuX + colDefs[13].w;
    ctx.fillStyle = '#047857';
    ctx.fillText(`+${formatCurrency(macroMetrics.tongGrossThangMoPhong - macroMetrics.tongGrossThangHienTai)}`, diffX - 12, rowY + 25);

    // Chân trang
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Be Vietnam Pro", sans-serif';
    ctx.fillText('HỆ THỐNG QUẢN TRỊ LƯƠNG 2027 PRO V3 • QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ • BẢO MẬT NỘI BỘ', width / 2, height - 25);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanScName = scenarioName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
      a.download = `Bang_Mo_Phong_Luong_${cleanScName}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Đồng bộ số liệu tương tác tức thì cho modal chi tiết 1 CBNV
  const activeInspectingRecord = useMemo(() => {
    if (!inspectingStaff) return null;
    return simulationResults.find(r => r.maNV === inspectingStaff.maNV) || inspectingStaff;
  }, [simulationResults, inspectingStaff]);

  return (
    <div className="space-y-6">
      {/* Banner Tiêu Đề Phân Hệ HĐQT */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy to-slate-800 rounded-2xl p-6 text-white shadow-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🏛️ PHÂN HỆ HỘI ĐỒNG QUẢN TRỊ & BAN GIÁM ĐỐC
              </span>
              <span className="text-xs text-slate-300">| QTDND Yên Thọ</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 tracking-tight">
              Mô Phỏng Lương & Các Khoản Theo Lương 4 Tầng Chi Tiết
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Mô hình tính toán định lượng chuẩn xác theo Luật BHXH 2024 & Luật Thuế TNCN: 
              Lương vị trí đóng BHXH, Lương năng suất KPI, 5 khoản phụ cấp khoán, trích nộp BHXH 23.5% của Quỹ và 10.5% của NLĐ, biểu thuế lũy tiến 7 bậc.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Xuất Excel */}
            <button
              onClick={exportToExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm border border-emerald-400/30"
              title="Xuất bảng đối soát 12 CBNV ra tệp Excel (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất Excel</span>
            </button>

            {/* 2. Xuất Ảnh PNG */}
            <button
              onClick={exportToImage}
              className="px-3 py-2 rounded-xl bg-sky-600/90 hover:bg-sky-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm border border-sky-400/30"
              title="Xuất ảnh chất lượng cao 2x gửi Zalo / Telegram"
            >
              <Image className="w-4 h-4 text-sky-200" />
              <span>Xuất Ảnh</span>
            </button>

            {/* 3. In Báo Cáo / Xuất PDF */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm border border-indigo-400/30"
              title="Mở bản in chuẩn A4 ngang và lưu file PDF"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>In Báo Cáo / PDF</span>
            </button>

            {/* 4. Tờ Trình HĐQT */}
            <button
              onClick={() => setActiveSubTab('proposal')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-brand-lime" />
              <span>Tờ Trình</span>
            </button>

            {/* 5. Lưu Kịch Bản */}
            <button
              onClick={handleSaveCurrentScenario}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-brand-lime hover:bg-lime-500 text-brand-navy font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang Lưu...' : 'Lưu Kịch Bản'}</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 rounded-lg text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Bộ Quản Lý Kịch Bản Mô Phỏng Động & Tùy Chọn Thuế */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-brand-lime" />
                <span>Kịch Bản Mô Phỏng:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/10">
                {customScenarios.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedScenarioId === sc.id
                        ? 'bg-brand-lime text-brand-navy font-bold shadow'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {sc.name}
                  </button>
                ))}
                {/* Nút Tạo Kịch Bản Mới */}
                <button
                  onClick={() => setShowNewScenarioModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 border border-dashed border-amber-400/40 flex items-center space-x-1 transition-all"
                  title="Tạo thêm kịch bản mô phỏng mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kịch Bản Mới</span>
                </button>
              </div>
            </div>

            {/* Bộ Chọn Chính Sách Giảm Trừ Thuế TNCN */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">Giảm trừ Thuế:</span>
              <div className="inline-flex rounded-xl bg-slate-900/60 p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setPitRegime('CURRENT')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    pitRegime === 'CURRENT'
                      ? 'bg-white text-slate-900 font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Hiện hành: 11 triệu bản thân, 4.4 triệu/NPT"
                >
                  Hiện hành (11tr / 4.4tr)
                </button>
                <button
                  onClick={() => setPitRegime('DRAFT')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    pitRegime === 'DRAFT'
                      ? 'bg-amber-400 text-brand-navy font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Dự thảo: 15 triệu bản thân, 6.2 triệu/NPT"
                >
                  Dự thảo mới (15tr / 6.2tr)
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Tabs điều hướng bên trong Phân hệ Mô phỏng */}
          <div className="inline-flex rounded-xl bg-slate-900/60 p-1 border border-white/10">
            {[
              { id: 'matrix', label: 'Bảng So Sánh 12 CBNV', icon: Users },
              { id: 'tuner', label: 'Bộ Tham Số Mô Phỏng', icon: Sliders },
              { id: 'sensitivity', label: 'Độ Nhạy Kinh Doanh', icon: BarChart3 },
              { id: 'proposal', label: 'Dự Thảo Tờ Trình', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-white text-slate-900 font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Thẻ KPI Vĩ Mô Phục Vụ Ra Quyết Định */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng Quỹ Lương & Chi Phí Năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Quỹ Lương & BH Năm</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatCurrency(macroMetrics.tongChiPhiNamMoPhong)}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            {macroMetrics.chenhLechChiPhiNam >= 0 ? (
              <span className="text-rose-600 font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{formatPercent(macroMetrics.phanTamChenhLechNam)}
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {formatPercent(macroMetrics.phanTamChenhLechNam)}
              </span>
            )}
            <span className="text-slate-400">
              ({macroMetrics.chenhLechChiPhiNam >= 0 ? '+' : ''}{formatCurrency(macroMetrics.chenhLechChiPhiNam)}/năm)
            </span>
          </div>
        </div>

        {/* Thẻ 2: Chi Phí BHXH Quỹ Phải Đóng Thêm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BHXH Đơn Vị Gánh Chịu</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatCurrency(macroMetrics.tongBhxhDonViNamMoPhong)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Mức 23.5% (BHXH, BHYT, BHTN, KPCĐ) của 12 CBNV
          </div>
        </div>

        {/* Thẻ 3: Thu Nhập Bình Quân Toàn Quỹ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thu Nhập BQ / Người</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-2 font-mono">
            {formatCurrency(macroMetrics.thuNhapBqMoPhong)}/tháng
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Hiện tại: <span className="font-semibold">{formatCurrency(macroMetrics.thuNhapBqHienTai)}</span>
          </div>
        </div>

        {/* Thẻ 4: Hệ Số Khoảng Cách Lương Max / Min */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ Số Khoảng Cách</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-purple-700 mt-2 font-mono">
            {macroMetrics.heSoKhoangCach} lần
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Chủ tịch / GĐ so với Bảo vệ (chuẩn an toàn &lt; 3.5)
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: BẢNG MA TRẬN SO SÁNH 12 CBNV */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          {/* Thanh Công Cụ & Bộ Lọc Phòng Ban */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-brand-navy" />
                Lọc Khối:
              </span>
              {[
                { id: 'ALL', label: 'Tất cả 12 CBNV' },
                { id: 'LANH_DAO', label: 'Khối Lãnh Đạo' },
                { id: 'TIN_DUNG', label: 'Khối Tín Dụng' },
                { id: 'KE_TOAN', label: 'Kế Toán & Ngân Quỹ' },
                { id: 'HO_TRO', label: 'Văn Phòng & Bảo Vệ' }
              ].map(flt => (
                <button
                  key={flt.id}
                  onClick={() => setDepartmentFilter(flt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    departmentFilter === flt.id
                      ? 'bg-brand-navy text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Công Cụ Quản Lý Mức Đóng BHXH Cá Nhân Hóa */}
              <div className="flex flex-wrap items-center gap-2 bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-xs">
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-extrabold text-emerald-950 text-[11px] block leading-tight">
                      BHXH Từng Người ({simulationResults.length} CBNV)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {bhxhStats.countSurplus > 0 ? (
                        <span className="text-emerald-900 font-bold">{bhxhStats.countSurplus} người hưởng tiền thừa</span>
                      ) : (
                        'Mỗi người đóng một mức riêng'
                      )}
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-emerald-300 hidden sm:block mx-1" />

                {/* Các nút thiết lập nhanh thử nghiệm */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleApplyBulkBhxh('PROFILE')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      bulkBhxhOption === 'INDIVIDUAL' || bulkBhxhOption === 'PROFILE'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Khôi phục mức đóng riêng của từng người đã đăng ký trong hồ sơ"
                  >
                    Theo Hồ Sơ Gốc
                  </button>
                  <button
                    onClick={() => handleApplyBulkBhxh('MIN_ZONE')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      bulkBhxhOption === 'MIN_ZONE'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Thử nghiệm: Tất cả đóng sàn 5Tr để hưởng tối đa tiền thừa"
                  >
                    Thử Sàn 5Tr
                  </button>
                  <button
                    onClick={() => handleApplyBulkBhxh('STANDARD')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      bulkBhxhOption === 'STANDARD'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Thử nghiệm: Tất cả đóng chuẩn 100% theo Lương Vị trí L1"
                  >
                    Thử Chuẩn L1
                  </button>
                </div>

                {/* Nút lưu mức BHXH vào Hồ Sơ CBNV */}
                <button
                  onClick={handleSaveBatchBhxhToStaff}
                  disabled={isSavingBhxh}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-extrabold flex items-center space-x-1 shadow-xs transition-colors ml-1 disabled:opacity-50"
                  title="Lưu 12 mức đóng BHXH trong bảng mô phỏng này vào hồ sơ CSDL DM_NS"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingBhxh ? 'Đang lưu...' : 'Lưu Vào Hồ Sơ'}</span>
                </button>
              </div>

              {/* Nút Xuất Báo Cáo Nhanh Trên Bảng */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={exportToExcel}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                  title="Xuất bảng đối soát 12 CBNV ra Excel (.xls)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={exportToImage}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                  title="Xuất ảnh PNG 2x gửi Zalo/Telegram"
                >
                  <Image className="w-3.5 h-3.5 text-sky-700" />
                  <span>Ảnh</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300 text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                  title="In báo cáo chuẩn A4 ngang hoặc lưu PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-700" />
                  <span>In / PDF</span>
                </button>
              </div>

              {/* Toggle Chế độ xem: Tóm Tắt vs Chi Tiết 4 Tầng */}
              <div className="flex items-center space-x-2">
                <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 text-xs">
                  <button
                    onClick={() => setDisplayMode('SUMMARY')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      displayMode === 'SUMMARY'
                        ? 'bg-white text-slate-900 font-bold shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tổng Hợp Đối Soát
                  </button>
                  <button
                    onClick={() => setDisplayMode('DETAILED')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      displayMode === 'DETAILED'
                        ? 'bg-brand-navy text-white font-bold shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chi Tiết 4 Tầng Lương
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thông báo kết quả lưu BHXH */}
          {bhxhSaveMsg && (
            <div className="mx-4 p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
              <span>{bhxhSaveMsg}</span>
              <button onClick={() => setBhxhSaveMsg('')} className="text-emerald-700 hover:text-emerald-950 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* CHẾ ĐỘ 1: BẢNG TỔNG HỢP ĐỐI SOÁT */}
          {displayMode === 'SUMMARY' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3">Mã NV</th>
                    <th className="p-3">Họ Và Tên</th>
                    <th className="p-3">Chức Vụ & Khối</th>
                    <th className="p-3 text-center">Hệ Số</th>
                    <th className="p-3 text-right bg-slate-200/60">Gross Cũ</th>
                    <th className="p-3 text-right bg-blue-50 text-blue-900">Lương Vị Trí (T1)</th>
                    <th className="p-3 text-right bg-blue-50 text-blue-900">Lương KPI (T2)</th>
                    <th className="p-3 text-right bg-blue-50 text-blue-900">Khoán & PC (T3)</th>
                    <th className="p-3 text-right bg-emerald-100/90 text-emerald-950 font-extrabold min-w-[170px]">Mức Đóng BHXH (Chỉnh Từng Người)</th>
                    <th className="p-3 text-right font-bold bg-amber-50 text-amber-900">Gross Đề Xuất</th>
                    <th className="p-3 text-right font-bold bg-emerald-50 text-emerald-900">Net Thực Lĩnh</th>
                    <th className="p-3 text-right font-bold">Chênh Lệch</th>
                    <th className="p-3 text-center">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map((r, idx) => (
                    <tr key={r.maNV} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                      <td className="p-3 font-mono text-slate-500 font-medium">{r.maNV}</td>
                      <td className="p-3 font-bold text-slate-900">{r.hoTen}</td>
                      <td className="p-3 text-slate-600">
                        <div>{r.chucDanh}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{r.phongBan}</div>
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                          {r.moPhong.heSoLuong.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600 bg-slate-100/40">
                        {formatCurrency(r.hienTai.tongGross)}
                      </td>
                      <td className="p-3 text-right font-mono text-blue-900 bg-blue-50/30">
                        {formatCurrency(r.moPhong.luongViTri)}
                      </td>
                      <td className="p-3 text-right font-mono text-blue-900 bg-blue-50/30">
                        <div>{formatCurrency(r.moPhong.luongKpi)}</div>
                        <div className="text-[10px] text-blue-600 font-sans font-medium">({r.deptRatio}% KPI)</div>
                      </td>
                      <td className="p-3 text-right font-mono text-blue-900 bg-blue-50/30">
                        {formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem)}
                      </td>
                      <td className="p-2.5 text-right bg-emerald-50/20 border-x border-emerald-100/60">
                        <div className="flex flex-col items-end space-y-1">
                          {/* Ô nhập tiền trực tiếp cho cá nhân */}
                          <div className="flex items-center space-x-1 justify-end">
                            <input
                              type="number"
                              step="500000"
                              min="2340000"
                              max="46800000"
                              value={r.moPhong.luongDongBhxhThucTe || ''}
                              onChange={(e) => handleUpdateStaffBhxh(r.maNV, 'CUSTOM', e.target.value)}
                              className="w-28 px-2 py-1 text-right text-xs font-numeric font-bold border border-emerald-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                              title={`Mức lương đóng BHXH của ${r.hoTen}`}
                            />
                            <span className="text-[11px] font-semibold text-slate-500">₫</span>
                          </div>

                          {/* Các nút chọn nhanh cho cá nhân */}
                          <div className="flex items-center space-x-1 justify-end">
                            <button
                              type="button"
                              onClick={() => handleUpdateStaffBhxh(r.maNV, 'MIN', 5000000)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                r.moPhong.luongDongBhxhThucTe === 5000000
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                              }`}
                              title="Chọn mức sàn 5.000.000 ₫ để hưởng tối đa tiền thừa"
                            >
                              Sàn 5Tr
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStaffBhxh(r.maNV, 'STANDARD', r.moPhong.luongDongBhxhChuan)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                r.moPhong.luongDongBhxhThucTe === r.moPhong.luongDongBhxhChuan && r.moPhong.tienThuaBhxhHuong === 0
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                              }`}
                              title={`Đóng theo chuẩn L1 (${formatShort(r.moPhong.luongDongBhxhChuan)})`}
                            >
                              L1
                            </button>

                            {r.empBhxhGoc > 0 && r.empBhxhGoc !== 5000000 && r.empBhxhGoc !== r.moPhong.luongDongBhxhChuan && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStaffBhxh(r.maNV, 'CUSTOM', r.empBhxhGoc)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                  r.moPhong.luongDongBhxhThucTe === r.empBhxhGoc
                                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                    : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                                }`}
                                title={`Khôi phục mức hồ sơ (${formatShort(r.empBhxhGoc)})`}
                              >
                                Hồ sơ
                              </button>
                            )}
                          </div>

                          {/* Hiển thị số tiền thừa hoặc chuẩn L1 */}
                          {r.moPhong.tienThuaBhxhHuong > 0 ? (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 font-numeric">
                              +{formatCurrency(r.moPhong.tienThuaBhxhHuong)} (Thừa)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-sans">Đủ chuẩn L1</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-900 bg-amber-50/40">
                        {formatCurrency(r.moPhong.tongGross)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50">
                        {formatCurrency(r.moPhong.thucLinhNet)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {r.chenhLechGross >= 0 ? (
                          <span className="text-emerald-600 flex items-center justify-end">
                            +{formatCurrency(r.chenhLechGross)}
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center justify-end">
                            {formatCurrency(r.chenhLechGross)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setInspectingStaff(r)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-600 transition-colors"
                          title="Xem Phiếu Lương Mô Phỏng Chi Tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="p-3 text-right uppercase text-slate-700">Tổng Toàn Cơ Quan:</td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {formatCurrency(macroMetrics.tongGrossThangHienTai)}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-900">
                      {formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-900">
                      {formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-900">
                      {formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800">
                      {macroMetrics.tongTienThuaBhxhThangMoPhong > 0 && `+${formatCurrency(macroMetrics.tongTienThuaBhxhThangMoPhong)}`}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-900">
                      {formatCurrency(macroMetrics.tongGrossThangMoPhong)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-900">
                      {formatCurrency(macroMetrics.tongNetThangMoPhong)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700">
                      +{formatCurrency(macroMetrics.tongGrossThangMoPhong - macroMetrics.tongGrossThangHienTai)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* CHẾ ĐỘ 2: BẢNG CHI TIẾT 4 TẦNG LƯƠNG & CÁC KHOẢN THEO LƯƠNG */}
          {displayMode === 'DETAILED' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-brand-navy text-white font-bold border-b border-slate-700">
                    <th colSpan={3} className="p-2.5 text-center border-r border-slate-600">HỒ SƠ CBNV</th>
                    <th colSpan={3} className="p-2.5 text-center border-r border-slate-600 bg-blue-900">TẦNG 1 & 2 (LƯƠNG & KPI)</th>
                    <th colSpan={5} className="p-2.5 text-center border-r border-slate-600 bg-slate-800">TẦNG 3 (PHỤ CẤP KHOÁN CHI)</th>
                    <th colSpan={6} className="p-2.5 text-center border-r border-slate-600 bg-rose-950">TẦNG 4 (BHXH, TIỀN THỪA & THUẾ)</th>
                    <th colSpan={3} className="p-2.5 text-center bg-emerald-950">KẾT QUẢ THỰC CHI</th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                    <th className="p-2 border-r">Mã</th>
                    <th className="p-2 border-r min-w-[120px]">Họ Tên</th>
                    <th className="p-2 border-r">Chức Danh</th>

                    {/* Tầng 1 & 2 */}
                    <th className="p-2 text-right border-r bg-blue-50/70">Lương Vị Trí (T1)</th>
                    <th className="p-2 text-right border-r bg-blue-50/70">Lương KPI (T2)</th>
                    <th className="p-2 text-right border-r bg-blue-50/70">Phụ Cấp TN</th>

                    {/* Tầng 3 */}
                    <th className="p-2 text-right border-r">Ăn Trưa</th>
                    <th className="p-2 text-right border-r">Xăng Xe</th>
                    <th className="p-2 text-right border-r">Điện Thoại</th>
                    <th className="p-2 text-right border-r">Trang Phục</th>
                    <th className="p-2 text-right border-r">Độc Hại</th>

                    {/* Tầng 4 */}
                    <th className="p-2 text-right border-r bg-emerald-100 text-emerald-950 font-extrabold min-w-[155px]">Lương Đóng BH (Chỉnh)</th>
                    <th className="p-2 text-right border-r bg-emerald-50 text-emerald-800 font-bold">Thừa Quỹ Trả</th>
                    <th className="p-2 text-right border-r font-bold bg-amber-50">Gross</th>
                    <th className="p-2 text-right border-r text-rose-700">BHXH NLĐ (10.5%)</th>
                    <th className="p-2 text-right border-r text-slate-600">Đoàn Phí (1%)</th>
                    <th className="p-2 text-right border-r text-rose-700">Thuế TNCN</th>

                    {/* Kết quả */}
                    <th className="p-2 text-right border-r font-bold text-emerald-800 bg-emerald-50">Thực Lĩnh Net</th>
                    <th className="p-2 text-right border-r text-amber-700">BHXH Quỹ (23.5%)</th>
                    <th className="p-2 text-right font-bold text-brand-navy bg-slate-100">Tổng Chi Quỹ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredResults.map((r, idx) => (
                    <tr key={r.maNV} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <td className="p-2 font-mono text-slate-500 border-r">{r.maNV}</td>
                      <td className="p-2 font-bold text-slate-900 border-r">{r.hoTen}</td>
                      <td className="p-2 text-slate-600 border-r">{r.chucDanh}</td>

                      {/* Tầng 1 & 2 */}
                      <td className="p-2 text-right font-mono bg-blue-50/30 border-r">{formatCurrency(r.moPhong.luongViTri)}</td>
                      <td className="p-2 text-right font-mono bg-blue-50/30 border-r">
                        <div>{formatCurrency(r.moPhong.luongKpi)}</div>
                        <div className="text-[9px] text-blue-600 font-sans">({r.deptRatio}%)</div>
                      </td>
                      <td className="p-2 text-right font-mono bg-blue-50/30 border-r">{formatCurrency(r.moPhong.khoanTrachNhiem)}</td>

                      {/* Tầng 3 */}
                      <td className="p-2 text-right font-mono border-r">{formatCurrency(r.moPhong.khoanAnTrua)}</td>
                      <td className="p-2 text-right font-mono border-r">{formatCurrency(r.moPhong.khoanXangXe)}</td>
                      <td className="p-2 text-right font-mono border-r">{formatCurrency(r.moPhong.khoanDienThoai)}</td>
                      <td className="p-2 text-right font-mono border-r">{formatCurrency(r.moPhong.khoanTrangPhuc)}</td>
                      <td className="p-2 text-right font-mono border-r">{formatCurrency(r.moPhong.khoanDocHai)}</td>

                      {/* Tầng 4 */}
                      <td className="p-2 text-right font-numeric bg-emerald-50/30 border-r">
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center space-x-1 justify-end">
                            <input
                              type="number"
                              step="500000"
                              min="2340000"
                              max="46800000"
                              value={r.moPhong.luongDongBhxhThucTe || ''}
                              onChange={(e) => handleUpdateStaffBhxh(r.maNV, 'CUSTOM', e.target.value)}
                              className="w-24 px-1.5 py-0.5 text-right text-[11px] font-numeric font-bold border border-emerald-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                              title={`Chỉnh mức đóng BHXH của ${r.hoTen}`}
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">₫</span>
                          </div>
                          <div className="flex items-center space-x-1 justify-end">
                            <button
                              type="button"
                              onClick={() => handleUpdateStaffBhxh(r.maNV, 'MIN', 5000000)}
                              className={`px-1 py-0.2 rounded text-[9px] font-bold border transition-all ${
                                r.moPhong.luongDongBhxhThucTe === 5000000
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                              }`}
                              title="Sàn 5Tr"
                            >
                              5Tr
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStaffBhxh(r.maNV, 'STANDARD', r.moPhong.luongDongBhxhChuan)}
                              className={`px-1 py-0.2 rounded text-[9px] font-bold border transition-all ${
                                r.moPhong.luongDongBhxhThucTe === r.moPhong.luongDongBhxhChuan && r.moPhong.tienThuaBhxhHuong === 0
                                  ? 'bg-blue-600 text-white border-blue-700'
                                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                              }`}
                              title={`Theo L1 (${formatShort(r.moPhong.luongDongBhxhChuan)})`}
                            >
                              L1
                            </button>
                            {r.empBhxhGoc > 0 && r.empBhxhGoc !== 5000000 && r.empBhxhGoc !== r.moPhong.luongDongBhxhChuan && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStaffBhxh(r.maNV, 'CUSTOM', r.empBhxhGoc)}
                                className={`px-1 py-0.2 rounded text-[9px] font-bold border transition-all ${
                                  r.moPhong.luongDongBhxhThucTe === r.empBhxhGoc
                                    ? 'bg-purple-600 text-white border-purple-700'
                                    : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                                }`}
                                title={`Khôi phục hồ sơ (${formatShort(r.empBhxhGoc)})`}
                              >
                                HS
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-right font-mono bg-emerald-50/40 border-r font-bold text-emerald-800">
                        {r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold bg-amber-50/50 border-r text-amber-900">{formatCurrency(r.moPhong.tongGross)}</td>
                      <td className="p-2 text-right font-mono text-rose-700 border-r">{formatCurrency(r.moPhong.bhxhNld)}</td>
                      <td className="p-2 text-right font-mono text-slate-600 border-r">{formatCurrency(r.moPhong.doanPhiNld)}</td>
                      <td className="p-2 text-right font-mono text-rose-700 border-r font-semibold">{formatCurrency(r.moPhong.thueTncn)}</td>

                      {/* Kết quả */}
                      <td className="p-2 text-right font-mono font-bold text-emerald-800 bg-emerald-50/60 border-r">{formatCurrency(r.moPhong.thucLinhNet)}</td>
                      <td className="p-2 text-right font-mono text-amber-800 border-r">{formatCurrency(r.moPhong.bhxhDonVi)}</td>
                      <td className="p-2 text-right font-mono font-bold text-brand-navy bg-slate-100/60">{formatCurrency(r.moPhong.tongChiPhiQuy)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200/80 font-bold border-t-2 border-slate-400 text-[11px]">
                    <td colSpan={3} className="p-2 text-right uppercase text-slate-800">TỔNG TOÀN CƠ QUAN:</td>
                    <td className="p-2 text-right font-mono text-blue-900">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}</td>
                    <td className="p-2 text-right font-mono text-blue-900">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}</td>
                    <td className="p-2 text-right font-mono text-blue-900">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.khoanTrachNhiem, 0))}</td>
                    <td colSpan={5} className="p-2 text-center text-slate-500 italic">5 Khoản phụ cấp khoán công vụ</td>
                    <td className="p-2 text-right font-mono text-slate-800">-</td>
                    <td className="p-2 text-right font-mono text-emerald-800 font-bold">
                      {macroMetrics.tongTienThuaBhxhThangMoPhong > 0 && `+${formatCurrency(macroMetrics.tongTienThuaBhxhThangMoPhong)}`}
                    </td>
                    <td className="p-2 text-right font-mono text-amber-900">{formatCurrency(macroMetrics.tongGrossThangMoPhong)}</td>
                    <td className="p-2 text-right font-mono text-rose-800">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.bhxhNld, 0))}</td>
                    <td className="p-2 text-right font-mono text-slate-700">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.doanPhiNld, 0))}</td>
                    <td className="p-2 text-right font-mono text-rose-800">{formatCurrency(macroMetrics.tongThueTncnThangMoPhong)}</td>
                    <td className="p-2 text-right font-mono text-emerald-900">{formatCurrency(macroMetrics.tongNetThangMoPhong)}</td>
                    <td className="p-2 text-right font-mono text-amber-900">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.bhxhDonVi, 0))}</td>
                    <td className="p-2 text-right font-mono text-brand-navy">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BỘ ĐIỀU KHIỂN THAM SỐ TOÀN DIỆN (TUNER) - NHẬP TAY CHUYÊN NGHIỆP */}
      {activeSubTab === 'tuner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Lương Cơ Sở & Quỹ Thưởng Năm */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-brand-navy" />
              <span>1. Lương Cơ Sở & Quỹ Thưởng Năm</span>
            </h3>

            {/* Lương cơ sở nội bộ */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Mức Lương Cơ Sở Nội Bộ QTD:</span>
                <span className="font-numeric font-bold text-brand-navy bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {formatCurrency(luongCoSo)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setLuongCoSo(prev => Math.max(1500000, prev - 50000))}
                  className="btn-step px-3 py-2 text-xs"
                  title="Giảm 50.000 ₫"
                >
                  - 50k
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="10000"
                    min="1500000"
                    max="5000000"
                    value={luongCoSo}
                    onChange={(e) => setLuongCoSo(Number(e.target.value) || 0)}
                    className="w-full money-input text-sm py-2 pr-10"
                    placeholder="Nhập mức lương..."
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLuongCoSo(prev => Math.min(5000000, prev + 50000))}
                  className="btn-step px-3 py-2 text-xs text-brand-navy"
                  title="Tăng 50.000 ₫"
                >
                  + 50k
                </button>
              </div>
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý:</span>
                {[
                  { label: '2.340.000 ₫ (Hiện hành)', val: 2340000 },
                  { label: '2.500.000 ₫ (PA2 Chuẩn)', val: 2500000 },
                  { label: '3.000.000 ₫ (Mục tiêu)', val: 3000000 },
                  { label: '3.500.000 ₫ (Đột phá)', val: 3500000 },
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setLuongCoSo(p.val)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      luongCoSo === p.val
                        ? 'bg-brand-navy text-white border-brand-navy font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trần KPI */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Tỷ Lệ Trần Quỹ Lương KPI:</span>
                <span className="font-numeric font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {tranKpi}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTranKpi(prev => Math.max(50, prev - 5))}
                  className="btn-step px-3 py-2 text-xs"
                  title="Giảm 5%"
                >
                  - 5%
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="200"
                    value={tranKpi}
                    onChange={(e) => setTranKpi(Number(e.target.value) || 0)}
                    className="w-full percent-input text-sm py-2 pr-8 font-bold"
                    placeholder="Nhập %..."
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTranKpi(prev => Math.min(200, prev + 5))}
                  className="btn-step px-3 py-2 text-xs text-emerald-700 font-bold"
                  title="Tăng 5%"
                >
                  + 5%
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: '80% (Khủng hoảng)', val: 80 },
                  { label: '100% (Chuẩn kế hoạch)', val: 100 },
                  { label: '120% (Tăng trưởng tốt)', val: 120 },
                  { label: '150% (Xuất sắc)', val: 150 },
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setTranKpi(p.val)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                      tranKpi === p.val
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quỹ Khen thưởng năm */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Hạn Mức Quỹ Thưởng Năm:</span>
                <span className="font-numeric font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                  {formatCurrency(quyThuongNam)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuyThuongNam(prev => Math.max(50000000, prev - 10000000))}
                  className="btn-step px-3 py-2 text-xs"
                  title="Giảm 10 Triệu"
                >
                  - 10 Tr
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="5000000"
                    min="50000000"
                    max="1000000000"
                    value={quyThuongNam}
                    onChange={(e) => setQuyThuongNam(Number(e.target.value) || 0)}
                    className="w-full money-input text-sm py-2 pr-10 text-purple-900"
                    placeholder="Nhập số tiền..."
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuyThuongNam(prev => Math.min(1000000000, prev + 10000000))}
                  className="btn-step px-3 py-2 text-xs text-purple-700 font-bold"
                  title="Tăng 10 Triệu"
                >
                  + 10 Tr
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[150000000, 250000000, 350000000, 500000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuyThuongNam(val)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                      quyThuongNam === val
                        ? 'bg-purple-700 text-white border-purple-700 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val / 1000000} Triệu
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: % Kết Cấu Lương KPI Theo 4 Khối Nghiệp Vụ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-emerald-700" />
                  <span>2. % Kết Cấu Lương KPI Theo 4 Khối (Nhập Tay 100%)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Nhập số % trực tiếp bằng tay hoặc dùng nút bước nhảy. Tuyệt đối không dùng thanh kéo trượt (slider).
                </p>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px]">
                <button
                  onClick={() => setKpiCalcMethod('DEPT_RATIO')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    kpiCalcMethod === 'DEPT_RATIO' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  % Kết cấu khối
                </button>
                <button
                  onClick={() => setKpiCalcMethod('FIXED_PRICE')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    kpiCalcMethod === 'FIXED_PRICE' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đơn giá cố định
                </button>
              </div>
            </div>

            {kpiCalcMethod === 'DEPT_RATIO' ? (
              <div className="space-y-3.5">
                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  💡 <strong>Cơ cấu lương mục tiêu:</strong> Ở mức 100% KPI, tỷ lệ Lương KPI (L2) trên Lương vị trí (L1) = %KPI / (100 - %KPI). Toàn bộ tỷ lệ được nhập tay trực tiếp.
                </div>

                {/* Khối Lãnh đạo */}
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">1. Khối Lãnh Đạo & Điều Hành:</span>
                    <span className="font-numeric font-bold text-brand-navy text-xs">
                      {deptKpiRatios.LANH_DAO}% KPI ({100 - deptKpiRatios.LANH_DAO}% Vị trí)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, LANH_DAO: Math.max(5, prev.LANH_DAO - 5) }))}
                      className="btn-step px-2.5 py-1 text-xs"
                    >
                      - 5%
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="5"
                        max="80"
                        step="1"
                        value={deptKpiRatios.LANH_DAO}
                        onChange={(e) => setDeptKpiRatios(prev => ({ ...prev, LANH_DAO: Math.min(80, Math.max(5, Number(e.target.value) || 0)) }))}
                        className="w-full percent-input text-sm py-1.5 pr-7 font-bold text-brand-navy"
                        placeholder="Nhập % Lãnh đạo"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, LANH_DAO: Math.min(80, prev.LANH_DAO + 5) }))}
                      className="btn-step px-2.5 py-1 text-xs text-brand-navy font-bold"
                    >
                      + 5%
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    <span className="text-slate-500 font-medium">
                      Lương KPI chuẩn = {((deptKpiRatios.LANH_DAO / (100 - deptKpiRatios.LANH_DAO))).toFixed(2)}x Lương Vị trí
                    </span>
                    <div className="flex items-center space-x-1">
                      {[
                        { val: 30, label: '30%' },
                        { val: 40, label: '40% (Chuẩn)' },
                        { val: 50, label: '50%' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setDeptKpiRatios(prev => ({ ...prev, LANH_DAO: opt.val }))}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            deptKpiRatios.LANH_DAO === opt.val
                              ? 'bg-brand-navy text-white border-brand-navy'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Khối Tín dụng */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-emerald-950">2. Khối Tín Dụng & Khai Thác:</span>
                    <span className="font-numeric font-bold text-emerald-800 text-xs">
                      {deptKpiRatios.TIN_DUNG}% KPI ({100 - deptKpiRatios.TIN_DUNG}% Vị trí)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, TIN_DUNG: Math.max(10, prev.TIN_DUNG - 5) }))}
                      className="btn-step px-2.5 py-1 text-xs"
                    >
                      - 5%
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="10"
                        max="85"
                        step="1"
                        value={deptKpiRatios.TIN_DUNG}
                        onChange={(e) => setDeptKpiRatios(prev => ({ ...prev, TIN_DUNG: Math.min(85, Math.max(10, Number(e.target.value) || 0)) }))}
                        className="w-full percent-input text-sm py-1.5 pr-7 font-bold text-emerald-800"
                        placeholder="Nhập % Tín dụng"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, TIN_DUNG: Math.min(85, prev.TIN_DUNG + 5) }))}
                      className="btn-step px-2.5 py-1 text-xs text-emerald-700 font-bold"
                    >
                      + 5%
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    <span className="text-emerald-700 font-medium">
                      Lương KPI chuẩn = {((deptKpiRatios.TIN_DUNG / (100 - deptKpiRatios.TIN_DUNG))).toFixed(2)}x Lương Vị trí (Kinh doanh)
                    </span>
                    <div className="flex items-center space-x-1">
                      {[
                        { val: 40, label: '40%' },
                        { val: 50, label: '50% (Chuẩn)' },
                        { val: 60, label: '60%' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setDeptKpiRatios(prev => ({ ...prev, TIN_DUNG: opt.val }))}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            deptKpiRatios.TIN_DUNG === opt.val
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Khối Kế toán */}
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-blue-950">3. Khối Kế Toán & Ngân Quỹ:</span>
                    <span className="font-numeric font-bold text-blue-800 text-xs">
                      {deptKpiRatios.KE_TOAN}% KPI ({100 - deptKpiRatios.KE_TOAN}% Vị trí)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, KE_TOAN: Math.max(5, prev.KE_TOAN - 5) }))}
                      className="btn-step px-2.5 py-1 text-xs"
                    >
                      - 5%
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="5"
                        max="70"
                        step="1"
                        value={deptKpiRatios.KE_TOAN}
                        onChange={(e) => setDeptKpiRatios(prev => ({ ...prev, KE_TOAN: Math.min(70, Math.max(5, Number(e.target.value) || 0)) }))}
                        className="w-full percent-input text-sm py-1.5 pr-7 font-bold text-blue-800"
                        placeholder="Nhập % Kế toán"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, KE_TOAN: Math.min(70, prev.KE_TOAN + 5) }))}
                      className="btn-step px-2.5 py-1 text-xs text-blue-700 font-bold"
                    >
                      + 5%
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    <span className="text-blue-700 font-medium">
                      Lương KPI chuẩn = {((deptKpiRatios.KE_TOAN / (100 - deptKpiRatios.KE_TOAN))).toFixed(2)}x Lương Vị trí (Tác nghiệp quầy)
                    </span>
                    <div className="flex items-center space-x-1">
                      {[
                        { val: 25, label: '25%' },
                        { val: 35, label: '35% (Chuẩn)' },
                        { val: 45, label: '45%' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setDeptKpiRatios(prev => ({ ...prev, KE_TOAN: opt.val }))}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            deptKpiRatios.KE_TOAN === opt.val
                              ? 'bg-blue-700 text-white border-blue-800'
                              : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Khối Hỗ trợ */}
                <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-purple-950">4. Khối Văn Phòng & Hỗ Trợ:</span>
                    <span className="font-numeric font-bold text-purple-800 text-xs">
                      {deptKpiRatios.HO_TRO}% KPI ({100 - deptKpiRatios.HO_TRO}% Vị trí)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, HO_TRO: Math.max(5, prev.HO_TRO - 5) }))}
                      className="btn-step px-2.5 py-1 text-xs"
                    >
                      - 5%
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="5"
                        max="60"
                        step="1"
                        value={deptKpiRatios.HO_TRO}
                        onChange={(e) => setDeptKpiRatios(prev => ({ ...prev, HO_TRO: Math.min(60, Math.max(5, Number(e.target.value) || 0)) }))}
                        className="w-full percent-input text-sm py-1.5 pr-7 font-bold text-purple-800"
                        placeholder="Nhập % Hỗ trợ"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeptKpiRatios(prev => ({ ...prev, HO_TRO: Math.min(60, prev.HO_TRO + 5) }))}
                      className="btn-step px-2.5 py-1 text-xs text-purple-700 font-bold"
                    >
                      + 5%
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    <span className="text-purple-700 font-medium">
                      Lương KPI chuẩn = {((deptKpiRatios.HO_TRO / (100 - deptKpiRatios.HO_TRO))).toFixed(2)}x Lương Vị trí (Phục vụ)
                    </span>
                    <div className="flex items-center space-x-1">
                      {[
                        { val: 15, label: '15%' },
                        { val: 20, label: '20% (Chuẩn)' },
                        { val: 25, label: '25%' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setDeptKpiRatios(prev => ({ ...prev, HO_TRO: opt.val }))}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            deptKpiRatios.HO_TRO === opt.val
                              ? 'bg-purple-700 text-white border-purple-800'
                              : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Đơn Giá Lương KPI Cơ Bản (Hệ số 1.0):</span>
                    <span className="font-numeric font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {formatCurrency(donGiaKpiCoBan)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDonGiaKpiCoBan(prev => Math.max(1000000, prev - 200000))}
                      className="btn-step px-3 py-2 text-xs"
                    >
                      - 200k
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="100000"
                        min="1000000"
                        max="10000000"
                        value={donGiaKpiCoBan}
                        onChange={(e) => setDonGiaKpiCoBan(Number(e.target.value) || 0)}
                        className="w-full money-input text-sm py-2 pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDonGiaKpiCoBan(prev => Math.min(10000000, prev + 200000))}
                      className="btn-step px-3 py-2 text-xs text-blue-700 font-bold"
                    >
                      + 200k
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Chính Sách Đóng BHXH & Hưởng Tiền Thừa Doanh Nghiệp Trả */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              <span>3. Chính Sách BHXH & Quyền Hưởng Tiền Thừa DN Trả</span>
            </h3>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed">
              <div className="font-bold flex items-center mb-1 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                Cơ chế tài chính minh bạch:
              </div>
              Quỹ xác định định mức bảo hiểm chuẩn 23.5% theo Lương vị trí (L1). Cán bộ có quyền chọn mức đóng BHXH thực tế thấp hơn. 
              Phần chênh lệch 23.5% Quỹ không phải nộp cho cơ quan BHXH được chuyển trả thẳng vào thu nhập của người lao động.
              <div className="mt-1 font-semibold text-emerald-800">
                👉 Tổng chi phí Quỹ bảo toàn 100%, không phát sinh vượt ngân sách!
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Áp dụng chính sách nhanh cho toàn cơ quan:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplyBulkBhxh('STANDARD')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bulkBhxhOption === 'STANDARD'
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">100% Đóng Theo Lương Vị Trí</div>
                  <div className="text-[10px] mt-0.5 opacity-80">Đóng đủ để hưởng lương hưu tối đa</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyBulkBhxh('MIN_ZONE')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bulkBhxhOption === 'MIN_ZONE'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">100% Đóng Mức Sàn 5.000.000 ₫</div>
                  <div className="text-[10px] mt-0.5 opacity-80">Tối đa hóa tiền mặt nhận về tài khoản</div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
              <span className="font-medium text-slate-600">Tổng tiền thừa Quỹ hoàn trả cho NLĐ:</span>
              <span className="font-numeric font-bold text-emerald-700 text-sm">
                +{formatCurrency(macroMetrics.tongTienThuaBhxhThangMoPhong)}/tháng
              </span>
            </div>
          </div>

          {/* Card 4: Định Mức 5 Khoản Phụ Cấp Khoán Công Vụ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-brand-lime" />
              <span>4. Định Mức 5 Khoản Phụ Cấp Khoán Công Vụ</span>
            </h3>

            {/* Ăn ca */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Tiền Ăn Giữa Ca (Ăn trưa):</span>
                <span className="font-numeric font-bold text-slate-900">{formatCurrency(anTrua)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAnTrua(prev => Math.max(500000, prev - 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs"
                >
                  - 50k
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="50000"
                    min="500000"
                    max="2000000"
                    value={anTrua}
                    onChange={(e) => setAnTrua(Number(e.target.value) || 0)}
                    className="w-full money-input text-xs py-1.5 pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnTrua(prev => Math.min(2000000, prev + 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs text-brand-navy font-bold"
                >
                  + 50k
                </button>
              </div>
              <div className="text-[10px] text-slate-400">
                Trần miễn thuế TNCN: 730.000 ₫/tháng (Phần vượt chịu thuế TNCN; Không đóng BHXH)
              </div>
            </div>

            {/* Xăng xe */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Khoán Xăng Xe Công Tác (Cơ bản):</span>
                <span className="font-numeric font-bold text-slate-900">{formatCurrency(xangXe)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setXangXe(prev => Math.max(200000, prev - 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs"
                >
                  - 50k
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="50000"
                    min="200000"
                    max="2000000"
                    value={xangXe}
                    onChange={(e) => setXangXe(Number(e.target.value) || 0)}
                    className="w-full money-input text-xs py-1.5 pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setXangXe(prev => Math.min(2000000, prev + 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs text-brand-navy font-bold"
                >
                  + 50k
                </button>
              </div>
              <div className="text-[10px] text-slate-400">
                Cán bộ Tín dụng tự động nhân hệ số 1.5; Lãnh đạo nhân 1.2
              </div>
            </div>

            {/* Điện thoại */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Khoán Cước Điện Thoại:</span>
                <span className="font-numeric font-bold text-slate-900">{formatCurrency(dienThoai)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDienThoai(prev => Math.max(100000, prev - 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs"
                >
                  - 50k
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="50000"
                    min="100000"
                    max="1500000"
                    value={dienThoai}
                    onChange={(e) => setDienThoai(Number(e.target.value) || 0)}
                    className="w-full money-input text-xs py-1.5 pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDienThoai(prev => Math.min(1500000, prev + 50000))}
                  className="btn-step px-2.5 py-1.5 text-xs text-brand-navy font-bold"
                >
                  + 50k
                </button>
              </div>
            </div>

            {/* Trang phục */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Khoán Trang Phục Công Tác:</span>
                <span className="font-numeric font-bold text-slate-900">{formatCurrency(trangPhuc)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTrangPhuc(prev => Math.max(100000, prev - 20000))}
                  className="btn-step px-2.5 py-1.5 text-xs"
                >
                  - 20k
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="20000"
                    min="100000"
                    max="1000000"
                    value={trangPhuc}
                    onChange={(e) => setTrangPhuc(Number(e.target.value) || 0)}
                    className="w-full money-input text-xs py-1.5 pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold pointer-events-none">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrangPhuc(prev => Math.min(1000000, prev + 20000))}
                  className="btn-step px-2.5 py-1.5 text-xs text-brand-navy font-bold"
                >
                  + 20k
                </button>
              </div>
              <div className="text-[10px] text-slate-400">
                Trần miễn thuế bằng tiền mặt: 5.000.000 ₫/năm (~416.666 ₫/tháng)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ĐỘ NHẠY KINH DOANH (STRESS-TEST) */}
      {activeSubTab === 'sensitivity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-brand-navy" />
              <span>Kiểm Tra Độ Nhạy & Khả Năng Chịu Tải Tài Chính Của Quỹ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thử nghiệm tình huống kinh doanh biến động (doanh thu lãi vay, tăng trưởng dư nợ) tác động tới quỹ lương thực tế
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Giả định Mức Độ Hoàn Thành Kế Hoạch Kinh Doanh:</span>
              <span className="text-base font-bold text-brand-navy">{sensitivityFactor}% Kế Hoạch</span>
            </div>
            <div className="flex items-center space-x-3">
              {[
                { val: 80, label: 'Kịch bản Thấp (80%)', color: 'text-rose-600' },
                { val: 100, label: 'Kịch bản Chuẩn (100%)', color: 'text-blue-600' },
                { val: 120, label: 'Kịch bản Vượt (120%)', color: 'text-emerald-600' },
                { val: 140, label: 'Kịch bản Đột Phá (140%)', color: 'text-purple-600' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setSensitivityFactor(opt.val)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    sensitivityFactor === opt.val
                      ? 'bg-brand-navy text-white border-brand-navy shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bảng so sánh 3 kịch bản độ nhạy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold">Tình Huống 80% Kế Hoạch</div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(macroMetrics.tongChiPhiNamMoPhong * 0.88)}
              </div>
              <div className="text-xs text-emerald-600 font-medium">An toàn tuyệt đối, Quỹ vẫn có lãi thặng dư</div>
            </div>

            <div className="p-4 rounded-xl border-2 border-brand-navy bg-blue-50/40 space-y-2">
              <div className="text-xs text-brand-navy font-bold">Tình Huống 100% Kế Hoạch (Cơ sở)</div>
              <div className="text-lg font-bold font-mono text-brand-navy">
                {formatCurrency(macroMetrics.tongChiPhiNamMoPhong)}
              </div>
              <div className="text-xs text-slate-600 font-medium">Cân bằng hoàn hảo giữa thu nhập và tăng trưởng quỹ</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold">Tình Huống 120% Kế Hoạch</div>
              <div className="text-lg font-bold font-mono text-emerald-700">
                {formatCurrency(macroMetrics.tongChiPhiNamMoPhong * 1.14)}
              </div>
              <div className="text-xs text-emerald-600 font-medium">Thu nhập CBNV tăng mạnh, tỷ lệ nợ xấu được kiểm soát</div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DỰ THẢO TỜ TRÌNH HĐQT */}
      {activeSubTab === 'proposal' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-800">
          {/* Header Văn Bản Hành Chính */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 text-xs leading-relaxed">
            <div className="text-center font-bold">
              <div>QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ</div>
              <div className="text-[11px] font-normal text-slate-600">Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá</div>
              <div className="text-[11px] mt-1 font-semibold">Số: ..... /TTr-QTDYT</div>
            </div>
            <div className="text-center font-bold">
              <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-semibold underline">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] font-normal italic mt-1">Quý Lộc, ngày ..... tháng ..... năm 2027</div>
            </div>
          </div>

          {/* Tiêu đề tờ trình */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wide">
              TỜ TRÌNH
            </h2>
            <div className="font-bold text-sm">
              V/v Thông qua Phương án phân phối quỹ tiền lương, phụ cấp khoán và tiền thưởng năm 2027 (Đề án 2027 Pro V2)
            </div>
            <div className="text-xs italic text-slate-600">
              Kính gửi: Hội đồng Quản trị Quỹ Tín dụng Nhân dân Yên Thọ
            </div>
          </div>

          {/* Nội dung căn cứ */}
          <div className="text-xs space-y-3 leading-relaxed text-justify">
            <p>
              - Căn cứ Luật Các tổ chức tín dụng năm 2024 và các Thông tư hướng dẫn của Ngân hàng Nhà nước Việt Nam đối với Quỹ tín dụng nhân dân;
            </p>
            <p>
              - Căn cứ Điều lệ tổ chức và hoạt động của Quỹ Tín dụng Nhân dân Yên Thọ;
            </p>
            <p>
              - Căn cứ kết quả hoạt động kinh doanh năm 2026 và kế hoạch tăng trưởng an toàn, hiệu quả năm 2027;
            </p>
            <p>
              Ban Giám đốc kính trình Hội đồng Quản trị xem xét, thông qua Phương án phân phối tiền lương theo kịch bản 
              <strong> [{customScenarios.find(s => s.id === selectedScenarioId)?.name || selectedScenarioId}]</strong> với các nội dung trọng tâm như sau:
            </p>
          </div>

          {/* Bảng số liệu tóm tắt trong tờ trình */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2.5">Chỉ Tiêu Tài Chính</th>
                  <th className="p-2.5 text-right">Hiện Tại</th>
                  <th className="p-2.5 text-right">Phương Án Đề Xuất</th>
                  <th className="p-2.5 text-right">Chênh Lệch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2.5 font-sans font-medium">1. Mức lương cơ sở nội bộ</td>
                  <td className="p-2.5 text-right">2.340.000 ₫</td>
                  <td className="p-2.5 text-right font-bold text-brand-navy">{formatCurrency(luongCoSo)}</td>
                  <td className="p-2.5 text-right">+{formatCurrency(luongCoSo - 2340000)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">2. Tổng quỹ lương & BH năm (12 CBNV)</td>
                  <td className="p-2.5 text-right">{formatCurrency(macroMetrics.tongChiPhiNamHienTai)}</td>
                  <td className="p-2.5 text-right font-bold text-brand-navy">{formatCurrency(macroMetrics.tongChiPhiNamMoPhong)}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">+{formatCurrency(macroMetrics.chenhLechChiPhiNam)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">3. Thu nhập bình quân / người / tháng</td>
                  <td className="p-2.5 text-right">{formatCurrency(macroMetrics.thuNhapBqHienTai)}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(macroMetrics.thuNhapBqMoPhong)}</td>
                  <td className="p-2.5 text-right">+{formatCurrency(macroMetrics.thuNhapBqMoPhong - macroMetrics.thuNhapBqHienTai)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">4. Hệ số khoảng cách thu nhập (Max/Min)</td>
                  <td className="p-2.5 text-right">2.85 lần</td>
                  <td className="p-2.5 text-right font-bold">{macroMetrics.heSoKhoangCach} lần</td>
                  <td className="p-2.5 text-right font-sans text-emerald-700">An toàn &lt; 3.5 lần</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nguyên tắc 4 tầng thu nhập & Cơ chế BHXH cá nhân hóa */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wide">
              Các Nguyên Tắc Phân Phối Cốt Lõi Theo Đề Án 2027 Pro V2:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
              <li>
                <strong>Tầng 1 (Lương Vị trí L1):</strong> Phản ánh đúng độ phức tạp và trách nhiệm công việc, gắn liền ngạch bậc thâm niên.
              </li>
              <li>
                <strong>Tầng 2 (Lương KPI):</strong> Phân bổ theo kết cấu tỷ trọng từng khối ({deptKpiRatios.TIN_DUNG}% Tín dụng, {deptKpiRatios.LANH_DAO}% Lãnh đạo, {deptKpiRatios.KE_TOAN}% Kế toán, {deptKpiRatios.HO_TRO}% Văn phòng).
              </li>
              <li>
                <strong>Tầng 3 (Phụ cấp khoán công vụ):</strong> Ăn trưa, xăng xe, điện thoại, trang phục, độc hại kho quỹ và phụ cấp trách nhiệm theo chức danh.
              </li>
              <li>
                <strong>Tầng 4 (Cơ chế BHXH Độc Lập Theo Từng Cá Nhân):</strong> Quỹ bảo toàn trọn gói định mức đóng BHXH 23.5% theo Lương Vị trí L1 của chức danh. Cán bộ được quyền tự do lựa chọn mức đóng BHXH thực tế (từ mức sàn 5.000.000 ₫ đến mức tối đa theo L1). Trường hợp mức đóng thực tế thấp hơn định mức, Quỹ hoàn trả phần tiền chênh lệch thừa trực tiếp vào thu nhập hàng tháng của cán bộ, đảm bảo 100% quyền lợi tài chính và sự chủ động của người lao động.
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-6 text-xs font-bold text-center">
            <div>
              <div>NGƯỜI LẬP TỜ TRÌNH</div>
              <div className="font-normal italic text-slate-500 mt-12">(Ký, ghi rõ họ tên)</div>
            </div>
            <div>
              <div>TM. BAN GIÁM ĐỐC QUỸ</div>
              <div className="font-normal italic text-slate-500 mt-12">GIÁM ĐỐC</div>
            </div>
            <div>
              <div>TM. HỘI ĐỒNG QUẢN TRỊ</div>
              <div className="font-normal italic text-slate-500 mt-12">CHỦ TỊCH HĐQT</div>
            </div>
          </div>

          {/* Nút in ấn */}
          <div className="text-center pt-4 border-t border-slate-200">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>In Tờ Trình HĐQT (Khổ A4)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT PHIẾU LƯƠNG MÔ PHỎNG 4 TẦNG TỪNG CÁN BỘ */}
      {activeInspectingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-brand-navy p-5 text-white flex justify-between items-center">
              <div>
                <div className="text-xs text-brand-lime font-bold uppercase tracking-wider">Phiếu Mô Phỏng Thu Nhập Cá Nhân 4 Tầng</div>
                <h3 className="text-base font-bold mt-0.5">{activeInspectingRecord.hoTen} - {activeInspectingRecord.chucDanh}</h3>
                <div className="text-[11px] text-slate-300">
                  {activeInspectingRecord.phongBan || 'Nghiệp vụ'} • Kết cấu KPI bộ phận: <strong className="text-amber-300">{activeInspectingRecord.deptRatio}%</strong>
                </div>
              </div>
              <button 
                onClick={() => setInspectingStaff(null)} 
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4 text-xs">
              {/* Thẻ tóm tắt Gross / Net */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold">TỔNG THU NHẬP GROSS:</div>
                  <div className="text-lg font-bold font-mono text-amber-900">{formatCurrency(activeInspectingRecord.moPhong.tongGross)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold">THỰC LĨNH NET (VỀ TÀI KHOẢN):</div>
                  <div className="text-lg font-bold font-mono text-emerald-700">{formatCurrency(activeInspectingRecord.moPhong.thucLinhNet)}</div>
                </div>
              </div>

              {/* TÙY CHỌN MỨC ĐÓNG BHXH CÁ NHÂN & HƯỞNG TIỀN THỪA DOANH NGHIỆP TRẢ */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-emerald-950 text-xs flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1 text-emerald-700" />
                    Đăng Ký Đóng BHXH & Quyền Hưởng Tiền Thừa
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Định mức Quỹ trả (23.5% L1): <strong className="font-mono font-bold">{formatCurrency(activeInspectingRecord.moPhong.bhxhDonViDinhMuc)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateStaffBhxh(activeInspectingRecord.maNV, 'STANDARD', activeInspectingRecord.moPhong.luongDongBhxhChuan)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeInspectingRecord.moPhong.luongDongBhxhThucTe === activeInspectingRecord.moPhong.luongDongBhxhChuan && activeInspectingRecord.moPhong.tienThuaBhxhHuong === 0
                        ? 'bg-blue-700 text-white border-blue-800 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">1. Theo Lương L1</div>
                    <div className="font-numeric font-bold mt-0.5">{formatCurrency(activeInspectingRecord.moPhong.luongDongBhxhChuan)}</div>
                    <div className="text-[9px] opacity-80">Đóng đủ 100%</div>
                  </button>

                  <button
                    onClick={() => handleUpdateStaffBhxh(activeInspectingRecord.maNV, 'MIN', 5000000)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeInspectingRecord.moPhong.luongDongBhxhThucTe === 5000000
                        ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">2. Mức Sàn Vùng</div>
                    <div className="font-numeric font-bold mt-0.5">5.000.000 ₫</div>
                    <div className="text-[9px] opacity-80">Hưởng tối đa thừa</div>
                  </button>

                  {activeInspectingRecord.empBhxhGoc > 0 && (
                    <button
                      onClick={() => handleUpdateStaffBhxh(activeInspectingRecord.maNV, 'CUSTOM', activeInspectingRecord.empBhxhGoc)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeInspectingRecord.moPhong.luongDongBhxhThucTe === activeInspectingRecord.empBhxhGoc
                          ? 'bg-purple-700 text-white border-purple-800 font-bold shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">3. Hồ Sơ Đăng Ký</div>
                      <div className="font-numeric font-bold mt-0.5">{formatCurrency(activeInspectingRecord.empBhxhGoc)}</div>
                      <div className="text-[9px] opacity-80">Mức riêng đã lưu</div>
                    </button>
                  )}

                  <div className="p-2.5 rounded-xl border bg-white border-slate-300">
                    <div className="text-[10px] text-slate-600 font-semibold">Tự nhập mức riêng (₫)</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <input
                        type="number"
                        step="500000"
                        min="2340000"
                        max="46800000"
                        placeholder="VD: 7500000"
                        value={activeInspectingRecord.moPhong.luongDongBhxhThucTe || ''}
                        onChange={(e) => handleUpdateStaffBhxh(activeInspectingRecord.maNV, 'CUSTOM', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg font-numeric font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {activeInspectingRecord.moPhong.tienThuaBhxhHuong > 0 ? (
                  <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 flex justify-between items-center text-xs">
                    <span>🎉 Cán bộ chọn đóng thấp hơn định mức, Quỹ chi trả thêm:</span>
                    <span className="font-bold font-mono text-emerald-800 text-sm">+{formatCurrency(activeInspectingRecord.moPhong.tienThuaBhxhHuong)}/tháng</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic">
                    Cán bộ đóng đủ bảo hiểm theo Lương vị trí để hưởng tối đa chế độ hưu trí sau này.
                  </div>
                )}
              </div>

              {/* Chi tiết 4 tầng */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                {/* Tầng 1 */}
                <div className="p-3 bg-blue-50/40">
                  <div className="font-bold text-blue-900 flex justify-between">
                    <span>TẦNG 1: LƯƠNG VỊ TRÍ CHỨC DANH (ĐỊNH MỨC BHXH)</span>
                    <span className="font-mono">{formatCurrency(activeInspectingRecord.moPhong.luongViTri)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hệ số chức danh: {activeInspectingRecord.moPhong.heSoLuong.toFixed(2)} × Mức lương cơ sở: {formatCurrency(luongCoSo)}
                  </div>
                </div>

                {/* Tầng 2 */}
                <div className="p-3 bg-emerald-50/40">
                  <div className="font-bold text-emerald-900 flex justify-between">
                    <span>TẦNG 2: LƯƠNG NĂNG SUẤT HIỆU QUẢ KPI</span>
                    <span className="font-mono">{formatCurrency(activeInspectingRecord.moPhong.luongKpi)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tỷ lệ KPI khối: {activeInspectingRecord.deptRatio}% • Trần: {tranKpi}% • Hiệu suất: {sensitivityFactor}%
                  </div>
                </div>

                {/* Tầng 3 */}
                <div className="p-3 bg-slate-50">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>TẦNG 3: PHỤ CẤP KHOÁN CÔNG TÁC PHÍ</span>
                    <span className="font-mono">{formatCurrency(activeInspectingRecord.moPhong.tongKhoanChi + activeInspectingRecord.moPhong.khoanTrachNhiem)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600 font-mono">
                    <div>• Ăn trưa: {formatCurrency(activeInspectingRecord.moPhong.khoanAnTrua)}</div>
                    <div>• Xăng xe: {formatCurrency(activeInspectingRecord.moPhong.khoanXangXe)}</div>
                    <div>• Điện thoại: {formatCurrency(activeInspectingRecord.moPhong.khoanDienThoai)}</div>
                    <div>• Trang phục: {formatCurrency(activeInspectingRecord.moPhong.khoanTrangPhuc)}</div>
                    {activeInspectingRecord.moPhong.khoanDocHai > 0 && <div>• Độc hại kho quỹ: {formatCurrency(activeInspectingRecord.moPhong.khoanDocHai)}</div>}
                    {activeInspectingRecord.moPhong.khoanTrachNhiem > 0 && <div>• Phụ cấp trách nhiệm: {formatCurrency(activeInspectingRecord.moPhong.khoanTrachNhiem)}</div>}
                  </div>
                </div>

                {/* Khoản tiền thừa BHXH hưởng thêm (nếu có) */}
                {activeInspectingRecord.moPhong.tienThuaBhxhHuong > 0 && (
                  <div className="p-3 bg-emerald-50">
                    <div className="font-bold text-emerald-900 flex justify-between">
                      <span>KHOẢN THỪA BHXH DO QUỸ CHI TRẢ (CỘNG VÀO LƯƠNG)</span>
                      <span className="font-mono text-emerald-700">+{formatCurrency(activeInspectingRecord.moPhong.tienThuaBhxhHuong)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      (Quỹ chuẩn trả 23.5%: {formatCurrency(activeInspectingRecord.moPhong.bhxhDonViDinhMuc)} - Thực nộp: {formatCurrency(activeInspectingRecord.moPhong.bhxhDonVi)})
                    </div>
                  </div>
                )}

                {/* Tầng 4 */}
                <div className="p-3 bg-rose-50/40">
                  <div className="font-bold text-rose-900 flex justify-between">
                    <span>TẦNG 4: NGHĨA VỤ TRÍCH NỘP & THUẾ TNCN</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(activeInspectingRecord.moPhong.bhxhNld + activeInspectingRecord.moPhong.doanPhiNld + activeInspectingRecord.moPhong.thueTncn)}</span>
                  </div>
                  <div className="space-y-1 mt-2 text-[11px] text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span>• BHXH, BHYT, BHTN NLĐ đóng (10.5% trên mức đóng {formatCurrency(activeInspectingRecord.moPhong.luongDongBhxhThucTe)}):</span>
                      <span className="text-rose-700">-{formatCurrency(activeInspectingRecord.moPhong.bhxhNld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Đoàn phí công đoàn (1%):</span>
                      <span className="text-rose-700">-{formatCurrency(activeInspectingRecord.moPhong.doanPhiNld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Thuế TNCN (Biểu lũy tiến 7 bậc):</span>
                      <span className="text-rose-700">-{formatCurrency(activeInspectingRecord.moPhong.thueTncn)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic pt-1 border-t border-rose-200/60">
                      (Thu nhập chịu thuế: {formatCurrency(activeInspectingRecord.moPhong.tongGross - activeInspectingRecord.moPhong.tongMienThue)} - Giảm trừ gia cảnh {activeInspectingRecord.moPhong.soNPT} NPT: {formatCurrency(activeInspectingRecord.moPhong.giamTruGiaCanh)} - BHXH: {formatCurrency(activeInspectingRecord.moPhong.bhxhNld)})
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi phí Quỹ phải trả */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex justify-between">
                  <span>CHI PHÍ QUỸ GÁNH CHỊU CHO CÁN BỘ NÀY:</span>
                  <span className="font-mono">{formatCurrency(activeInspectingRecord.moPhong.tongChiPhiQuy)}/tháng</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                  <span>• Gross trả người lao động:</span>
                  <span>{formatCurrency(activeInspectingRecord.moPhong.tongGross)}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                  <span>• Quỹ thực nộp cơ quan BHXH:</span>
                  <span>{formatCurrency(activeInspectingRecord.moPhong.bhxhDonVi)}</span>
                </div>
                <div className="text-[10px] text-amber-800 italic pt-1 border-t border-amber-200">
                  (Tổng ngân sách chi trả của Quỹ luôn được bảo toàn đúng bằng định mức ban đầu: {formatCurrency(activeInspectingRecord.moPhong.tongChiPhiQuy)})
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setInspectingStaff(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO KỊCH BẢN MỚI */}
      {showNewScenarioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-navy p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-brand-lime" />
                  <span>Tạo Kịch Bản Mô Phỏng Mới</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Kế thừa và tùy biến các tham số tài chính</p>
              </div>
              <button 
                onClick={() => setShowNewScenarioModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNewScenario} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên kịch bản mô phỏng <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="VD: Kịch bản HĐQT Tăng Lương Cơ Sở 2027..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mức Lương cơ sở (₫)</label>
                <input
                  type="number"
                  step="50000"
                  min="1500000"
                  max="5000000"
                  value={newScenarioBaseSalary}
                  onChange={(e) => setNewScenarioBaseSalary(Number(e.target.value) || 2340000)}
                  className="w-full px-3 py-2 font-numeric font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tỷ lệ Trần Quỹ KPI (%)</label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={newScenarioTranKpi}
                  onChange={(e) => setNewScenarioTranKpi(Number(e.target.value) || 100)}
                  className="w-full px-3 py-2 font-numeric font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>Gợi ý:</strong> Kịch bản mới sẽ tự động kế thừa toàn bộ định mức phụ cấp khoán, % kết cấu KPI các bộ phận và cơ cấu BHXH hiện tại. Sau khi tạo, bạn có thể tự do tinh chỉnh các thông số.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewScenarioModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-navy text-white rounded-xl font-bold hover:bg-slate-800 shadow"
                >
                  Tạo Kịch Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM TRƯỚC BẢN IN / XUẤT PDF CHUẨN A4 NGANG */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Top Toolbar (Non-printable) */}
            <div className="bg-slate-900 p-4 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-brand-lime" />
                <div>
                  <h3 className="text-sm font-bold">Bản In & Xuất PDF Báo Cáo Lương (Khổ A4 Ngang)</h3>
                  <p className="text-[11px] text-slate-300">Biểu mẫu chính thức trình Thường trực HĐQT & Ban Giám đốc</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-brand-lime hover:bg-lime-500 text-brand-navy font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Ngay / Lưu PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="print-salary-report" className="printable-salary-report p-8 text-slate-900 font-sans text-xs bg-white space-y-4">
              {/* Header Quốc Hiệu & Cơ Quan */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div className="text-left space-y-0.5">
                  <div className="font-extrabold text-xs uppercase text-slate-900 tracking-wider">
                    QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Địa chỉ: Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Số: ..... /BC-QTD
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="font-extrabold text-xs uppercase text-slate-900 tracking-wider">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-[11px] text-slate-800">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-[11px] italic text-slate-600 pt-1">
                    Quý Lộc, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              {/* Tiêu đề báo cáo */}
              <div className="text-center space-y-1 pt-2">
                <h2 className="text-base font-extrabold uppercase text-slate-900 tracking-wide">
                  BẢNG SO SÁNH MÔ PHỎNG CHI TRẢ TIỀN LƯƠNG & CHI PHÍ QUỸ NĂM 2027
                </h2>
                <div className="text-xs font-semibold text-slate-700">
                  Kịch bản: <span className="text-blue-900 font-bold">{customScenarios.find(s => s.id === selectedScenarioId)?.name || selectedScenarioId}</span>
                  {'  •  '}Lương cơ sở: <span className="font-bold font-numeric">{formatCurrency(luongCoSo)}</span>
                  {'  •  '}Trần KPI: <span className="font-bold font-numeric">{tranKpi}%</span>
                  {'  •  '}Chính sách thuế: <span className="font-bold">{pitRegime === 'CURRENT' ? 'Hiện hành (11tr/4.4tr)' : 'Dự thảo (15tr/6.2tr)'}</span>
                </div>
              </div>

              {/* Tóm tắt 4 chỉ số vĩ mô */}
              <div className="grid grid-cols-4 gap-3 py-2">
                <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tổng Quỹ Lương & BH Năm</div>
                  <div className="text-xs font-bold text-slate-900 font-numeric">{formatCurrency(macroMetrics.tongChiPhiNamMoPhong)}</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Chênh Lệch So Hiện Tại</div>
                  <div className="text-xs font-bold text-emerald-800 font-numeric">+{formatCurrency(macroMetrics.chenhLechChiPhiNam)}/năm</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Thu Nhập BQ / Người / Tháng</div>
                  <div className="text-xs font-bold text-emerald-800 font-numeric">{formatCurrency(macroMetrics.thuNhapBqMoPhong)}</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Hệ Số Giãn Cách Max/Min</div>
                  <div className="text-xs font-bold text-purple-900 font-numeric">{macroMetrics.heSoKhoangCach} lần</div>
                </div>
              </div>

              {/* Bảng dữ liệu 12 CBNV */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[10px] border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                      <th className="border border-slate-400 p-1.5 text-center w-8">STT</th>
                      <th className="border border-slate-400 p-1.5 text-center w-14">Mã NV</th>
                      <th className="border border-slate-400 p-1.5 text-left min-w-[130px]">Họ và tên</th>
                      <th className="border border-slate-400 p-1.5 text-left min-w-[110px]">Chức danh</th>
                      <th className="border border-slate-400 p-1.5 text-center w-10">Bậc</th>
                      <th className="border border-slate-400 p-1.5 text-center w-12">Hệ số</th>
                      <th className="border border-slate-400 p-1.5 text-right">Lương Vị trí L1</th>
                      <th className="border border-slate-400 p-1.5 text-right">Lương KPI</th>
                      <th className="border border-slate-400 p-1.5 text-right">Khoán & PC</th>
                      <th className="border border-slate-400 p-1.5 text-right">Tiền thừa BH</th>
                      <th className="border border-slate-400 p-1.5 text-right font-bold bg-amber-50">Gross Đề Xuất</th>
                      <th className="border border-slate-400 p-1.5 text-right">Thuế TNCN</th>
                      <th className="border border-slate-400 p-1.5 text-right font-bold bg-emerald-50">Net Thực Lĩnh</th>
                      <th className="border border-slate-400 p-1.5 text-right">Chi Phí Quỹ</th>
                      <th className="border border-slate-400 p-1.5 text-right">Gross Cũ</th>
                      <th className="border border-slate-400 p-1.5 text-right">Chênh Lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationResults.map((r, idx) => (
                      <tr key={r.maNV} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                        <td className="border border-slate-300 p-1 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-1 text-center font-mono">{r.maNV}</td>
                        <td className="border border-slate-300 p-1 font-bold">{r.hoTen}</td>
                        <td className="border border-slate-300 p-1">{r.chucDanh}</td>
                        <td className="border border-slate-300 p-1 text-center font-numeric">{r.moPhong.bac || 1}</td>
                        <td className="border border-slate-300 p-1 text-center font-numeric">{r.moPhong.heSoLuong.toFixed(2)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.luongViTri)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.luongKpi)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{r.moPhong.tienThuaBhxhHuong > 0 ? `+${formatCurrency(r.moPhong.tienThuaBhxhHuong)}` : '-'}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric font-bold bg-amber-50/50">{formatCurrency(r.moPhong.tongGross)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.thueTncn)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric font-bold bg-emerald-50/50">{formatCurrency(r.moPhong.thucLinhNet)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.moPhong.tongChiPhiQuy)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric">{formatCurrency(r.hienTai.tongGross)}</td>
                        <td className="border border-slate-300 p-1 text-right font-numeric font-bold" style={{ color: r.chenhLechGross >= 0 ? '#047857' : '#e11d48' }}>
                          {r.chenhLechGross >= 0 ? `+${formatCurrency(r.chenhLechGross)}` : formatCurrency(r.chenhLechGross)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <td colSpan={6} className="border border-slate-400 p-1.5 text-center uppercase">TỔNG CỘNG TOÀN QUỸ (12 CBNV)</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongViTri, 0))}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.luongKpi, 0))}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongKhoanChi + r.moPhong.khoanTrachNhiem, 0))}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{macroMetrics.tongTienThuaBhxhThangMoPhong > 0 ? `+${formatCurrency(macroMetrics.tongTienThuaBhxhThangMoPhong)}` : '-'}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold bg-amber-50">{formatCurrency(macroMetrics.tongGrossThangMoPhong)}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(macroMetrics.tongThueTncnThangMoPhong)}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold bg-emerald-50">{formatCurrency(macroMetrics.tongNetThangMoPhong)}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold">{formatCurrency(simulationResults.reduce((s, r) => s + r.moPhong.tongChiPhiQuy, 0))}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric">{formatCurrency(macroMetrics.tongGrossThangHienTai)}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-numeric font-bold text-emerald-800">+{formatCurrency(macroMetrics.tongGrossThangMoPhong - macroMetrics.tongGrossThangHienTai)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 3 Khối Chữ Ký */}
              <div className="flex justify-between items-start pt-6 text-center text-xs font-bold">
                <div className="w-1/3">
                  <div className="uppercase">NGƯỜI LẬP BIỂU</div>
                  <div className="font-normal italic text-slate-500 mt-16">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="w-1/3">
                  <div className="uppercase">KẾ TOÁN TRƯỞNG</div>
                  <div className="font-normal italic text-slate-500 mt-16">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="w-1/3">
                  <div className="uppercase">CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ</div>
                  <div className="font-normal italic text-slate-500 mt-16">(Ký tên, đóng dấu)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
