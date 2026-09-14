import React, { useState } from 'react';
import { Briefcase, Edit3, Save, CheckCircle, TableProperties, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export function PositionsModule({ data, onSavePositions }) {
  const initialPositions = data?.positions || [];
  const baseSalary = data?.salaryParams?.LUONG_CO_SO || data?.params?.BASIC_SALARY || 2340000;
  const [positions, setPositions] = useState(initialPositions);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [viewUnit, setViewUnit] = useState('COEFFICIENT'); // 'COEFFICIENT' | 'AMOUNT'

  // Cập nhật giá trị khi đang chỉnh sửa
  const handleGradeChange = (maViTri, field, value) => {
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
      setSuccessMsg('✅ Đã lưu cập nhật khung 5 bậc lương chức danh thành công vào CSDL!');
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <TableProperties className="w-5 h-5 text-brand-navy" />
              <h2 className="font-bold text-slate-900 text-base">
                Bảng Lương 5 Bậc Theo Vị Trí Công Tác & Năm Đảm Nhiệm
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quy chế chi trả thu nhập Quỹ tín dụng nhân dân Yên Thọ • Chu kỳ nâng bậc chuẩn 3 năm/bậc • Vượt khung chung toàn Quỹ sau Bậc 5.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chuyển đổi hiển thị Hệ số vs Số tiền */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewUnit('COEFFICIENT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewUnit === 'COEFFICIENT' ? 'bg-white text-brand-navy shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hệ Số Lương
              </button>
              <button
                onClick={() => setViewUnit('AMOUNT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewUnit === 'AMOUNT' ? 'bg-white text-brand-navy shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Số Tiền (2.34Tr)
              </button>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
              >
                <Edit3 className="w-4 h-4 text-brand-lime" />
                <span>Chỉnh Sửa 5 Bậc</span>
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

        {/* Khối Nguyên Tắc Nghiệp Vụ Cốt Lõi */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <div>
              <strong>Nguyên tắc 5 bậc ngạch vị trí:</strong> Mỗi vị trí công tác có 5 bậc lương từ Bậc 1 đến Bậc 5 (thời gian giữ bậc chuẩn là <strong>3 năm/bậc</strong>).
            </div>
            <div>
              <strong>Vượt khung chung toàn Quỹ:</strong> Sau khi hoàn thành Bậc 5 (bậc trần), mỗi chu kỳ 3 năm tiếp theo được tính <strong>+5% vượt khung</strong> trên lương ngạch bậc, áp dụng chung toàn Quỹ (tối đa 8 lần = 40%).
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Bảng 5 Bậc Lương Chức Danh */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-navy text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="px-3 py-3 text-center border-r border-slate-700 w-12">Mã</th>
                <th className="px-3 py-3 border-r border-slate-700 min-w-[150px]">Vị Trí Chức Danh</th>
                <th className="px-3 py-3 border-r border-slate-700 text-center w-28">Khối</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 bg-blue-950/70 w-24">Bậc 1 (Năm 1-3)</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 bg-blue-950/70 w-24">Bậc 2 (Năm 4-6)</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 bg-blue-900 w-24 text-brand-lime font-extrabold">Bậc 3 (Năm 7-9)</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 bg-blue-950/70 w-24">Bậc 4 (Năm 10-12)</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 bg-blue-950/70 w-24">Bậc 5 (Trần)</th>
                <th className="px-3 py-3 text-center border-r border-slate-700 w-28">Vượt Khung</th>
                <th className="px-3 py-3 text-right border-r border-slate-700 w-28">Phụ Cấp TN</th>
                <th className="px-3 py-3 text-center w-24">Nhóm Khoán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {positions.map((pos) => {
                const b1 = Number(pos.heSoBac1 || pos.pa1HeSo || 0);
                const b2 = Number(pos.heSoBac2 || pos.pa2HeSo || 0);
                const b3 = Number(pos.heSoBac3 || pos.pa3HeSo || 0);
                const b4 = Number(pos.heSoBac4 || (b3 > 0 ? (b3 + 0.20) : 0));
                const b5 = Number(pos.heSoBac5 || (b4 > 0 ? (b4 + 0.20) : 0));

                const renderCell = (field, val) => {
                  if (isEditing) {
                    return (
                      <input
                        type="number"
                        step="0.05"
                        min="1.0"
                        max="10.0"
                        value={val}
                        onChange={(e) => handleGradeChange(pos.maViTri, field, e.target.value)}
                        className="w-16 px-1.5 py-1 border border-brand-navy rounded text-center font-numeric font-bold text-xs focus:ring-1 focus:ring-brand-navy"
                      />
                    );
                  }
                  if (viewUnit === 'AMOUNT') {
                    return (
                      <span className="font-numeric font-bold text-slate-800">
                        {formatCurrency(Math.round(val * baseSalary))}
                      </span>
                    );
                  }
                  return (
                    <span className="font-numeric font-bold text-slate-900">
                      {val.toFixed(2)}
                    </span>
                  );
                };

                return (
                  <tr key={pos.maViTri} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-3 text-center font-numeric font-bold text-brand-navy bg-slate-50/50">
                      {pos.maViTri}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {pos.tenChucDanh}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {pos.khoi}
                      </span>
                    </td>

                    {/* Bậc 1 */}
                    <td className="px-3 py-3 text-center bg-slate-50/60">
                      {renderCell('heSoBac1', b1)}
                    </td>

                    {/* Bậc 2 */}
                    <td className="px-3 py-3 text-center bg-slate-50/60">
                      {renderCell('heSoBac2', b2)}
                    </td>

                    {/* Bậc 3 (Trung bình) */}
                    <td className="px-3 py-3 text-center bg-blue-50/50 border-x border-blue-100">
                      {renderCell('heSoBac3', b3)}
                    </td>

                    {/* Bậc 4 */}
                    <td className="px-3 py-3 text-center bg-slate-50/60">
                      {renderCell('heSoBac4', b4)}
                    </td>

                    {/* Bậc 5 (Trần) */}
                    <td className="px-3 py-3 text-center bg-purple-50/30">
                      {renderCell('heSoBac5', b5)}
                    </td>

                    {/* Vượt khung */}
                    <td className="px-3 py-3 text-center text-[11px] text-slate-600 font-numeric">
                      <span className="font-bold text-emerald-700">+5%</span> / 3 năm
                    </td>

                    {/* Phụ cấp TN */}
                    <td className="px-3 py-3 text-right font-numeric font-bold text-slate-700">
                      {pos.phuCapTN > 0 ? formatCurrency(pos.phuCapTN) : '-'}
                    </td>

                    {/* Nhóm khoán */}
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        pos.nhomKhoan === 'HDQT'
                          ? 'bg-purple-100 text-purple-800'
                          : pos.nhomKhoan === 'TP_PP'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pos.nhomKhoan || 'CBNV'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
