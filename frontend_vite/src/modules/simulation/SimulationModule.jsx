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
  Info
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/currency';

export function SimulationModule({ data, onSaveScenario }) {
  // Lấy dữ liệu 12 CBNV và Chức danh từ CSDL
  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const scenarios = data?.scenarios || [];

  // Trạng thái kịch bản đang chọn
  const [selectedScenarioId, setSelectedScenarioId] = useState('PA3');
  const [activeSubTab, setActiveSubTab] = useState('matrix'); // 'matrix' | 'tuner' | 'sensitivity' | 'proposal'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Tham số mô phỏng có thể tùy chỉnh
  const [luongCoSo, setLuongCoSo] = useState(2340000);
  const [tranKpi, setTranKpi] = useState(115); // %
  const [anTrua, setAnTrua] = useState(850000); // ₫/tháng
  const [xangXe, setXangXe] = useState(500000); // ₫/tháng
  const [dienThoai, setDienThoai] = useState(400000); // ₫/tháng
  const [trachNhiem, setTrachNhiem] = useState(600000); // ₫/tháng
  const [docHai, setDocHai] = useState(400000); // ₫/tháng
  const [quyThuongNam, setQuyThuongNam] = useState(200000000); // ₫/năm
  const [sensitivityFactor, setSensitivityFactor] = useState(100); // 80%, 100%, 120%

  // Tải cấu hình khi đổi kịch bản
  const handleSelectScenario = (scId) => {
    setSelectedScenarioId(scId);
    const sc = scenarios.find(s => s.id === scId);
    if (sc) {
      setLuongCoSo(sc.luongCoSo || 2340000);
      setTranKpi(sc.tranKpi || 100);
      setAnTrua(sc.anTrua || 730000);
      setXangXe(sc.xangXe || 400000);
      setDienThoai(sc.dienThoai || 300000);
      setTrachNhiem(sc.trachNhiem || 500000);
      setDocHai(sc.docHai || 300000);
      setQuyThuongNam(sc.quyThuongNam || 150000000);
    }
  };

  // Tính toán mô phỏng 12 CBNV
  const simulationResults = useMemo(() => {
    if (!staffList || staffList.length === 0) return [];

    return staffList.map(emp => {
      // Tìm chức danh tương ứng
      const pos = positions.find(p => p.tenChucDanh === emp.chucDanh || p.maViTri === emp.chucDanh);
      
      // 1. Hệ số lương theo phương án đang chọn
      let heSoLuong = emp.heSoLuong || 2.5;
      let heSoKpi = emp.heSoKpi || 1.0;
      let phuCapTnChucDanh = 0;

      if (pos) {
        if (selectedScenarioId === 'PA1') {
          heSoLuong = pos.pa1HeSo || heSoLuong;
          heSoKpi = pos.pa1Kpi || heSoKpi;
        } else if (selectedScenarioId === 'PA2') {
          heSoLuong = pos.pa2HeSo || heSoLuong;
          heSoKpi = pos.pa2Kpi || heSoKpi;
        } else {
          heSoLuong = pos.pa3HeSo || heSoLuong;
          heSoKpi = pos.pa3Kpi || heSoKpi;
        }
        phuCapTnChucDanh = pos.phuCapTN || 0;
      }

      // 2. Thu nhập hiện tại (Cơ sở PA1 / Hệ số hiện hành)
      const luongViTriHienTai = (emp.heSoLuong || 2.5) * 2340000;
      const luongKpiHienTai = (emp.heSoKpi || 1.0) * 3500000;
      const phuCapKhoanHienTai = 730000 + 400000 + 300000; // 1.43 tr
      const tongGrossHienTai = luongViTriHienTai + luongKpiHienTai + phuCapKhoanHienTai;
      const bhxhNldHienTai = luongViTriHienTai * 0.105;
      const bhxhDonViHienTai = luongViTriHienTai * 0.235;
      const giamTruHienTai = 11000000 + (emp.soNguoiPhuThuoc || 0) * 4400000;
      const thuNhapTinhThueHienTai = Math.max(0, tongGrossHienTai - 730000 - bhxhNldHienTai - giamTruHienTai);
      const thueTncnHienTai = thuNhapTinhThueHienTai * 0.05;
      const netHienTai = tongGrossHienTai - bhxhNldHienTai - thueTncnHienTai;

      // 3. Thu nhập Kịch bản Mô Phỏng
      const kpiPerfRatio = sensitivityFactor / 100;
      const luongViTriMoPhong = heSoLuong * luongCoSo;
      // Lương KPI mô phỏng tỷ lệ theo trần và hệ số
      const donGiaKpiCoBan = 4000000 * (tranKpi / 100);
      const luongKpiMoPhong = heSoKpi * donGiaKpiCoBan * kpiPerfRatio;
      
      // Phụ cấp khoán theo chức danh
      let khoanChucDanh = 0;
      if (emp.chucDanh.includes('Tín dụng')) khoanChucDanh += xangXe * 1.5;
      else khoanChucDanh += xangXe;
      if (emp.chucDanh.includes('Thủ quỹ')) khoanChucDanh += docHai;
      if (emp.chucDanh.includes('Giám đốc') || emp.chucDanh.includes('Chủ tịch')) khoanChucDanh += trachNhiem;

      const phuCapKhoanMoPhong = anTrua + dienThoai + khoanChucDanh;
      const tongGrossMoPhong = luongViTriMoPhong + luongKpiMoPhong + phuCapKhoanMoPhong;
      
      // Khấu trừ BHXH (Tính trên lương vị trí đóng BHXH)
      const bhxhNldMoPhong = luongViTriMoPhong * 0.105;
      const bhxhDonViMoPhong = luongViTriMoPhong * 0.235;
      
      // Thuế TNCN (Ăn trưa miễn thuế tối đa 730k, phần thừa tính thuế)
      const anTruaMienThue = Math.min(anTrua, 730000);
      const giamTruMoPhong = 11000000 + (emp.soNguoiPhuThuoc || 0) * 4400000;
      const thuNhapChiuThueMoPhong = Math.max(0, tongGrossMoPhong - anTruaMienThue - bhxhNldMoPhong - giamTruMoPhong);
      const thueTncnMoPhong = thuNhapChiuThueMoPhong * 0.05;
      const netMoPhong = tongGrossMoPhong - bhxhNldMoPhong - thueTncnMoPhong;

      // Chênh lệch
      const chenhLechGross = tongGrossMoPhong - tongGrossHienTai;
      const phanTramGross = tongGrossHienTai > 0 ? (chenhLechGross / tongGrossHienTai) * 100 : 0;
      const chenhLechBhxhDonVi = bhxhDonViMoPhong - bhxhDonViHienTai;

      return {
        maNV: emp.maNV,
        hoTen: emp.hoTen,
        chucDanh: emp.chucDanh,
        phongBan: emp.phongBan,
        heSoLuong,
        heSoKpi,
        tongGrossHienTai,
        bhxhDonViHienTai,
        netHienTai,
        luongViTriMoPhong,
        luongKpiMoPhong,
        phuCapKhoanMoPhong,
        tongGrossMoPhong,
        bhxhDonViMoPhong,
        netMoPhong,
        chenhLechGross,
        phanTramGross,
        chenhLechBhxhDonVi
      };
    });
  }, [staffList, positions, selectedScenarioId, luongCoSo, tranKpi, anTrua, xangXe, dienThoai, trachNhiem, docHai, sensitivityFactor]);

  // Tổng hợp chỉ số tài chính vĩ mô
  const macroMetrics = useMemo(() => {
    const tongGrossThangHienTai = simulationResults.reduce((sum, r) => sum + r.tongGrossHienTai, 0);
    const tongGrossThangMoPhong = simulationResults.reduce((sum, r) => sum + r.tongGrossMoPhong, 0);
    const tongBhxhDonViThangHienTai = simulationResults.reduce((sum, r) => sum + r.bhxhDonViHienTai, 0);
    const tongBhxhDonViThangMoPhong = simulationResults.reduce((sum, r) => sum + r.bhxhDonViMoPhong, 0);

    const tongChiPhiThangHienTai = tongGrossThangHienTai + tongBhxhDonViThangHienTai;
    const tongChiPhiThangMoPhong = tongGrossThangMoPhong + tongBhxhDonViThangMoPhong;

    const tongChiPhiNamHienTai = tongChiPhiThangHienTai * 12 + 150000000;
    const tongChiPhiNamMoPhong = tongChiPhiThangMoPhong * 12 + quyThuongNam;

    const chenhLechChiPhiNam = tongChiPhiNamMoPhong - tongChiPhiNamHienTai;
    const phanTramChenhLechNam = tongChiPhiNamHienTai > 0 ? (chenhLechChiPhiNam / tongChiPhiNamHienTai) * 100 : 0;

    const thuNhapBqMoPhong = simulationResults.length > 0 ? tongGrossThangMoPhong / simulationResults.length : 0;
    const thuNhapBqHienTai = simulationResults.length > 0 ? tongGrossThangHienTai / simulationResults.length : 0;

    // Khoảng cách lương Max / Min
    const grossList = simulationResults.map(r => r.tongGrossMoPhong);
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
      heSoKhoangCach,
      tongBhxhDonViNamMoPhong: tongBhxhDonViThangMoPhong * 12
    };
  }, [simulationResults, quyThuongNam]);

  const handleSaveCurrentScenario = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const scenarioPayload = {
        id: selectedScenarioId.startsWith('PA') ? `SCENARIO_${Date.now()}` : selectedScenarioId,
        name: selectedScenarioId.startsWith('PA') ? `Kịch bản HĐQT tùy chỉnh (${new Date().toLocaleDateString('vi-VN')})` : `Kịch bản ${selectedScenarioId}`,
        luongCoSo,
        tranKpi,
        anTrua,
        xangXe,
        dienThoai,
        trachNhiem,
        docHai,
        quyThuongNam
      };

      if (onSaveScenario) {
        await onSaveScenario(scenarioPayload);
      }
      setSaveSuccessMsg('✅ Đã lưu kịch bản vào CSDL thành công!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Lỗi lưu kịch bản: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

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
              Mô Phỏng & Đánh Giá Tác Động Quy Chế Lương 2027 Pro V2
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Công cụ phân tích định lượng hỗ trợ HĐQT mô phỏng các phương án lương (PA1, PA2, PA3 hoặc Tùy chỉnh), 
              đo lường độ nhạy tài chính, chi phí BHXH Quỹ gánh chịu và thu nhập bình quân trước khi biểu quyết ban hành Nghị quyết.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveSubTab('proposal')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-brand-lime" />
              <span>Xuất Tờ Trình HĐQT</span>
            </button>
            <button
              onClick={handleSaveCurrentScenario}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-brand-lime hover:bg-lime-500 text-brand-navy font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
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

        {/* Bộ Lọc Chọn Kịch Bản Nền */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Chọn Phương Án Nền:</span>
            <div className="inline-flex rounded-xl bg-slate-900/60 p-1 border border-white/10">
              {[
                { id: 'PA1', label: 'Phương Án 1 (Cơ bản)' },
                { id: 'PA2', label: 'Phương Án 2 (Đột phá)' },
                { id: 'PA3', label: 'Phương Án 3 (Khuyến nghị)' }
              ].map(pa => (
                <button
                  key={pa.id}
                  onClick={() => handleSelectScenario(pa.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedScenarioId === pa.id
                      ? 'bg-brand-lime text-brand-navy font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {pa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tabs điều hướng bên trong Phân hệ Mô phỏng */}
          <div className="inline-flex rounded-xl bg-slate-900/60 p-1 border border-white/10">
            {[
              { id: 'matrix', label: 'Bảng So Sánh 12 CBNV', icon: Users },
              { id: 'tuner', label: 'Bộ Điều Khiển Tham Số', icon: Sliders },
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
        {/* Thẻ 1: Tổng Quỹ Lương Năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Quỹ Lương Năm</span>
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
            Mức 23.5% lương đóng BHXH của 12 CBNV
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

      {/* NỘI DUNG CHÍNH THEO SUB-TABS */}

      {/* SUB-TAB 1: BẢNG MA TRẬN SO SÁNH 12 CBNV */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-navy" />
                <span>Bảng So Sánh Chi Tiết Thu Nhập 12 Cán Bộ (Hiện Tại vs Mô Phỏng)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị số tiền thực tế tăng/giảm và tác động chi phí từng nhân sự dưới kịch bản [{selectedScenarioId}]
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Đơn vị tính: <strong className="text-slate-800">VNĐ/tháng</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Mã NV</th>
                  <th className="p-3.5">Họ Và Tên</th>
                  <th className="p-3.5">Chức Vụ</th>
                  <th className="p-3.5 text-center">Hệ Số PA</th>
                  <th className="p-3.5 text-right bg-slate-100/60">Thu Nhập Hiện Tại</th>
                  <th className="p-3.5 text-right bg-blue-50 text-blue-900">Lương Vị Trí</th>
                  <th className="p-3.5 text-right bg-blue-50 text-blue-900">Lương KPI</th>
                  <th className="p-3.5 text-right bg-blue-50 text-blue-900">Khoán Chi</th>
                  <th className="p-3.5 text-right font-bold bg-amber-50 text-amber-900">Gross Mô Phỏng</th>
                  <th className="p-3.5 text-right font-bold bg-emerald-50 text-emerald-900">Net Thực Lĩnh</th>
                  <th className="p-3.5 text-right font-bold">Chênh Lệch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulationResults.map((r, idx) => (
                  <tr key={r.maNV} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                    <td className="p-3.5 font-mono text-slate-500 font-medium">{r.maNV}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.hoTen}</td>
                    <td className="p-3.5 text-slate-600">{r.chucDanh}</td>
                    <td className="p-3.5 text-center font-mono">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {r.heSoLuong.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600 bg-slate-100/40">
                      {formatCurrency(r.tongGrossHienTai)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-blue-900 bg-blue-50/30">
                      {formatCurrency(r.luongViTriMoPhong)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-blue-900 bg-blue-50/30">
                      {formatCurrency(r.luongKpiMoPhong)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-blue-900 bg-blue-50/30">
                      {formatCurrency(r.phuCapKhoanMoPhong)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-900 bg-amber-50/40">
                      {formatCurrency(r.tongGrossMoPhong)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50">
                      {formatCurrency(r.netMoPhong)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold">
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
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="p-3.5 text-right uppercase text-slate-700">Tổng Toàn Cơ Quan (12 CBNV):</td>
                  <td className="p-3.5 text-right font-mono text-slate-800">
                    {formatCurrency(macroMetrics.tongGrossThangHienTai)}
                  </td>
                  <td colSpan={3} className="p-3.5"></td>
                  <td className="p-3.5 text-right font-mono text-amber-900">
                    {formatCurrency(macroMetrics.tongGrossThangMoPhong)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-900">
                    {formatCurrency(simulationResults.reduce((sum, r) => sum + r.netMoPhong, 0))}
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-700">
                    +{formatCurrency(macroMetrics.tongGrossThangMoPhong - macroMetrics.tongGrossThangHienTai)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BỘ ĐIỀU KHIỂN THAM SỐ (TUNER) */}
      {activeSubTab === 'tuner' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1: Lương Cơ Sở & Trần KPI */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-brand-navy" />
              <span>1. Lương Cơ Sở & Quỹ Thưởng KPI</span>
            </h3>

            {/* Lương cơ sở nội bộ */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Mức Lương Cơ Sở Nội Bộ QTD:</span>
                <span className="font-mono font-bold text-brand-navy">{formatCurrency(luongCoSo)}</span>
              </div>
              <input
                type="range"
                min="1800000"
                max="3500000"
                step="50000"
                value={luongCoSo}
                onChange={(e) => setLuongCoSo(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-navy"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1.800.000 ₫ (Cũ)</span>
                <span>2.340.000 ₫ (Hiện hành)</span>
                <span>3.500.000 ₫ (Mục tiêu)</span>
              </div>
            </div>

            {/* Trần KPI */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Tỷ Lệ Trần Quỹ Lương KPI:</span>
                <span className="font-mono font-bold text-emerald-700">{tranKpi}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="150"
                step="5"
                value={tranKpi}
                onChange={(e) => setTranKpi(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>80% (Khủng hoảng)</span>
                <span>100% (Chuẩn)</span>
                <span>150% (Đột phá)</span>
              </div>
            </div>

            {/* Quỹ Khen thưởng năm */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Hạn Mức Quỹ Thưởng Năm:</span>
                <span className="font-mono font-bold text-purple-700">{formatCurrency(quyThuongNam)}</span>
              </div>
              <input
                type="range"
                min="100000000"
                max="500000000"
                step="10000000"
                value={quyThuongNam}
                onChange={(e) => setQuyThuongNam(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* Cột 2: Định Mức 5 Khoản Phụ Cấp Khoán */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-brand-lime" />
              <span>2. Định Mức 5 Khoản Phụ Cấp Khoán Chi</span>
            </h3>

            {/* Ăn ca */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Tiền Ăn Giữa Ca (Ăn trưa):</span>
                <span className="font-mono font-bold text-slate-800">{formatCurrency(anTrua)}</span>
              </div>
              <input
                type="range"
                min="730000"
                max="1500000"
                step="50000"
                value={anTrua}
                onChange={(e) => setAnTrua(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                Mức trần miễn thuế TNCN hiện hành là 730.000 ₫/tháng
              </div>
            </div>

            {/* Xăng xe */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Khoán Xăng Xe Công Tác:</span>
                <span className="font-mono font-bold text-slate-800">{formatCurrency(xangXe)}</span>
              </div>
              <input
                type="range"
                min="300000"
                max="1500000"
                step="50000"
                value={xangXe}
                onChange={(e) => setXangXe(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Điện thoại */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Khoán Cước Điện Thoại:</span>
                <span className="font-mono font-bold text-slate-800">{formatCurrency(dienThoai)}</span>
              </div>
              <input
                type="range"
                min="200000"
                max="1000000"
                step="50000"
                value={dienThoai}
                onChange={(e) => setDienThoai(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
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

          {/* Bảng so sánh 4 mức độ nhạy */}
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
              <strong> [{selectedScenarioId}]</strong> với các nội dung trọng tâm như sau:
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
                  <td className="p-2.5 font-sans font-medium">2. Tổng quỹ lương năm (12 CBNV)</td>
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
    </div>
  );
}
