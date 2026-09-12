import React, { useState } from 'react';
import { Briefcase, Edit3, Save, X, CheckCircle, Sliders } from 'lucide-react';
import { formatVnd } from '../../utils/currency';

export function PositionsModule({ data, onSavePositions }) {
  const initialPositions = data?.positions || [];
  const [positions, setPositions] = useState(initialPositions);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Cập nhật giá trị khi đang chỉnh sửa
  const handleCoefficientChange = (maViTri, field, value) => {
    setPositions(prev => prev.map(p => {
      if (p.maViTri === maViTri) {
        return { ...p, [field]: Number(value) || 0 };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      if (onSavePositions) {
        await onSavePositions(positions);
      }
      setSuccessMsg('✅ Đã lưu cập nhật khung hệ số chức danh thành công vào CSDL!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Lỗi lưu chức danh: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPositions(initialPositions);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
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

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
              >
                <Edit3 className="w-4 h-4 text-brand-lime" />
                <span>Chỉnh Sửa Hệ Số</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Bảng Danh Sách Chức Danh */}
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

                  {/* PA1 */}
                  <td className="px-3 py-2.5 text-right font-mono bg-slate-50">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.05"
                        value={pos.pa1HeSo}
                        onChange={(e) => handleCoefficientChange(pos.maViTri, 'pa1HeSo', e.target.value)}
                        className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono text-xs focus:ring-1 focus:ring-brand-navy"
                      />
                    ) : (
                      pos.pa1HeSo.toFixed(2)
                    )}
                  </td>

                  {/* PA2 (Chuẩn) */}
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-brand-navy bg-blue-50/80">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.05"
                        value={pos.pa2HeSo}
                        onChange={(e) => handleCoefficientChange(pos.maViTri, 'pa2HeSo', e.target.value)}
                        className="w-16 px-1.5 py-0.5 border border-brand-navy rounded text-right font-mono font-bold text-xs focus:ring-1 focus:ring-brand-navy"
                      />
                    ) : (
                      pos.pa2HeSo.toFixed(2)
                    )}
                  </td>

                  {/* PA3 */}
                  <td className="px-3 py-2.5 text-right font-mono bg-slate-50">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.05"
                        value={pos.pa3HeSo}
                        onChange={(e) => handleCoefficientChange(pos.maViTri, 'pa3HeSo', e.target.value)}
                        className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono text-xs focus:ring-1 focus:ring-brand-navy"
                      />
                    ) : (
                      pos.pa3HeSo.toFixed(2)
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono">{(pos.pa2Kpi * 100).toFixed(0)}%</td>
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
