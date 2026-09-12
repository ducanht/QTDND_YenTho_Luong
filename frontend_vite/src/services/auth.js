const USER_STORAGE_KEY = 'qtd_yentho_auth_user';

export const auth = {
  getUser() {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  hasRole(role) {
    const user = this.getUser();
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.role === role;
  }
};
