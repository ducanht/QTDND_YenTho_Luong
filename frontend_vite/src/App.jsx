import React, { useState, useEffect } from 'react';
import { Building2, Lock, User, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardModule } from './modules/dashboard/DashboardModule';
import { PayrollModule } from './modules/payroll/PayrollModule';
import { TimesheetsModule } from './modules/timesheets/TimesheetsModule';
import { StaffModule } from './modules/staff/StaffModule';
import { PositionsModule } from './modules/positions/PositionsModule';
import { KpiModule } from './modules/kpi/KpiModule';
import { AllowancesModule } from './modules/allowances/AllowancesModule';
import { SelfServiceModule } from './modules/selfservice/SelfServiceModule';
import { AdminModule } from './modules/admin/AdminModule';
import { SimulationModule } from './modules/simulation/SimulationModule';
import { api } from './services/api';
import { auth } from './services/auth';
import { getCurrentPeriod } from './utils/date';
import { APP_CONFIG } from './constants/config';

export function App() {
  const [currentUser, setCurrentUser] = useState(auth.getUser());
  
  // 2 Không Gian Lớn: 'SIMULATION' (Mô Phỏng HĐQT) hoặc 'PAYROLL' (Lương Chính Thức Tháng)
  const [workspaceMode, setWorkspaceMode] = useState(
    currentUser?.role === 'NHAN_VIEN' ? 'PAYROLL' : 'SIMULATION'
  );

  const [activeTab, setActiveTab] = useState(
    currentUser?.role === 'NHAN_VIEN' ? 'selfservice' : 'simulation'
  );

  const [period, setPeriod] = useState(getCurrentPeriod());
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Form đăng nhập
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('YenTho@2027');

  const loadData = async (targetPeriod = period) => {
    setIsRefreshing(true);
    try {
      const res = await api.getAllData(targetPeriod);
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('⚠️ Lỗi nạp dữ liệu trực tiếp, sử dụng dữ liệu bộ đệm:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handleModeChange = (newMode) => {
    setWorkspaceMode(newMode);
    if (newMode === 'SIMULATION') {
      setActiveTab('simulation');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.status === 'success' && res.user) {
        auth.setUser(res.user);
        setCurrentUser(res.user);
        if (res.user.role === 'NHAN_VIEN') {
          setWorkspaceMode('PAYROLL');
          setActiveTab('selfservice');
        } else {
          setWorkspaceMode('SIMULATION');
          setActiveTab('simulation');
        }
      } else {
        setLoginError(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      // Offline fallback cho tài khoản Admin
      if (username === 'admin' && password === 'YenTho@2027') {
        const adminUser = {
          username: 'admin',
          fullName: 'Trịnh Đức Anh (Super Admin)',
          role: 'SUPER_ADMIN',
          email: 'ducanht@gmail.com'
        };
        auth.setUser(adminUser);
        setCurrentUser(adminUser);
        setWorkspaceMode('SIMULATION');
        setActiveTab('simulation');
      } else if (username.startsWith('NV')) {
        const staffUser = {
          username: username,
          fullName: `Cán bộ ${username}`,
          role: 'NHAN_VIEN',
          email: `${username.toLowerCase()}@qtdyentho.vn`
        };
        auth.setUser(staffUser);
        setCurrentUser(staffUser);
        setWorkspaceMode('PAYROLL');
        setActiveTab('selfservice');
      } else {
        setLoginError('Không thể kết nối máy chủ xác thực. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
  };

  // Màn hình Đăng Nhập
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-brand-navy p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-brand-lime" />
            </div>
            <h1 className="font-bold text-lg leading-snug">{APP_CONFIG.TITLE}</h1>
            <p className="text-xs text-slate-300 mt-1">{APP_CONFIG.SUBTITLE}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tên Đăng Nhập / Mã Cán Bộ</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: admin hoặc NV01..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mật Khẩu</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-0.5">
              <div><strong>Gợi ý tài khoản trải nghiệm:</strong></div>
              <div>• Quản trị toàn Quỹ / HĐQT: <span className="font-mono text-brand-navy font-bold">admin / YenTho@2027</span></div>
              <div>• Cán bộ nhân viên: <span className="font-mono text-emerald-800 font-bold">NV01 / 123456</span></div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Đang Đăng Nhập...' : 'Đăng Nhập Hệ Thống'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Màn hình Ứng Dụng Chính
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(period)}
        isRefreshing={isRefreshing}
        onSetupDb={() => api.setupDatabase().then(() => alert('✅ Đã kiểm tra CSDL 13 Sheets!'))}
        workspaceMode={workspaceMode}
        onWorkspaceModeChange={handleModeChange}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={currentUser}
          workspaceMode={workspaceMode}
        />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {/* PHÂN HỆ 1: MÔ PHỎNG QUY CHẾ LƯƠNG HĐQT */}
          {activeTab === 'simulation' && (
            <SimulationModule
              data={data}
              onSaveScenario={(scenario) => api.saveScenario(scenario).then(() => loadData(period))}
            />
          )}

          {/* PHÂN HỆ 2: THEO DÕI & CHI TRẢ LƯƠNG CHÍNH THỨC HÀNG THÁNG */}
          {activeTab === 'dashboard' && (
            <DashboardModule
              data={data}
              period={period}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollModule
              data={data}
              period={period}
              onLockPayroll={(p, rows) => api.lockPayroll(p, rows).then(() => loadData(period))}
            />
          )}

          {activeTab === 'timesheets' && (
            <TimesheetsModule
              data={data}
              period={period}
              onSaveTimesheets={(p, list) => api.saveTimesheets(p, list).then(() => loadData(period))}
            />
          )}

          {activeTab === 'selfservice' && (
            <SelfServiceModule
              data={data}
              period={period}
              user={currentUser}
              onSubmitFeedback={(fb) => api.submitFeedback(fb).then(() => loadData(period))}
            />
          )}

          {/* CÁC MODULE DÙNG CHUNG CSDL GIỮA 2 PHÂN HỆ */}
          {activeTab === 'staff' && (
            <StaffModule
              data={data}
              onSaveStaff={(staff) => api.saveStaff(staff).then(() => loadData(period))}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsModule 
              data={data} 
              onSavePositions={(pos) => api.savePositions(pos).then(() => loadData(period))}
            />
          )}

          {activeTab === 'kpi' && (
            <KpiModule data={data} period={period} />
          )}

          {activeTab === 'allowances' && (
            <AllowancesModule 
              data={data}
              onSaveAllowances={(al) => api.saveAllowances(al).then(() => loadData(period))}
              onSaveHistory={(lh) => api.saveAllowanceHistory(lh).then(() => loadData(period))}
            />
          )}

          {activeTab === 'admin' && (
            <AdminModule
              data={data}
              onSetupDatabase={() => api.setupDatabase().then(() => loadData(period))}
            />
          )}
        </main>
      </div>
    </div>
  );
}
