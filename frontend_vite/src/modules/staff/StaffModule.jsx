import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Eye, Plus, Edit2, Phone, Mail, CreditCard, Shield, 
  MapPin, Calendar, Briefcase, DollarSign, Award, CheckCircle2, 
  LayoutGrid, List, Sliders, ChevronRight, FileText, Building2
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatVnd } from '../../utils/currency';

export function StaffModule({ data, onSaveStaff }) {
  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const baseSalary = data?.params?.BASIC_SALARY || 2500000;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' hoặc 'grid'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('personal'); // 'personal' | 'salary' | 'insurance' | 'allowance'
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Lọc danh sách CBNV
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchSearch = !searchTerm.trim() || 
        s.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.maNV?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.chucDanh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cccd?.includes(searchTerm);
      
      const matchDept = selectedDept === 'ALL' || s.phongBan === selectedDept;
      return matchSearch && matchDept;
    });
  }, [staffList, searchTerm, selectedDept]);

  // Các danh mục phòng ban
  const departments = useMemo(() => {
    const set = new Set(staffList.map(s => s.phongBan).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [staffList]);

  // Mở modal Thêm/Sửa
  const handleOpenEdit = (staff) => {
    setActiveEditTab('personal');
    setSaveSuccessMsg('');
    if (staff) {
      setFormData({
        ...staff,
        bac: staff.bac || 1,
        heSoLuong: staff.heSoLuong || 2.5,
        phuCapTN: staff.phuCapTN || 0,
        mucDongBhxh: staff.mucDongBhxh || Math.round((staff.heSoLuong || 2.5) * baseSalary),
        soNPT: staff.soNPT || 0,
        tenNganHang: staff.tenNganHang || 'Agribank Quý Lộc'
      });
    } else {
      const nextId = `NV${String(staffList.length + 1).padStart(2, '0')}`;
      setFormData({
        maNV: nextId,
        hoTen: '',
        chucDanh: 'Cán bộ tín dụng',
        phongBan: 'Tín dụng',
        maViTri: 'P08',
        bac: 1,
        heSoLuong: 2.60,
        dienThoai: '',
        email: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        cccd: '',
        ngayCapCCCD: '',
        noiCapCCCD: 'Cục CSQLHC về TTXH',
        diaChi: 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá',
        ngayVaoLam: '01/01/2027',
        trangThai: 'ĐANG LÀM',
        soNPT: 0,
        soTaiKhoanNH: '',
        tenNganHang: 'Agribank Quý Lộc',
        mst: '',
        soSoBHXH: '',
        phuCapTN: 0,
        mucDongBhxh: 6500000,
        soQD: 'NQ-01/2027/NQ-HĐQT',
        ngayQD: '01/01/2027',
        ghiChu: ''
      });
    }
    setIsEditing(true);
  };

  // Tự động cập nhật hệ số khi chọn chức danh từ danh mục positions
  const handlePositionChange = (chucDanhValue) => {
    const matchedPos = positions.find(p => p.tenChucDanh === chucDanhValue);
    if (matchedPos) {
      setFormData(prev => ({
        ...prev,
        chucDanh: matchedPos.tenChucDanh,
        maViTri: matchedPos.maViTri,
        khoi: matchedPos.khoi,
        bac: matchedPos.bac || 1,
        heSoLuong: matchedPos.pa2HeSo || matchedPos.pa1HeSo || prev.heSoLuong || 2.5,
        phuCapTN: matchedPos.phuCapTN || 0,
        mucDongBhxh: Math.round((matchedPos.pa2HeSo || 2.5) * baseSalary)
      }));
    } else {
      setFormData(prev => ({ ...prev, chucDanh: chucDanhValue }));
    }
  };

  // Lưu thông tin
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSaveStaff) {
        await onSaveStaff(formData);
      }
      setSaveSuccessMsg('✅ Đã lưu cập nhật hồ sơ cán bộ thành công!');
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccessMsg('');
      }, 1200);
    } catch (err) {
      alert(`❌ Lỗi khi lưu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Thanh Công Cụ & Thống Kê Nhanh */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên, Mã NV, CCCD, Chức danh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
          </div>

          {/* Bộ lọc & Chuyển đổi giao diện */}
          <div className="flex items-center space-x-2">
            {/* Lọc phòng ban */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-navy"
            >
              <option value="ALL">Tất cả khối ({staffList.length})</option>
              {departments.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Nút chuyển chế độ xem Table vs Grid */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng Bảng Tổng Hợp Chi Tiết"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng Thẻ Lưới 360°"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Nút thêm cán bộ */}
            <button
              onClick={() => handleOpenEdit(null)}
              className="px-3.5 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm Cán Bộ</span>
            </button>
          </div>
        </div>

        {/* Dải Thống Kê Tổng Thể */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tổng định biên:</span>
            <strong className="font-numeric text-slate-800 font-bold">{staffList.length} CBNV</strong>
          </div>
          <div className="p-2 bg-emerald-50/60 rounded-lg flex items-center justify-between">
            <span className="text-emerald-800 font-medium">Đang làm việc:</span>
            <strong className="font-numeric text-emerald-800 font-bold">
              {staffList.filter(s => s.trangThai === 'ĐANG LÀM').length} người
            </strong>
          </div>
          <div className="p-2 bg-blue-50/60 rounded-lg flex items-center justify-between">
            <span className="text-blue-900 font-medium">Hệ số L1 bình quân:</span>
            <strong className="font-numeric text-blue-950 font-bold">
              {(staffList.reduce((sum, s) => sum + (s.heSoLuong || 0), 0) / (staffList.length || 1)).toFixed(2)}
            </strong>
          </div>
          <div className="p-2 bg-purple-50/60 rounded-lg flex items-center justify-between">
            <span className="text-purple-900 font-medium">Lương vị trí toàn Quỹ:</span>
            <strong className="font-numeric text-purple-950 font-bold">
              {formatCurrency(staffList.reduce((sum, s) => sum + ((s.heSoLuong || 0) * baseSalary), 0))}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. HIỂN THỊ DẠNG BẢNG CHI TIẾT (TABLE VIEW) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3 text-center w-10">STT</th>
                  <th className="p-3 w-16 text-center">Mã NV</th>
                  <th className="p-3 min-w-[150px]">Họ và Tên</th>
                  <th className="p-3 min-w-[130px]">Chức Danh & Khối</th>
                  <th className="p-3 text-center">Bậc</th>
                  <th className="p-3 text-right">Hệ Số L1</th>
                  <th className="p-3 text-right">Lương Vị Trí (L1)</th>
                  <th className="p-3 text-right">Đóng BHXH</th>
                  <th className="p-3 text-right">Phụ Cấp TN</th>
                  <th className="p-3 text-center">NPT</th>
                  <th className="p-3 min-w-[130px]">TK Agribank</th>
                  <th className="p-3 text-center">Trạng Thái</th>
                  <th className="p-3 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((staff, idx) => {
                  const luongViTri = Math.round((staff.heSoLuong || 0) * baseSalary);
                  const mucBhxh = staff.mucDongBhxh || luongViTri;

                  return (
                    <tr key={staff.maNV} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 text-center font-numeric text-slate-400">{idx + 1}</td>
                      <td className="p-3 text-center font-numeric font-bold text-brand-navy bg-slate-50/50">
                        {staff.maNV}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{staff.hoTen}</div>
                        <div className="text-[10px] text-slate-400">{staff.dienThoai || 'Chưa có SĐT'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{staff.chucDanh}</div>
                        <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                          {staff.phongBan}
                        </span>
                      </td>
                      <td className="p-3 text-center font-numeric text-slate-600">
                        {staff.bac || 1}
                      </td>
                      <td className="p-3 text-right font-numeric font-bold text-blue-900 bg-blue-50/30">
                        {Number(staff.heSoLuong || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-numeric font-bold text-slate-900">
                        {formatCurrency(luongViTri)}
                      </td>
                      <td className="p-3 text-right font-numeric font-bold text-emerald-700 bg-emerald-50/20">
                        {formatCurrency(mucBhxh)}
                      </td>
                      <td className="p-3 text-right font-numeric text-slate-700">
                        {staff.phuCapTN > 0 ? formatCurrency(staff.phuCapTN) : '-'}
                      </td>
                      <td className="p-3 text-center font-numeric">
                        {staff.soNPT > 0 ? (
                          <span className="font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded text-[11px]">
                            {staff.soNPT}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-numeric text-xs font-semibold text-slate-800">
                          {staff.soTaiKhoanNH || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">{staff.tenNganHang}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          staff.trangThai === 'ĐANG LÀM'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {staff.trangThai}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedStaff(staff)}
                            className="p-1.5 text-slate-500 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết hồ sơ 360°"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin & lương"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 3. HIỂN THỊ DẠNG LƯỚI THẺ 360° (GRID VIEW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const luongViTri = Math.round((staff.heSoLuong || 0) * baseSalary);
            const mucBhxh = staff.mucDongBhxh || luongViTri;

            return (
              <div key={staff.maNV} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow space-y-3.5">
                {/* Header thẻ */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy font-bold text-base">
                      {staff.hoTen.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{staff.hoTen}</h3>
                      <div className="text-xs text-brand-navy font-semibold flex items-center space-x-1.5">
                        <span className="font-numeric">{staff.maNV}</span>
                        <span>•</span>
                        <span>{staff.chucDanh}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    staff.trangThai === 'ĐANG LÀM'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {staff.trangThai}
                  </span>
                </div>

                {/* Khối Thông Tin Lương & Ngạch Bậc */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngạch bậc & Hệ số L1:</span>
                    <strong className="font-numeric text-brand-navy font-bold">
                      Bậc {staff.bac || 1} • {Number(staff.heSoLuong || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Lương vị trí ước tính:</span>
                    <strong className="font-numeric text-slate-900 font-bold">
                      {formatCurrency(luongViTri)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mức đóng BHXH đăng ký:</span>
                    <strong className="font-numeric text-emerald-700 font-bold">
                      {formatCurrency(mucBhxh)}
                    </strong>
                  </div>
                  {staff.phuCapTN > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Phụ cấp trách nhiệm:</span>
                      <strong className="font-numeric text-slate-700">
                        {formatCurrency(staff.phuCapTN)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Thông tin liên hệ & Pháp lý */}
                <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{staff.dienThoai || 'Chưa có SĐT'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      <strong className="font-numeric">{staff.soTaiKhoanNH || 'Chưa có STK'}</strong> ({staff.tenNganHang})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>CCCD: <strong className="font-numeric">{staff.cccd}</strong> • NPT: <strong>{staff.soNPT}</strong></span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedStaff(staff)}
                    className="px-3 py-1.5 text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hồ sơ 360°</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(staff)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa & Lương</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL HỒ SƠ 360° CHI TIẾT */}
      {selectedStaff && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStaff(null)}
          title={`Hồ Sơ Cán Bộ 360°: ${selectedStaff.hoTen} (${selectedStaff.maNV})`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Cụm 1: Thông tin chức danh & Ngạch bậc Lương L1 */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-brand-navy font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>CHỨC DANH CÔNG TÁC & HỆ SỐ LƯƠNG VỊ TRÍ (L1)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500">Chức vụ:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedStaff.chucDanh}</div>
                </div>
                <div>
                  <span className="text-slate-500">Khối phòng ban:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedStaff.phongBan}</div>
                </div>
                <div>
                  <span className="text-slate-500">Ngạch bậc lương:</span>
                  <div className="font-numeric font-bold text-brand-navy text-sm mt-0.5">Bậc {selectedStaff.bac || 1}</div>
                </div>
                <div>
                  <span className="text-slate-500">Hệ số lương L1:</span>
                  <div className="font-numeric font-extrabold text-blue-900 text-sm mt-0.5">
                    {Number(selectedStaff.heSoLuong || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-200/60">
                <div>
                  <span className="text-slate-500">Lương vị trí (L1 x 2.5Tr):</span>
                  <div className="font-numeric font-bold text-slate-900 text-sm">
                    {formatCurrency(Math.round((selectedStaff.heSoLuong || 0) * baseSalary))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Mức đóng BHXH đăng ký:</span>
                  <div className="font-numeric font-bold text-emerald-700 text-sm">
                    {formatCurrency(selectedStaff.mucDongBhxh || Math.round((selectedStaff.heSoLuong || 0) * baseSalary))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Phụ cấp chức vụ / TN:</span>
                  <div className="font-numeric font-bold text-slate-800 text-sm">
                    {selectedStaff.phuCapTN > 0 ? formatCurrency(selectedStaff.phuCapTN) : '0 ₫'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cụm 2: Thông tin nhân thân & Pháp lý */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Users className="w-4 h-4 text-slate-600" />
                <span>THÔNG TIN ĐỊNH DANH & PHÁP LÝ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><span className="text-slate-500">Mã cán bộ:</span> <strong className="font-numeric text-brand-navy ml-1">{selectedStaff.maNV}</strong></div>
                <div><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-900 ml-1">{selectedStaff.hoTen}</strong></div>
                <div><span className="text-slate-500">Giới tính:</span> <span className="ml-1 font-semibold">{selectedStaff.gioiTinh}</span></div>
                <div><span className="text-slate-500">Ngày sinh:</span> <span className="font-numeric ml-1">{selectedStaff.ngaySinh}</span></div>
                <div><span className="text-slate-500">Điện thoại:</span> <span className="font-numeric ml-1 font-semibold">{selectedStaff.dienThoai}</span></div>
                <div><span className="text-slate-500">Email:</span> <span className="ml-1 font-semibold text-blue-700">{selectedStaff.email}</span></div>
                <div><span className="text-slate-500">Số CCCD:</span> <strong className="font-numeric ml-1">{selectedStaff.cccd}</strong></div>
                <div><span className="text-slate-500">Ngày cấp:</span> <span className="font-numeric ml-1">{selectedStaff.ngayCapCCCD}</span></div>
                <div><span className="text-slate-500">Nơi cấp:</span> <span className="ml-1">{selectedStaff.noiCapCCCD}</span></div>
                <div><span className="text-slate-500">Ngày vào làm:</span> <span className="font-numeric ml-1 font-semibold">{selectedStaff.ngayVaoLam}</span></div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className="ml-1 font-bold text-emerald-700">{selectedStaff.trangThai}</span></div>
              </div>
              <div className="pt-2 border-t text-slate-600">
                <span className="text-slate-500">Địa chỉ thường trú:</span> {selectedStaff.diaChi}
              </div>
            </div>

            {/* Cụm 3: Chính sách BHXH, Thuế & Ngân Hàng */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Shield className="w-4 h-4 text-slate-600" />
                <span>CHÍNH SÁCH BHXH, THUẾ TNCN & TÀI KHOẢN NGÂN HÀNG</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><span className="text-slate-500">Số sổ BHXH:</span> <strong className="font-numeric ml-1">{selectedStaff.soSoBHXH || 'Chưa cập nhật'}</strong></div>
                <div><span className="text-slate-500">Mã số thuế (MST):</span> <strong className="font-numeric ml-1">{selectedStaff.mst || 'Chưa cập nhật'}</strong></div>
                <div><span className="text-slate-500">Người phụ thuộc:</span> <strong className="font-numeric text-emerald-800 ml-1">{selectedStaff.soNPT || 0} người</strong></div>
                <div><span className="text-slate-500">Số TK Agribank:</span> <strong className="font-numeric text-emerald-800 ml-1 text-sm">{selectedStaff.soTaiKhoanNH || 'Chưa có'}</strong></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Ngân hàng:</span> <span className="ml-1 font-semibold">{selectedStaff.tenNganHang}</span></div>
              </div>
              {selectedStaff.ghiChu && (
                <div className="pt-2 border-t text-slate-600 italic">
                  <span className="text-slate-500 not-italic font-semibold">Ghi chú diễn biến:</span> {selectedStaff.ghiChu}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 5. MODAL FORM THÊM MỚI / CHỈNH SỬA TOÀN DIỆN */}
      {isEditing && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditing(false)}
          title={formData.maNV ? `Chỉnh Sửa Hồ Sơ & Lương: ${formData.hoTen || formData.maNV}` : 'Thêm Mới Cán Bộ Nhân Viên'}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Bộ Tab Chuyển Đổi Trong Form */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveEditTab('personal')}
                className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeEditTab === 'personal'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>1. Định Danh & Cá Nhân</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('salary')}
                className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeEditTab === 'salary'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>2. Vị Trí & Hệ Số Lương L1</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('insurance')}
                className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  activeEditTab === 'insurance'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>3. BHXH, Thuế & Ngân Hàng</span>
              </button>
            </div>

            {/* TAB 1: ĐỊNH DANH & CÁ NHÂN */}
            {activeEditTab === 'personal' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Mã Cán Bộ *</label>
                    <input
                      type="text"
                      required
                      value={formData.maNV || ''}
                      onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-bold focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1 font-semibold">Họ và Tên Cán Bộ *</label>
                    <input
                      type="text"
                      required
                      value={formData.hoTen || ''}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Giới Tính</label>
                    <select
                      value={formData.gioiTinh || 'Nam'}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Ngày Sinh</label>
                    <input
                      type="text"
                      placeholder="dd/MM/yyyy"
                      value={formData.ngaySinh || ''}
                      onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Điện Thoại</label>
                    <input
                      type="text"
                      value={formData.dienThoai || ''}
                      onChange={(e) => setFormData({ ...formData, dienThoai: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Email Cơ Quan</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Số CCCD (12 số)</label>
                    <input
                      type="text"
                      maxLength="12"
                      value={formData.cccd || ''}
                      onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-bold focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Ngày Cấp CCCD</label>
                    <input
                      type="text"
                      placeholder="dd/MM/yyyy"
                      value={formData.ngayCapCCCD || ''}
                      onChange={(e) => setFormData({ ...formData, ngayCapCCCD: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Nơi Cấp CCCD</label>
                    <input
                      type="text"
                      value={formData.noiCapCCCD || ''}
                      onChange={(e) => setFormData({ ...formData, noiCapCCCD: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1 font-semibold">Địa Chỉ Thường Trú</label>
                    <input
                      type="text"
                      value={formData.diaChi || ''}
                      onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Trạng Thái Công Tác</label>
                    <select
                      value={formData.trangThai || 'ĐANG LÀM'}
                      onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-emerald-800 focus:ring-1 focus:ring-brand-navy"
                    >
                      <option value="ĐANG LÀM">ĐANG LÀM</option>
                      <option value="THỬ VIỆC">THỬ VIỆC</option>
                      <option value="NGHỈ CHẾ ĐỘ">NGHỈ CHẾ ĐỘ / THAI SẢN</option>
                      <option value="ĐÃ NGHỈ">ĐÃ NGHỈ VIỆC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VỊ TRÍ & HỆ SỐ LƯƠNG L1 */}
            {activeEditTab === 'salary' && (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                  💡 <strong>Gợi ý:</strong> Chọn chức danh từ danh mục sẽ tự động gợi ý Bậc lương và Hệ số lương tương ứng theo quy chế 2027.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Vị Trí Chức Danh *</label>
                    <select
                      value={formData.chucDanh || ''}
                      onChange={(e) => handlePositionChange(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-brand-navy"
                    >
                      {positions.length > 0 ? (
                        positions.map(p => (
                          <option key={p.maViTri} value={p.tenChucDanh}>
                            {p.tenChucDanh} ({p.khoi} - Bậc {p.bac})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Chủ tịch HĐQT">Chủ tịch HĐQT</option>
                          <option value="Giám đốc">Giám đốc</option>
                          <option value="Phó Giám đốc">Phó Giám đốc</option>
                          <option value="Trưởng BKS">Trưởng BKS</option>
                          <option value="Kế toán trưởng">Kế toán trưởng</option>
                          <option value="Ủy viên HĐQT">Ủy viên HĐQT</option>
                          <option value="Kiểm soát viên">Kiểm soát viên</option>
                          <option value="Cán bộ tín dụng">Cán bộ tín dụng</option>
                          <option value="Kế toán viên">Kế toán viên</option>
                          <option value="Bảo vệ - Thủ quỹ">Bảo vệ - Thủ quỹ</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Khối Phòng Ban</label>
                    <select
                      value={formData.phongBan || 'Tín dụng'}
                      onChange={(e) => setFormData({ ...formData, phongBan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    >
                      <option value="Lãnh đạo">Lãnh đạo & Điều hành</option>
                      <option value="Tín dụng">Kinh doanh & Tín dụng</option>
                      <option value="Kế toán">Kế toán & Ngân quỹ</option>
                      <option value="Kiểm soát">Ban Kiểm soát</option>
                      <option value="Hỗ trợ">Văn phòng & Hỗ trợ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Bậc Lương Chức Danh</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.bac || 1}
                      onChange={(e) => setFormData({ ...formData, bac: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Hệ Số Lương L1 *</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="10.0"
                      required
                      value={formData.heSoLuong || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          heSoLuong: val,
                          mucDongBhxh: Math.round(val * baseSalary)
                        });
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-extrabold text-blue-900 focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Lương Vị Trí Ước Tính</label>
                    <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-numeric font-bold text-slate-900">
                      {formatCurrency(Math.round((formData.heSoLuong || 0) * baseSalary))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Phụ Cấp Trách Nhiệm (₫/tháng)</label>
                    <input
                      type="number"
                      step="50000"
                      min="0"
                      value={formData.phuCapTN || 0}
                      onChange={(e) => setFormData({ ...formData, phuCapTN: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-bold focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Số Quyết Định Nâng Bậc / Bổ Nhiệm</label>
                    <input
                      type="text"
                      value={formData.soQD || ''}
                      onChange={(e) => setFormData({ ...formData, soQD: e.target.value })}
                      placeholder="NQ-01/2027/NQ-HĐQT"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Ngày Hiệu Lực Quyết Định</label>
                    <input
                      type="text"
                      value={formData.ngayQD || ''}
                      onChange={(e) => setFormData({ ...formData, ngayQD: e.target.value })}
                      placeholder="01/01/2027"
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BHXH, THUẾ & NGÂN HÀNG */}
            {activeEditTab === 'insurance' && (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="font-bold mb-0.5">Chính sách đóng BHXH linh hoạt:</div>
                  Cán bộ có thể chọn đóng đủ theo Lương vị trí (L1) hoặc chọn đóng ở mức sàn 5.000.000 ₫. Tiền thừa 23.5% Quỹ tiết kiệm được sẽ hoàn trả lại cho cán bộ.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Mức Lương Đóng BHXH Đăng Ký (₫) *</label>
                    <div className="flex space-x-1.5">
                      <input
                        type="number"
                        step="50000"
                        min="5000000"
                        required
                        value={formData.mucDongBhxh || 0}
                        onChange={(e) => setFormData({ ...formData, mucDongBhxh: Number(e.target.value) || 0 })}
                        className="flex-1 p-2 border border-slate-300 rounded-lg font-numeric font-bold text-emerald-800 focus:ring-1 focus:ring-brand-navy"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mucDongBhxh: 5000000 })}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-[11px] text-slate-700"
                        title="Đặt về mức sàn 5 triệu"
                      >
                        Sàn 5Tr
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mucDongBhxh: Math.round((formData.heSoLuong || 2.5) * baseSalary) })}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold text-[11px] text-blue-800"
                        title="Đặt theo Lương vị trí L1"
                      >
                        Theo L1
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Số Sổ BHXH</label>
                    <input
                      type="text"
                      value={formData.soSoBHXH || ''}
                      onChange={(e) => setFormData({ ...formData, soSoBHXH: e.target.value })}
                      placeholder="Mã số BHXH 10 số"
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Mã Số Thuế Cá Nhân (MST)</label>
                    <input
                      type="text"
                      value={formData.mst || ''}
                      onChange={(e) => setFormData({ ...formData, mst: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Số Người Phụ Thuộc (Giảm trừ gia cảnh)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.soNPT || 0}
                      onChange={(e) => setFormData({ ...formData, soNPT: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-bold focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Số Tài Khoản Agribank Nhận Lương *</label>
                    <input
                      type="text"
                      value={formData.soTaiKhoanNH || ''}
                      onChange={(e) => setFormData({ ...formData, soTaiKhoanNH: e.target.value })}
                      placeholder="Số tài khoản thẻ Agribank"
                      className="w-full p-2 border border-slate-300 rounded-lg font-numeric font-bold text-emerald-800 focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Tên Ngân Hàng Chi Nhánh</label>
                    <input
                      type="text"
                      value={formData.tenNganHang || 'Agribank Quý Lộc'}
                      onChange={(e) => setFormData({ ...formData, tenNganHang: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ghi Chú Quá Trình Công Tác & Lương</label>
                  <textarea
                    rows="2"
                    value={formData.ghiChu || ''}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    placeholder="Diễn biến nâng bậc lương, điều động công tác..."
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-navy"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Thông báo thành công */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Footer nút bấm */}
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-[11px] text-slate-400">
                Mã định danh: <strong className="font-numeric text-slate-700">{formData.maNV}</strong>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Đang Lưu...' : 'Lưu Hồ Sơ & Lương'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
