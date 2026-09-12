import React, { useState, useEffect } from 'react';
import { Save, Calendar, CheckCircle } from 'lucide-react';

export function TimesheetsModule({ data, period, onSaveTimesheets }) {
  const staffList = data?.staffList || [];
  const initialTimesheets = data?.timesheets || [];

  const [timesheetData, setTimesheetData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Kết hợp staffList với initialTimesheets
    const merged = staffList.map(staff => {
      const existing = initialTimesheets.find(t => t.maNV === staff.maNV);
      return {
        maNV: staff.maNV,
        hoTen: staff.hoTen,
        chucDanh: staff.chucDanh,
        congChuan: existing?.congChuan || 22,
        congThucTe: existing?.congThucTe !== undefined ? existing.congThucTe : 22,
        nghiPhep: existing?.nghiPhep || 0,
        nghiKhongLuong: existing?.nghiKhongLuong || 0,
        ghiChu: existing?.ghiChu || ''
      };
    });
    setTimesheetData(merged);
  }, [staffList, initialTimesheets]);

  const handleChange = (maNV, field, value) => {
    setTimesheetData(prev => prev.map(item => {
      if (item.maNV === maNV) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTimesheets(period, timesheetData);
      alert(`✅ Đã lưu bảng chấm công kỳ ${period} thành công!`);
    } catch (err) {
      alert(`❌ Lỗi khi lưu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-brand-navy" />
          <h2 className="font-bold text-slate-900 text-base">
            Bảng Chấm Công & Ngày Phép: Kỳ Tháng {period}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Đang Lưu...' : 'Lưu Bảng Chấm Công'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-navy text-white font-semibold">
              <tr>
                <th className="px-3 py-3 text-center w-12">STT</th>
                <th className="px-3 py-3">Mã NV</th>
                <th className="px-3 py-3">Họ và Tên</th>
                <th className="px-3 py-3">Chức Danh</th>
                <th className="px-3 py-3 text-center w-28">Công Chuẩn</th>
                <th className="px-3 py-3 text-center w-28">Công Thực Tế</th>
                <th className="px-3 py-3 text-center w-28">Nghỉ Phép</th>
                <th className="px-3 py-3 text-center w-28">Không Lương</th>
                <th className="px-3 py-3 text-center w-28 font-bold bg-blue-900/60">Tổng Hưởng Lương</th>
                <th className="px-3 py-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timesheetData.map((item, idx) => {
                const totalPaidWork = Number(item.congThucTe || 0) + Number(item.nghiPhep || 0);
                return (
                  <tr key={item.maNV} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-bold text-brand-navy">{item.maNV}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{item.hoTen}</td>
                    <td className="px-3 py-2 text-slate-600">{item.chucDanh}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.congChuan}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        step="0.5"
                        value={item.congThucTe}
                        onChange={(e) => handleChange(item.maNV, 'congThucTe', Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center font-mono border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        step="0.5"
                        value={item.nghiPhep}
                        onChange={(e) => handleChange(item.maNV, 'nghiPhep', Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center font-mono border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy focus:outline-none text-emerald-700"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        step="0.5"
                        value={item.nghiKhongLuong}
                        onChange={(e) => handleChange(item.maNV, 'nghiKhongLuong', Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center font-mono border border-slate-300 rounded focus:ring-1 focus:ring-brand-navy focus:outline-none text-rose-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-center font-bold font-mono text-brand-navy bg-blue-50/50">
                      {totalPaidWork} ngày
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.ghiChu}
                        onChange={(e) => handleChange(item.maNV, 'ghiChu', e.target.value)}
                        placeholder="Ghi chú..."
                        className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none text-xs"
                      />
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
