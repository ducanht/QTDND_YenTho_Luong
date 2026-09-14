import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Lock, User, Key, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Modules — Section Dashboard
import { DashboardModule } from './modules/dashboard/DashboardModule';

// Modules — Section Simulation (Mô Phỏng HĐQT)
import { SimulationModule } from './modules/simulation/SimulationModule';

// Modules — Section Staff (Nhân Sự)
import { StaffModule } from './modules/staff/StaffModule';
import { PositionsModule } from './modules/positions/PositionsModule';

// Modules — Section Timesheets (Chấm Công)
import { TimesheetsModule } from './modules/timesheets/TimesheetsModule';

// Modules — Section KPI
import { KpiModule } from './modules/kpi/KpiModule';
import { AllowancesModule } from './modules/allowances/AllowancesModule';

// Modules — Section Payroll (Tính Lương)
import { PayrollModule } from './modules/payroll/PayrollModule';
import { SelfServiceModule } from './modules/selfservice/SelfServiceModule';

// Modules — Section Reports (Báo Cáo)
import { AdminModule } from './modules/admin/AdminModule';

import { api } from './services/api';
import { auth } from './services/auth';
import { getCurrentPeriod } from './utils/date';
import { APP_CONFIG } from './constants/config';

/**
 * Xác định section và sub-item mặc định theo role người dùng
 */
function getDefaultNav(role) {
  if (role === 'NHAN_VIEN') return { section: 'payroll', subItem: 'payroll.pay_slip' };
  if (role === 'LANH_DAO')  return { section: 'simulation', subItem: 'simulation.scenarios' };
  return { section: 'dashboard', subItem: 'dashboard.overview' };
}

