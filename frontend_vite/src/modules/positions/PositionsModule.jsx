import React from 'react';
import { Briefcase, CheckCircle } from 'lucide-react';
import { formatVnd } from '../../utils/currency';

export function PositionsModule({ data }) {
  const positions = data?.positions || [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-brand-navy" />
          <h2 className="font-bold text-slate-900 text-base">
            Khung 10 Vị Trí Chức Danh & Hệ Số Lương 3 Phương Án (PA1 / PA2 / PA3)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Nghị quyết HĐQT áp dụng khung lương 2027 Pro V2 • PA2 là phương án đề xuất chuẩn đang vận hành.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-navy text-white font-semibold">
              <tr>
                <th className="px-3 py-3 text-center border-r border-slate-600 w-12">Mã</th>
                <th className="px-3 py-3 border-r border-slate-600 min-w-[150px]">Tên Chức Danh</th>
                <th className="px-3 py-3 border-r border-slate-600 min-w-[100px]">Khối</th>
                <th className="px-3 py-3 text-center border-r border-slate-600">Bậc</th>
                <th className="px-3 py-3 text-center border-r border-slate-600">Số Lượng</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 bg-slate-800">PA1 Hệ Số</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 font-bold bg-blue-900 text-brand-lime">PA2 Hệ Số (Chuẩn)</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 bg-slate-800">PA3 Hệ Số</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">PA2 KPI %</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">PA2 Thưởng %</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 text-emerald-300">Phụ Cấp TN</th>
                <th className="px-3 py-3 text-right text-emerald-300">Thù Lao QT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((pos) => (
                <tr key={pos.maViTri} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-center font-bold text-brand-navy">{pos.maViTri}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{pos.tenChucDanh}</td>
                  <td className="px-3 py-2.5 text-slate-600">{pos.khoi}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{pos.bac}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{pos.soLuong}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 bg-slate-50">{pos.pa1HeSo.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-brand-navy bg-blue-50/80">{pos.pa2HeSo.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 bg-slate-50">{pos.pa3HeSo.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{(pos.pa2Kpi * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2.5 text-right font-mono">{(pos.pa2Thuong * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-700 font-medium">{formatVnd(pos.phuCapTN)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-700 font-medium">{formatVnd(pos.thuLaoQT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
