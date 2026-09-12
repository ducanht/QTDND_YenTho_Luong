import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarCheck,
  Award,
  Receipt,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Sliders,
  FileText,
  BarChart3,
  Layers
} from 'lucide-react';

export function Sidebar({ activeTab, onTabChange, user, workspaceMode }) {
  const isEmployee = user?.role === 'NHAN_VIEN';

  // Menu cho Phân Hệ Mô Phỏng Quy Chế Lương (HĐQT)
  const simulationMenuItems = [
    { id: 'simulation', label: 'Mô phỏng quy chế', icon: Sliders },
    { id: 'positions', label: 'Khung chức danh & PA', icon: Briefcase },
    { id: 'allowances', label: 'Định mức khoán chi', icon: Receipt },
    { id: 'staff', label: 'Danh mục 12 CBNV', icon: Users }
  ];

  // Menu cho Phân Hệ Theo Dõi Lương Chính Thức Hàng Tháng
  const payrollMenuItems = [
    { id: 'dashboard', label: 'Bàn làm việc kế toán', icon: LayoutDashboard, hidden: isEmployee },
    { id: 'payroll', label: 'Bảng tính lương 4 tầng', icon: CreditCard, hidden: isEmployee },
    { id: 'timesheets', label: 'Chấm công & Ngày phép', icon: CalendarCheck, hidden: isEmployee },
    { id: 'kpi', label: 'Đánh giá KPI tháng', icon: Award, hidden: isEmployee },
    { id: 'selfservice', label: 'Phiếu lương của tôi', icon: UserCheck },
    { id: 'staff', label: 'Hồ sơ nhân sự 12 CBNV', icon: Users, hidden: isEmployee },
    { id: 'positions', label: 'Khung chức danh & Hệ số', icon: Briefcase, hidden: isEmployee },
    { id: 'allowances', label: 'Phụ cấp khoán & SCD-2', icon: Receipt, hidden: isEmployee },
    { id: 'admin', label: 'Phân quyền & Kiểm toán', icon: ShieldCheck, hidden: user?.role !== 'SUPER_ADMIN' }
  ];

  const currentItems = workspaceMode === 'SIMULATION' ? simulationMenuItems : payrollMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block">
      <div className="p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
          {workspaceMode === 'SIMULATION' ? '🏛️ HĐQT: Mô Phỏng Quy Chế' : '📋 Kế Toán: Lương Hàng Tháng'}
        </div>
        <nav className="space-y-1">
          {currentItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? workspaceMode === 'SIMULATION'
                      ? 'bg-brand-navy text-white shadow-sm font-semibold'
                      : 'bg-brand-navy text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? (workspaceMode === 'SIMULATION' ? 'text-amber-400' : 'text-brand-lime') : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
