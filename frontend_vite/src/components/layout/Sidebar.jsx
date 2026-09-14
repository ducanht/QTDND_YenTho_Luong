import React, { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  History,
  CalendarCheck,
  BarChart2,
  Award,
  ListChecks,
  CreditCard,
  FileText,
  Receipt,
  PieChart,
  ShieldCheck,
  Sliders,
  GitCompare,
  ScrollText,
  TableProperties,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileSpreadsheet,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

/**
 * Cấu trúc Navigation V3.0 — 6 Phân Hệ × Menu Con
 * Mỗi section có id, label, icon, và danh sách sub-items
 */
const NAV_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Tổng Quan',
    icon: LayoutDashboard,
    color: 'text-slate-600',
    activeColor: 'bg-brand-navy text-white',
    subItems: [
      { id: 'dashboard.overview', label: 'Bảng tổng hợp tháng', icon: LayoutDashboard },
      { id: 'dashboard.trends',   label: 'Xu hướng năm',        icon: TrendingUp },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN', 'LANH_DAO'],
  },
  {
    id: 'simulation',
    label: 'Mô Phỏng',
    icon: Sliders,
    color: 'text-amber-700',
    activeColor: 'bg-amber-700 text-white',
    subItems: [
      { id: 'simulation.salary_structure', label: 'Cơ cấu lương & hệ số',    icon: Briefcase },
      { id: 'simulation.allowances',       label: 'Khoán & phụ cấp',          icon: Receipt },
      { id: 'simulation.insurance_tax',    label: 'BHXH & thuế TNCN',         icon: ShieldCheck },
      { id: 'simulation.scenarios',        label: 'Phương án A/B/C',           icon: GitCompare },
      { id: 'simulation.proposal',         label: 'Tờ trình HĐQT',            icon: ScrollText },
    ],
    roles: ['SUPER_ADMIN', 'LANH_DAO'],
  },
  {
    id: 'staff',
    label: 'Nhân Sự',
    icon: Users,
    color: 'text-emerald-700',
    activeColor: 'bg-emerald-700 text-white',
    subItems: [
      { id: 'staff.list',      label: 'Danh sách CBNV',        icon: Users },
      { id: 'staff.positions', label: 'Chức danh & bậc lương', icon: TableProperties },
      { id: 'staff.history',   label: 'Lịch sử công tác',      icon: History },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN', 'LANH_DAO'],
  },
  {
    id: 'timesheets',
    label: 'Chấm Công',
    icon: CalendarCheck,
    color: 'text-blue-700',
    activeColor: 'bg-blue-700 text-white',
    subItems: [
      { id: 'timesheets.entry',  label: 'Chấm công tháng',   icon: CalendarCheck },
      { id: 'timesheets.report', label: 'Báo cáo ngày công', icon: BarChart2 },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN'],
  },
  {
    id: 'kpi',
    label: 'KPI',
    icon: Award,
    color: 'text-purple-700',
    activeColor: 'bg-purple-700 text-white',
    subItems: [
      { id: 'kpi.dictionary',  label: 'Danh mục chỉ số KPI', icon: BookOpen },
      { id: 'kpi.evaluation',  label: 'Đánh giá tháng',      icon: ListChecks },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN', 'LANH_DAO'],
  },
  {
    id: 'payroll',
    label: 'Tính Lương',
    icon: Calculator,
    color: 'text-rose-700',
    activeColor: 'bg-rose-700 text-white',
    subItems: [
      { id: 'payroll.calculate',    label: 'Tính lương tháng',       icon: Calculator },
      { id: 'payroll.detail_table', label: 'Bảng lương chi tiết',    icon: TableProperties },
      { id: 'payroll.pay_slip',     label: 'Phiếu lương của tôi',    icon: UserCheck },
      { id: 'payroll.lock',         label: 'Khóa sổ & lịch sử',     icon: ShieldCheck },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN', 'LANH_DAO', 'NHAN_VIEN'],
    roleFilter: {
      'NHAN_VIEN': ['payroll.pay_slip'], // NV chỉ thấy phiếu lương
    },
  },
  {
    id: 'reports',
    label: 'Báo Cáo',
    icon: PieChart,
    color: 'text-teal-700',
    activeColor: 'bg-teal-700 text-white',
    subItems: [
      { id: 'reports.payroll_summary', label: 'Bảng tổng hợp lương', icon: FileSpreadsheet },
      { id: 'reports.charts',          label: 'Biểu đồ phân tích',   icon: PieChart },
      { id: 'reports.bhxh',            label: 'Báo cáo BHXH',        icon: FileText },
      { id: 'reports.tncn',            label: 'Báo cáo TNCN năm',    icon: Receipt },
    ],
    roles: ['SUPER_ADMIN', 'KE_TOAN', 'LANH_DAO'],
  },
];

/**
 * Sidebar V3.0 — Accordion 2 cấp
 * Props:
 *   activeSection: string (e.g. 'payroll')
 *   activeSubItem: string (e.g. 'payroll.calculate')
 *   onNavigate: (section, subItem) => void
 *   user: { role: string }
 */
export function Sidebar({ activeSection, activeSubItem, onNavigate, user }) {
  const userRole = user?.role || 'NHAN_VIEN';

  // Sections đang mở (accordion)
  const [expandedSections, setExpandedSections] = useState(() => {
    const init = {};
    NAV_SECTIONS.forEach(s => { init[s.id] = s.id === activeSection; });
    return init;
  });

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const handleSubItemClick = useCallback((section, subItem) => {
    onNavigate(section.id, subItem.id);
    // Tự động mở section khi chọn sub-item
    setExpandedSections(prev => ({ ...prev, [section.id]: true }));
  }, [onNavigate]);

  // Lọc sections & sub-items theo role
  const visibleSections = NAV_SECTIONS.filter(s => s.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          QTDND Yên Thọ — V3
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {visibleSections.map(section => {
          const SectionIcon = section.icon;
          const isSectionActive = activeSection === section.id;
          const isExpanded = expandedSections[section.id];

          // Lọc sub-items theo role
          const roleFilter = section.roleFilter?.[userRole];
          const visibleSubItems = roleFilter
            ? section.subItems.filter(si => roleFilter.includes(si.id))
            : section.subItems;

          return (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 mx-1 rounded-lg text-sm font-semibold transition-all group ${
                  isSectionActive
                    ? 'bg-slate-100 text-brand-navy'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <SectionIcon className={`w-4.5 h-4.5 shrink-0 ${isSectionActive ? 'text-brand-navy' : section.color} group-hover:${section.color}`} />
                  <span className="truncate">{section.label}</span>
                </div>
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                }
              </button>

              {/* Sub-items */}
              {isExpanded && (
                <div className="mt-0.5 mb-1 space-y-0.5 pl-4 pr-1">
                  {visibleSubItems.map(subItem => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeSubItem === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(section, subItem)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSubActive
                            ? `${section.activeColor} shadow-sm`
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'opacity-90' : 'text-slate-400'}`} />
                        <span className="truncate text-left">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="text-[9px] text-slate-400 leading-relaxed">
          <div className="font-semibold text-slate-500">Quỹ Tín Dụng Nhân Dân Yên Thọ</div>
          <div>Thôn Tân Lộc, xã Quý Lộc, Thanh Hoá</div>
        </div>
      </div>
    </aside>
  );
}

export { NAV_SECTIONS };
