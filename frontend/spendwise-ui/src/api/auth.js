import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateProfilePicture: (pictureUrl) => api.put('/auth/profile/picture', { pictureUrl }),
  toggleDarkMode: () => api.post('/auth/toggle-dark-mode'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  exportCsv: () => api.get('/transactions/export/csv', { responseType: 'blob' }),
  exportPdf: () => api.get('/transactions/export/pdf', { responseType: 'blob' }),
};

export const budgetApi = {
  getAll: (params) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const goalApi = {
  getAll: () => api.get('/goals'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  addProgress: (id, amount) => api.post(`/goals/${id}/progress`, { amount }),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const reportApi = {
  daily: (params) => api.get('/reports/daily', { params }),
  weekly: (params) => api.get('/reports/weekly', { params }),
  monthly: (params) => api.get('/reports/monthly', { params }),
  yearly: (params) => api.get('/reports/yearly', { params }),
  download: (params) => api.get('/reports/download', { params, responseType: 'blob' }),
};

export const searchApi = {
  global: (q) => api.get('/search', { params: { q } }),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStatistics: () => api.get('/admin/statistics'),
};