export function App() {
  const [currentUser, setCurrentUser] = useState(auth.getUser());
  const defaultNav = getDefaultNav(currentUser?.role);
  const [activeSection, setActiveSection] = useState(defaultNav.section);
  const [activeSubItem, setActiveSubItem] = useState(defaultNav.subItem);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('YenTho@2027');

  // ── Nạp dữ liệu từ GAS ──
  const loadData = useCallback(async (targetPeriod = period) => {
    setIsRefreshing(true);
    try {
      const res = await api.getAllData(targetPeriod);
      if (res?.data) setData(res.data);
    } catch (err) {
      console.warn('⚠️ Lỗi nạp dữ liệu, dùng cache:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => { loadData(period); }, [period]);

  // ── Navigation ──
  const handleNavigate = useCallback((section, subItem) => {
    setActiveSection(section);
    setActiveSubItem(subItem);
  }, []);

  // ── Period change (chỉ ảnh hưởng các module cần kỳ tháng) ──
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    loadData(newPeriod);
  }, [loadData]);

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.status === 'success' && res.user) {
        auth.setUser(res.user);
        setCurrentUser(res.user);
        const nav = getDefaultNav(res.user.role);
        setActiveSection(nav.section);
        setActiveSubItem(nav.subItem);
      } else {
        setLoginError(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch {
      if (username === 'admin' && password === 'YenTho@2027') {
        const u = { username: 'admin', fullName: 'Trịnh Đức Anh (Super Admin)', role: 'SUPER_ADMIN', email: 'ducanht@gmail.com' };
        auth.setUser(u); setCurrentUser(u);
        setActiveSection('dashboard'); setActiveSubItem('dashboard.overview');
      } else if (username.startsWith('NV')) {
        const u = { username, fullName: `Cán bộ ${username}`, role: 'NHAN_VIEN', email: `${username.toLowerCase()}@qtdyentho.vn` };
        auth.setUser(u); setCurrentUser(u);
        setActiveSection('payroll'); setActiveSubItem('payroll.pay_slip');
      } else {
        setLoginError('Không thể kết nối máy chủ xác thực. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { auth.logout(); setCurrentUser(null); };

  // ── Login Screen ──
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-navy p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-brand-lime" />
            </div>
            <h1 className="font-bold text-lg leading-snug">{APP_CONFIG.TITLE}</h1>
            <p className="text-xs text-slate-300 mt-1">{APP_CONFIG.SUBTITLE}</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{loginError}</span>
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tên Đăng Nhập / Mã Cán Bộ</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Ví dụ: admin hoặc NV01..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-navy focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mật Khẩu</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-navy focus:outline-none" />
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-0.5">
              <div><strong>Tài khoản trải nghiệm:</strong></div>
              <div>• Quản trị / HĐQT: <span className="font-mono text-brand-navy font-bold">admin / YenTho@2027</span></div>
              <div>• Cán bộ nhân viên: <span className="font-mono text-emerald-800 font-bold">NV01 / 123456</span></div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Đang Đăng Nhập...' : 'Đăng Nhập Hệ Thống'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Render nội dung theo activeSection + activeSubItem ──
  const renderContent = () => {
    const si = activeSubItem;

    // Dashboard
    if (si === 'dashboard.overview' || si === 'dashboard.trends') {
      return <DashboardModule data={data} period={period} activeSubTab={si === 'dashboard.trends' ? 'trends' : 'overview'} onNavigate={handleNavigate} />;
    }

    // Simulation
    if (activeSection === 'simulation') {
      const subTabMap = {
        'simulation.salary_structure': 'salary_structure',
        'simulation.allowances': 'allowances',
        'simulation.insurance_tax': 'insurance_tax',
        'simulation.scenarios': 'scenarios',
        'simulation.proposal': 'proposal',
      };
      return (
        <SimulationModule
          data={data}
          activeSubTab={subTabMap[si] || 'scenarios'}
          onSaveScenario={sc => api.saveScenario(sc).then(() => loadData(period))}
          onSaveSalaryParams={p => api.saveSalaryParams(p)}
          onSaveSalaryScale={s => api.saveSalaryScale(s)}
          onSaveAllowances={al => api.saveAllowances(al).then(() => loadData(period))}
          onRefresh={() => loadData(period)}
        />
      );
    }

    // Staff
    if (si === 'staff.list') {
      return <StaffModule data={data} activeSubTab="list" onSaveStaff={s => api.saveStaff(s).then(() => loadData(period))} onSaveBhxh={list => api.saveBatchBhxh(list)} />;
    }
    if (si === 'staff.positions') {
      return <PositionsModule data={data} onSavePositions={pos => api.savePositions(pos).then(() => loadData(period))} />;
    }
    if (si === 'staff.history') {
      return <StaffModule data={data} activeSubTab="history" onSaveStaff={s => api.saveStaff(s).then(() => loadData(period))} />;
    }

    // Timesheets
    if (activeSection === 'timesheets') {
      return (
        <TimesheetsModule
          data={data} period={period}
          activeSubTab={si === 'timesheets.report' ? 'report' : 'entry'}
          onSaveTimesheets={(p, list) => api.saveTimesheets(p, list).then(() => loadData(p))}
        />
      );
    }

    // KPI
    if (activeSection === 'kpi') {
      return <KpiModule data={data} period={period} activeSubTab={si === 'kpi.evaluation' ? 'evaluation' : 'dictionary'} />;
    }

    // Allowances (reachable from Simulation)
    if (si === 'simulation.allowances') {
      return <AllowancesModule data={data} onSaveAllowances={al => api.saveAllowances(al).then(() => loadData(period))} onSaveHistory={lh => api.saveAllowanceHistory(lh).then(() => loadData(period))} />;
    }

    // Payroll
    if (si === 'payroll.pay_slip' || si === 'payroll.selfservice') {
      return <SelfServiceModule data={data} period={period} user={currentUser} onSubmitFeedback={fb => api.submitFeedback(fb).then(() => loadData(period))} />;
    }
    if (activeSection === 'payroll') {
      const subTabMap = {
        'payroll.calculate': 'calculate',
        'payroll.detail_table': 'detail_table',
        'payroll.lock': 'lock',
      };
      return (
        <PayrollModule
          data={data} period={period}
          activeSubTab={subTabMap[si] || 'calculate'}
          onCalculatePayroll={(p, scenario) => api.calculatePayroll(p, scenario)}
          onSavePayroll={(p, rows) => api.saveMonthlyPayroll(p, rows)}
          onLockPayroll={(p, rows) => api.lockPayroll(p, rows).then(() => loadData(p))}
        />
      );
    }

    // Reports
    if (activeSection === 'reports') {
      return <AdminModule data={data} period={period} activeSubTab={si.replace('reports.', '')} onSetupDatabase={() => api.setupDatabase().then(() => loadData(period))} />;
    }

    // Fallback
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Đang tải module...
      </div>
    );
  };

  // ── Main App ──
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={() => loadData(period)}
        isRefreshing={isRefreshing}
        onSetupDb={() => api.setupDatabase().then(() => alert('✅ Đã kiểm tra CSDL 17 Sheets V3!'))}
        activeSection={activeSection}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar
          activeSection={activeSection}
          activeSubItem={activeSubItem}
          onNavigate={handleNavigate}
          user={currentUser}
        />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          {isLoading && !data ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
                <p className="text-sm text-slate-500">Đang nạp dữ liệu từ Google Sheets...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
