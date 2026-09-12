import React from 'react';
import { Receipt, History, CheckCircle, AlertCircle } from 'lucide-react';
import { formatVnd } from '../../utils/currency';

export function AllowancesModule({ data }) {
  const allowances = data?.allowances || [];
  const allowanceHistory = data?.allowanceHistory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-brand-navy" />
          <h2 className="font-bold text-slate-900 text-base">
            Danh Mục 10 Khoản Phụ Cấp, Khoán & Quy Tắc Tính Thuế / BHXH
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Căn cứ pháp lý theo TT 111/2013/TT-BTC và Luật BHXH 2024 • Quản lý lịch sử thay đổi theo chuẩn SCD Type 2.
        </p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lịch Sử Thay Đổi Định Mức Khoán (SCD Type 2) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center space-x-2">
          <History className="w-5 h-5 text-brand-navy" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Lịch Sử Thay Đổi Định Mức Khoán (SCD Type 2)</h3>
            <p className="text-xs text-slate-500">Lưu vết mọi điều chỉnh mức tiền từ các năm trước để làm căn cứ tra cứu bất biến</p>
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
                  <td className="px-3 py-2.5 text-slate-500 italic">{item.lyDo}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.trangThai === 'HIỆN TẠI' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
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
    </div>
  );
}
