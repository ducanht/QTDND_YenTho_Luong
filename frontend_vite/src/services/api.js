/**
 * =========================================================================
 * SMART API CLIENT - DUAL-PLATFORM ARCHITECTURE (Kế Thừa Dự Án Qtdyentho)
 * - Môi trường 1 (Google Workspace Nội bộ): Gọi Native google.script.run
 * - Môi trường 2 (Vercel Cloud SPA / Local): Gọi HTTP POST sang GAS Exec URL
 * - Hỗ trợ Zero-Latency Bootstrapping qua __INITIAL_DATA__
 * =========================================================================
 */

import { APP_CONFIG } from '../constants/config';

class ApiService {
  constructor() {
    this.primaryUrl = APP_CONFIG.DIRECT_GAS_URL;
    this.cachedInitialData = null;
    this.initBootstrappedData();
  }

  /**
   * Đọc trước dữ liệu được nạp sẵn từ thẻ script __INITIAL_DATA__ nếu có
   */
  initBootstrappedData() {
    if (typeof window !== 'undefined') {
      try {
        const el = document.getElementById('__INITIAL_DATA__');
        if (el && el.textContent && el.textContent.trim() !== '' && el.textContent.trim() !== 'null') {
          const parsed = JSON.parse(el.textContent);
          if (parsed && typeof parsed === 'object') {
            this.cachedInitialData = parsed;
            console.log('⚡ [Dual-Platform] Khởi động tức thì 0ms với dữ liệu nạp sẵn từ GAS:', parsed);
          }
        }
      } catch (err) {
        // Bỏ qua lỗi cú pháp nếu chạy trên Vite dev server
      }
    }
  }

  getInitialBootstrappedData() {
    return this.cachedInitialData;
  }

  /**
   * Universal Request Router:
   * Nhận diện môi trường thực thi và gửi request qua kênh tương ứng
   */
  async request(action, payload = {}) {
    const isGasEnvironment = typeof window !== 'undefined' && 
                             window.google && 
                             window.google.script && 
                             window.google.script.run;

    // 1. Nếu đang chạy trong Google Apps Script (Iframe Web App nội bộ)
    if (isGasEnvironment) {
      return new Promise((resolve, reject) => {
        window.google.script.run
          .withSuccessHandler((res) => resolve(res))
          .withFailureHandler((err) => {
            console.error(`❌ GAS Native Action '${action}' thất bại:`, err);
            reject(err);
          })
          .executeGasAction(action, payload);
      });
    }

    // 2. Nếu đang chạy trên Vercel Cloud SPA hoặc Localhost (HTTP Fetch)
    try {
      const response = await fetch(this.primaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Tránh CORS Preflight OPTIONS
        },
        body: JSON.stringify({ action, payload }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const res = await response.json();
      return res;
    } catch (err) {
      console.warn(`⚠️ Lỗi HTTP POST cho action '${action}', thử lại với query params...`, err.message);
      
      // Fallback cho các hành động đọc dữ liệu an toàn
      try {
        const query = new URLSearchParams({ 
          action, 
          payload: JSON.stringify(payload) 
        }).toString();
        
        const fallbackRes = await fetch(`${this.primaryUrl}?${query}`, {
          method: 'GET',
          redirect: 'follow'
        });
        return await fallbackRes.json();
      } catch (fallbackErr) {
        console.error(`❌ Cả 2 kênh HTTP đều thất bại cho action '${action}':`, fallbackErr);
        throw fallbackErr;
      }
    }
  }

  // ===================== CÁC HÀM NGHIỆP VỤ CỤ THỂ =====================

  async getAllData(period = '') {
    // Nếu vừa mở trang và có dữ liệu nạp sẵn từ GAS, sử dụng ngay lần đầu
    if (this.cachedInitialData && !period) {
      const data = this.cachedInitialData;
      this.cachedInitialData = null; // Chỉ tiêu thụ 1 lần, các lần sau fetch mới
      return { status: 'success', data: data };
    }
    return this.request('getAllData', { period });
  }

  async login(username, password) {
    return this.request('login', { username, password });
  }

  async saveStaff(staffData) {
    return this.request('saveStaff', { payload: staffData });
  }

  async savePositions(positionsList) {
    return this.request('savePositions', { payload: positionsList });
  }

  async saveTimesheets(period, timesheetList) {
    return this.request('saveTimesheets', { period, payload: timesheetList });
  }

  async saveAllowances(allowancesList) {
    return this.request('saveAllowances', { payload: allowancesList });
  }

  async saveAllowanceHistory(historyRecord) {
    return this.request('saveAllowanceHistory', { payload: historyRecord });
  }

  async lockPayroll(period, payrollRows) {
    return this.request('lockPayroll', { period, payload: payrollRows });
  }

  async submitFeedback(feedbackData) {
    return this.request('submitFeedback', { payload: feedbackData });
  }

  async getScenarios() {
    return this.request('getScenarios', {});
  }

  async saveScenario(scenarioData) {
    return this.request('saveScenario', { payload: scenarioData });
  }

  async setupDatabase() {
    return this.request('setupDatabase', {});
  }
}

export const api = new ApiService();
