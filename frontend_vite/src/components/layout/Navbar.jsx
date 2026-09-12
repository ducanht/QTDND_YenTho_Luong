import React from 'react';
import { Building2, User, LogOut, RefreshCw, Database, Sliders, CreditCard } from 'lucide-react';
import { APP_CONFIG, ROLE_LABELS } from '../../constants/config';
import { getRecentPeriods } from '../../utils/date';

export function Navbar({ 
  user, 
  onLogout, 
  period, 
  onPeriodChange, 
  onRefresh, 
  isRefreshing, 
  onSetupDb,
  workspaceMode,
  onWorkspaceModeChange
}) {
  const periods = getRecentPeriods(12);

  return (
    <header className="bg-brand-navy text-white shadow-md sticky top-0 z-30 border-b border-brand-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-6 h-6 text-brand-lime" />
            </div>
            <div>
              <div className="font-bold text-base tracking-wide flex items-center space-x-2">
                <span>{APP_CONFIG.TITLE}</span>
                <span className="text-xs bg-brand-lime/20 text-brand-lime px-2 py-0.5 rounded font-medium border border-brand-lime/30">2027 Pro</span>
              </div>
              <p className="text-xs text-slate-300 font-normal hidden sm:block">
                {APP_CONFIG.SUBTITLE}
              </p>
            </div>
          </div>

          {/* Mode Switcher: 2 Phân Hệ Lớn */}
          {user?.role !== 'NHAN_VIEN' && (
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/15 shadow-inner">
              <button
                onClick={() => onWorkspaceModeChange('SIMULATION')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  workspaceMode === 'SIMULATION'
                    ? 'bg-amber-400 text-brand-navy shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>🏛️ Mô Phỏng Quy Chế (HĐQT)</span>
              </button>
              <button
                onClick={() => onWorkspaceModeChange('PAYROLL')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  workspaceMode === 'PAYROLL'
                    ? 'bg-brand-lime text-brand-navy shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>📋 Lương Chính Thức Tháng</span>
              </button>
            </div>
          )}

          {/* Controls & Actions */}
          <div className="flex items-center space-x-3">
            {/* Period Selector (Chỉ cần khi ở Phân hệ Lương Chính Thức) */}
            {workspaceMode === 'PAYROLL' && (
              <div className="flex items-center bg-white/10 rounded-lg px-2.5 py-1 border border-white/20">
                <span className="text-xs text-slate-300 mr-2 hidden md:inline">Kỳ:</span>
                <select
                  value={period}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="bg-transparent text-sm text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {periods.map(p => (
                    <option key={p.value} value={p.value} className="bg-slate-800 text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Làm mới dữ liệu từ Google Sheets"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-slate-200 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-lime' : ''}`} />
            </button>

            {/* DB Setup Button (Admin only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={onSetupDb}
                title="Khởi tạo / Kiểm tra cấu trúc 13 Sheets CSDL"
                className="p-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors text-xs font-medium flex items-center space-x-1"
              >
                <Database className="w-4 h-4" />
                <span className="hidden lg:inline">CSDL 13 Sheets</span>
              </button>
            )}

            {/* User Profile */}
            <div className="flex items-center pl-2 border-l border-white/20 space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime font-bold text-xs">
                {user?.fullName ? user.fullName.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-tight">{user?.fullName || 'Cán bộ'}</div>
                <div className="text-[10px] text-slate-300 leading-tight">{ROLE_LABELS[user?.role] || 'Thành viên'}</div>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
