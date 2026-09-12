import React, { useState } from 'react';
import { Users, Search, Eye, Plus, Edit2, Phone, Mail, CreditCard, Shield, MapPin, Calendar } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export function StaffModule({ data, onSaveStaff }) {
  const staffList = data?.staffList || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const filteredStaff = staffList.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.hoTen.toLowerCase().includes(term) || s.maNV.toLowerCase().includes(term) || s.chucDanh.toLowerCase().includes(term);
  });

  const handleOpenEdit = (staff) => {
    setFormData(staff ? { ...staff } : {
      maNV: `NV${String(staffList.length + 1).padStart(2, '0')}`,
      hoTen: '',
      chucDanh: 'Cán bộ tín dụng',
      phongBan: 'Tín dụng',
      dienThoai: '',
      email: '',
      ngaySinh: '',
      gioiTinh: 'Nam',
      cccd: '',
      ngayCapCCCD: '',
      noiCapCCCD: 'Cục CSQLHC về TTXH',
      diaChi: 'Thôn Tân Lộc, xã Quý Lộc, tỉnh Thanh Hoá',
      ngayVaoLam: '',
      trangThai: 'ĐANG LÀM',
      soNPT: 0,
      soTaiKhoanNH: '',
      tenNganHang: 'Agribank Quý Lộc',
      mst: '',
      soSoBHXH: '',
      ghiChu: ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await onSaveStaff(formData);
      alert('✅ Đã lưu thông tin cán bộ thành công!');
      setIsEditing(false);
    } catch (err) {
      alert(`❌ Lỗi khi lưu: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cán bộ (Tên, Mã NV, chức danh)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy w-64 sm:w-80"
          />
        </div>
        <button
          onClick={() => handleOpenEdit(null)}
          className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mới Cán Bộ</span>
        </button>
      </div>

      {/* Grid Danh Sách CBNV */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div key={staff.maNV} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy font-bold text-sm">
                  {staff.hoTen.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{staff.hoTen}</h3>
                  <div className="text-xs text-brand-navy font-semibold">{staff.maNV} • {staff.chucDanh}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {staff.trangThai}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2.5">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{staff.dienThoai || 'Chưa có SĐT'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{staff.soTaiKhoanNH || 'Chưa có STK'} ({staff.tenNganHang})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>CCCD: <strong className="font-mono">{staff.cccd}</strong> • NPT: <strong>{staff.soNPT}</strong></span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStaff(staff)}
                className="px-2.5 py-1 text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hồ sơ 360°</span>
              </button>
              <button
                onClick={() => handleOpenEdit(staff)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Hồ Sơ 360° */}
      {selectedStaff && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStaff(null)}
          title={`Hồ Sơ Cán Bộ 360°: ${selectedStaff.hoTen} (${selectedStaff.maNV})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><span className="text-slate-500">Mã cán bộ:</span> <strong className="text-brand-navy ml-1">{selectedStaff.maNV}</strong></div>
              <div><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-900 ml-1">{selectedStaff.hoTen}</strong></div>
              <div><span className="text-slate-500">Chức danh công tác:</span> <span className="ml-1 font-semibold">{selectedStaff.chucDanh}</span></div>
              <div><span className="text-slate-500">Khối phòng ban:</span> <span className="ml-1">{selectedStaff.phongBan}</span></div>
              <div><span className="text-slate-500">Ngày sinh:</span> <span className="ml-1">{selectedStaff.ngaySinh}</span> ({selectedStaff.gioiTinh})</div>
              <div><span className="text-slate-500">Ngày vào làm:</span> <span className="ml-1 font-semibold">{selectedStaff.ngayVaoLam}</span></div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="font-bold text-slate-900 uppercase text-[11px] text-brand-navy">Thông Tin Pháp Lý & Ngân Hàng</div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Số CCCD (12 số):</span> <strong className="font-mono ml-1">{selectedStaff.cccd}</strong></div>
                <div><span className="text-slate-500">Ngày cấp:</span> <span className="ml-1">{selectedStaff.ngayCapCCCD}</span></div>
                <div><span className="text-slate-500">Nơi cấp:</span> <span className="ml-1">{selectedStaff.noiCapCCCD}</span></div>
                <div><span className="text-slate-500">Mã số thuế cá nhân:</span> <strong className="font-mono ml-1">{selectedStaff.mst}</strong></div>
                <div><span className="text-slate-500">Số sổ BHXH:</span> <strong className="font-mono ml-1">{selectedStaff.soSoBHXH}</strong></div>
                <div><span className="text-slate-500">Người phụ thuộc (NPT):</span> <strong className="ml-1">{selectedStaff.soNPT} người</strong></div>
                <div><span className="text-slate-500">Số TK Agribank:</span> <strong className="font-mono ml-1 text-emerald-800">{selectedStaff.soTaiKhoanNH}</strong></div>
                <div><span className="text-slate-500">Chi nhánh:</span> <span className="ml-1">{selectedStaff.tenNganHang}</span></div>
              </div>
              <div className="pt-2 border-t text-slate-600">
                <span className="text-slate-500">Địa chỉ thường trú:</span> {selectedStaff.diaChi}
              </div>
              {selectedStaff.ghiChu && (
                <div className="text-slate-600 italic pt-1">
                  <span className="text-slate-500 not-italic font-semibold">Ghi chú diễn biến:</span> {selectedStaff.ghiChu}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Form Thêm/Sửa */}
      {isEditing && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditing(false)}
          title={formData.maNV ? `Chỉnh Sửa Cán Bộ: ${formData.hoTen || formData.maNV}` : 'Thêm Mới Cán Bộ'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Mã Cán Bộ *</label>
                <input
                  type="text"
                  required
                  value={formData.maNV || ''}
                  onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  value={formData.hoTen || ''}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Chức Danh</label>
                <input
                  type="text"
                  value={formData.chucDanh || ''}
                  onChange={(e) => setFormData({ ...formData, chucDanh: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Phòng Ban</label>
                <input
                  type="text"
                  value={formData.phongBan || ''}
                  onChange={(e) => setFormData({ ...formData, phongBan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Số CCCD (12 số)</label>
                <input
                  type="text"
                  value={formData.cccd || ''}
                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Số NPT (Giảm trừ gia cảnh)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soNPT || 0}
                  onChange={(e) => setFormData({ ...formData, soNPT: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Số Tài Khoản Ngân Hàng</label>
                <input
                  type="text"
                  value={formData.soTaiKhoanNH || ''}
                  onChange={(e) => setFormData({ ...formData, soTaiKhoanNH: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Tên Ngân Hàng</label>
                <input
                  type="text"
                  value={formData.tenNganHang || 'Agribank Quý Lộc'}
                  onChange={(e) => setFormData({ ...formData, tenNganHang: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Ghi Chú Diễn Biến Công Tác</label>
              <textarea
                rows="2"
                value={formData.ghiChu || ''}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-navy text-white rounded-lg font-semibold hover:bg-brand-navy-dark"
              >
                Lưu Hồ Sơ
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
