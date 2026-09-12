import { APP_CONFIG } from '../constants/config';

class ApiService {
  constructor() {
    this.primaryUrl = APP_CONFIG.DIRECT_GAS_URL;
    this.fallbackUrl = APP_CONFIG.DIRECT_GAS_URL;
  }

  async request(action, params = {}, method = 'GET') {
    let url = this.primaryUrl;

    if (method === 'GET') {
      const query = new URLSearchParams({ action, ...params }).toString();
      url = `${url}?${query}`;
      try {
        const res = await fetch(url);
        return await res.json();
      } catch (err) {
        console.warn('⚠️ Lỗi kết nối Primary API, thử lại Direct GAS Endpoint...', err);
        const fallbackQuery = new URLSearchParams({ action, ...params }).toString();
        const fallbackRes = await fetch(`${this.fallbackUrl}?${fallbackQuery}`);
        return await fallbackRes.json();
      }
    } else {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Tránh preflight OPTIONS với GAS
          body: JSON.stringify({ action, ...params })
        });
        return await res.json();
      } catch (err) {
        console.warn('⚠️ Lỗi POST Primary API, chuyển sang Fallback Direct GAS...', err);
        const fallbackRes = await fetch(this.fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, ...params })
        });
        return await fallbackRes.json();
      }
    }
  }

  async getAllData(period = '') {
    return this.request('getData', { period }, 'GET');
  }

  async login(username, password) {
    return this.request('login', { username, password }, 'POST');
  }

  async saveStaff(staffData) {
    return this.request('saveStaff', { payload: staffData }, 'POST');
  }

  async saveTimesheets(period, timesheetList) {
    return this.request('saveTimesheets', { period, payload: timesheetList }, 'POST');
  }

  async lockPayroll(period, payrollRows) {
    return this.request('lockPayroll', { period, payload: payrollRows }, 'POST');
  }

  async submitFeedback(feedbackData) {
    return this.request('submitFeedback', { payload: feedbackData }, 'POST');
  }

  async setupDatabase() {
    return this.request('setupDatabase', {}, 'GET');
  }
}

export const api = new ApiService();
