import React, { useState } from 'react';
import { Receipt, History, PlusCircle, CheckCircle, AlertCircle, Save, X, Edit3 } from 'lucide-react';
import { formatVnd } from '../../utils/currency';

export function AllowancesModule({ data, onSaveAllowances, onSaveHistory }) {
  const allowances = data?.allowances || [];
  const allowanceHistory = data?.allowanceHistory || [];

  // Modal điều chỉnh định mức khoán (SCD-2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState(null);
  const [mucMoi, setMucMoi] = useState(0);
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [ngayHieuLuc, setNgayHieuLuc] = useState(new Date().toISOString().split('T')[0]);
  const [nguoiKy, setNguoiKy] = useState('Chủ tịch HĐQT');
  const [lyDo, setLyDo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenEdit = (al) => {
    setSelectedAllowance(al);
    // Tìm mức hiện tại từ history hoặc mặc định
    const hist = allowanceHistory.find(h => h.maKhoan === al.maKhoan);
    const currentRate = hist ? hist.mucMoi : (al.mucMienThueToiDa || 730000);
    setMucMoi(currentRate);
    setSoQuyetDinh('NQ-HĐQT/2027');
    setLyDo('Điều chỉnh theo Quy chế chi tiêu nội bộ mới');
    setIsModalOpen(true);
  };

  const handleSubmitHistory = async (e) => {
    e.preventDefault();
    if (!selectedAllowance) return;
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const hist = allowanceHistory.find(h => h.maKhoan === selectedAllowance.maKhoan);
      const mucCu = hist ? hist.mucMoi : (selectedAllowance.mucMienThueToiDa || 0);

      const historyRecord = {
        maBanGhi: `LSK_${selectedAllowance.maKhoan}_${Date.now()}`,
        maKhoan: selectedAllowance.maKhoan,
        tenKhoan: selectedAllowance.tenKhoan,
        doiTuong: 'Toàn bộ CBNV Quỹ',
        mucCu: Number(mucCu),
        mucMoi: Number(mucMoi),
        donViTinh: '₫/tháng',
        tuNgay: ngayHieuLuc,
        denNgay: '31/12/2099',
        soQuyetDinh: soQuyetDinh,
        ngayQuyetDinh: ngayHieuLuc,
        nguoiKy: nguoiKy,
        lyDo: lyDo,
        trangThai: 'HIỆN TẠI'
      };

      if (onSaveHistory) {
        await onSaveHistory(historyRecord);
      }
      setSuccessMsg('✅ Đã lưu vết thay đổi định mức khoán thành công (SCD-2)!');
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      alert('Lỗi lưu lịch sử: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-brand-navy" />
              <h2 className="font-bold text-slate-900 text-base">
                Danh Mục Các Khoản Phụ Cấp, Khoán & Quy Tắc Tính Thuế / BHXH
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Căn cứ pháp lý theo TT 111/2013/TT-BTC và Luật BHXH 2024 • Quản lý lịch sử thay đổi theo chuẩn SCD Type 2.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 hidden md:inline">Lưu vết lịch sử:</span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
              SCD Type 2 Active
            </span>
          </div>
        </div>
      </div>

      {/* Table Danh Mục Phụ Cấp */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-navy text-white font-semibold">
              <tr>
                <th className="px-3 py-3">Mã Khoản</th>
                <th className="px-3 py-3">Tên Khoản Phụ Cấp / Khoán</th>
                <th className="px-3 py-3">Phân Loại</th>
                <th className="px-3 py-3 text-center">Tính BHXH?</th>
                <th className="px-3 py-3 text-center">Tính Thuế TNCN?</th>
                <th className="px-3 py-3 text-right">Miễn Thuế Tối Đa</th>
                <th className="px-3 py-3">Căn Cứ Pháp Lý & Quy Chế</th>
                <th className="px-3 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allowances.map((al) => (
                <tr key={al.maKhoan} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-brand-navy">{al.maKhoan}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{al.tenKhoan}</td>
                  <td className="px-3 py-2.5 text-slate-600">{al.phanLoaiChi}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      al.tinhBHXH === 'CÓ' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {al.tinhBHXH}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      al.tinhThueTNCN === 'CÓ' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {al.tinhThueTNCN}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                    {al.mucMienThueToiDa > 0 ? formatVnd(al.mucMienThueToiDa) : 'Theo thực tế'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{al.canCuPhapLy}</td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleOpenEdit(al)}
                      className="px-2.5 py-1 bg-brand-navy/10 hover:bg-brand-navy hover:text-white text-brand-navy rounded font-semibold text-[11px] transition-all inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Đổi mức</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lịch Sử Thay Đổi Định Mức Khoán (SCD Type 2) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brand-navy" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sổ Theo Dõi Lịch Sử Thay Đổi Định Mức Khoán (SCD-2)</h3>
              <p className="text-xs text-slate-500">Lưu vết mọi điều chỉnh mức tiền từ các năm trước để làm căn cứ tra cứu bất biến</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-3 py-2.5">Khoản Khoán</th>
                <th className="px-3 py-2.5">Đối Tượng</th>
                <th className="px-3 py-2.5 text-right">Mức Cũ</th>
                <th className="px-3 py-2.5 text-right font-bold text-brand-navy">Mức Mới</th>
                <th className="px-3 py-2.5 text-center">Hiệu Lực</th>
                <th className="px-3 py-2.5">Căn Cứ Quyết Định</th>
                <th className="px-3 py-2.5">Người Ký</th>
                <th className="px-3 py-2.5">Lý Do Thay Đổi</th>
                <th className="px-3 py-2.5 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allowanceHistory.map((item) => (
                <tr key={item.maBanGhi} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-medium text-slate-900">{item.tenKhoan}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.doiTuong}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{formatVnd(item.mucCu)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-emerald-700">{formatVnd(item.mucMoi)}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-slate-600">{item.tuNgay} - {item.denNgay}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.soQuyetDinh}</td>
                  <td className="px-3 py-2.5 text-slate-600 font-semibold">{item.nguoiKy}</td>
                  <td className="px-3 py-2.5 text-slate-500 italic">{item.lyDo}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.trangThai === 'HIỆN TẠI' || item.trangThai === 'ĐANG_HIỆU_LỰC' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Điều Chỉnh Định Mức Khoán (SCD-2) */}
      {isModalOpen && selectedAllowance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-navy p-4 text-white flex justify-between items-center">
              <div className="font-bold text-sm flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-brand-lime" />
                <span>Điều Chỉnh Định Mức: {selectedAllowance.tenKhoan}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHistory} className="p-6 space-y-4 text-xs">
              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mức Định Mức Mới (VNĐ/tháng)</label>
                <input
                  type="number"
                  required
                  step="10000"
                  value={mucMoi}
                  onChange={(e) => setMucMoi(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Số Quyết Định / Nghị Quyết</label>
                <input
                  type="text"
                  required
                  value={soQuyetDinh}
                  onChange={(e) => setSoQuyetDinh(e.target.value)}
                  placeholder="Ví dụ: NQ-08/HĐQT/2027..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngày Bắt Đầu Áp Dụng</label>
                  <input
                    type="date"
                    required
                    value={ngayHieuLuc}
                    onChange={(e) => setNgayHieuLuc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Người Ký / Ban Hành</label>
                  <input
                    type="text"
                    required
                    value={nguoiKy}
                    onChange={(e) => setNguoiKy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lý Do Điều Chỉnh</label>
                <textarea
                  rows={2}
                  required
                  value={lyDo}
                  onChange={(e) => setLyDo(e.target.value)}
                  placeholder="Nêu rõ lý do thay đổi định mức để lưu vết lịch sử..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang Lưu...' : 'Lưu Vào SCD-2'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
