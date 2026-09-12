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
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ activeTab, onTabChange, user }) {
  const isEmployee = user?.role === 'NHAN_VIEN';

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan & Chỉ số', icon: LayoutDashboard, hidden: isEmployee },
    { id: 'payroll', label: 'Bảng tính lương Quỹ', icon: CreditCard, hidden: isEmployee },
    { id: 'timesheets', label: 'Bảng chấm công', icon: CalendarCheck, hidden: isEmployee },
    { id: 'selfservice', label: 'Phiếu lương của tôi', icon: UserCheck },
    { id: 'staff', label: 'Danh mục 12 CBNV', icon: Users, hidden: isEmployee },
    { id: 'positions', label: 'Khung chức danh & PA', icon: Briefcase, hidden: isEmployee },
    { id: 'kpi', label: 'Đánh giá KPI tháng', icon: Award, hidden: isEmployee },
    { id: 'allowances', label: 'Phụ cấp & Khoán SCD-2', icon: Receipt, hidden: isEmployee },
    { id: 'admin', label: 'Phân quyền & Nhật ký', icon: ShieldCheck, hidden: user?.role !== 'SUPER_ADMIN' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block">
      <div className="p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
          Phân Hệ Quản Trị
        </div>
        <nav className="space-y-1">
          {menuItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-navy text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-lime' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
