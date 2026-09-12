import React from 'react';
import { Users, DollarSign, CalendarCheck, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { formatVnd } from '../../utils/currency';

export function DashboardModule({ data, period, onTabChange }) {
  const staffList = data?.staffList || [];
  const payrollHistory = data?.payrollHistory || [];
  const positions = data?.positions || [];

  // Tính tổng hợp số liệu kỳ này
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.trangThai === 'ĐANG LÀM').length;

  // Tính tổng lương ước tính từ payrollHistory hoặc tính sơ bộ
  const totalGross = payrollHistory.reduce((acc, cur) => acc + (Number(cur.tongGross) || 0), 0);
  const totalNet = payrollHistory.reduce((acc, cur) => acc + (Number(cur.thucLinh) || 0), 0);
  const totalInsurance = payrollHistory.reduce((acc, cur) => acc + (Number(cur.bhxhDonVi) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy-dark text-white rounded-2xl p-6 shadow-md border border-brand-navy-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold bg-brand-lime/20 text-brand-lime px-2.5 py-1 rounded-full mb-2 border border-brand-lime/30">
              <span>Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ</span>
            </div>
            <h1 className="text-2xl font-bold">Bảng Tin Quản Trị Lương & Nhân Sự</h1>
            <p className="text-slate-300 text-sm mt-1">
              Kỳ lương tháng <span className="font-bold text-white">{period}</span> • 100% Đồng bộ Google Sheets
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTabChange('payroll')}
              className="bg-brand-lime text-slate-900 hover:bg-lime-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <span>Xem Bảng Lương Quỹ</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTabChange('timesheets')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-white/20"
            >
              Chấm Công Tháng
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TỔNG NHÂN SỰ ĐANG LÀM"
          value={`${activeStaff} / ${totalStaff} Cán bộ`}
          subtext="12 CBNV cơ hữu Quỹ tín dụng"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="TỔNG QUỸ LƯƠNG GROSS"
          value={totalGross > 0 ? formatVnd(totalGross) : 'Đang dự thảo'}
          subtext={`Kỳ lương ${period}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="TỔNG THỰC LĨNH (NET)"
          value={totalNet > 0 ? formatVnd(totalNet) : 'Đang tính toán'}
          subtext="Tiền chi qua TK Agribank"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="BHXH QUỸ ĐÓNG (21.5%)"
          value={totalInsurance > 0 ? formatVnd(totalInsurance) : 'Theo quy chế'}
          subtext="Luật BHXH 2024 mới nhất"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Staff Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Danh Sách 12 Cán Bộ Nhân Viên Cơ Hữu</h2>
            <p className="text-xs text-slate-500 mt-0.5">Dữ liệu thực tế chuẩn hóa từ sheet DM_NS</p>
          </div>
          <button
            onClick={() => onTabChange('staff')}
            className="text-xs font-semibold text-brand-navy hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Quản lý hồ sơ 360°</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã NV</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3">Chức Danh Công Tác</th>
                <th className="px-4 py-3">Phòng Ban</th>
                <th className="px-4 py-3">Số CCCD</th>
                <th className="px-4 py-3">Số NPT</th>
                <th className="px-4 py-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.slice(0, 6).map((staff) => (
                <tr key={staff.maNV} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-brand-navy">{staff.maNV}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{staff.hoTen}</td>
                  <td className="px-4 py-3 text-slate-600">{staff.chucDanh}</td>
                  <td className="px-4 py-3 text-slate-600">{staff.phongBan}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{staff.cccd}</td>
                  <td className="px-4 py-3 text-center">{staff.soNPT}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {staff.trangThai}
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
