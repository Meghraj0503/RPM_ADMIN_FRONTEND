import api from './config';

// Auth (email + password)
export const adminLogin   = (data) => api.post('/api/admin/auth/login', data);
export const getAdminMe   = ()     => api.get('/api/admin/auth/me');

// Dashboard
export const getCohortDashboard  = ()       => api.get('/api/admin/dashboard');
export const getDashboardConfig  = ()       => api.get('/api/admin/dashboard/config');
export const saveDashboardConfig = (layout) => api.put('/api/admin/dashboard/config', layout);

// Users (8.4, 8.5, 8.10)
export const getUsers         = (params)      => api.get('/api/admin/users', { params });
export const getUserDetail    = (id, params)  => api.get(`/api/admin/users/${id}`, { params });
export const createUser       = (data)        => api.post('/api/admin/users', data);
export const updateUser       = (id, data)    => api.put(`/api/admin/users/${id}`, data);
export const changeUserStatus = (id, data)    => api.put(`/api/admin/users/${id}/status`, data);
export const updateUserMedicalProfile = (id, data) => api.put(`/api/admin/users/${id}/medical-profile`, data);
export const updateUserLifestyle      = (id, data) => api.put(`/api/admin/users/${id}/lifestyle`, data);
export const getUserAuditTrail = (id)         => api.get(`/api/admin/users/${id}/audit`);

// At-Risk (8.6)
export const getAtRiskUsers = () => api.get('/api/admin/at-risk');

// Articles CMS (8.3)
export const getAdminArticles  = (params)     => api.get('/api/admin/articles', { params });
export const getArticle        = (id)         => api.get(`/api/admin/articles/${id}`);
export const createArticle     = (data)       => api.post('/api/admin/articles', data);
export const updateArticle     = (id, data)   => api.put(`/api/admin/articles/${id}`, data);
export const deleteArticle     = (id)         => api.delete(`/api/admin/articles/${id}`);
export const publishArticle    = (id)         => api.put(`/api/admin/articles/${id}/publish`);
export const unpublishArticle  = (id)         => api.put(`/api/admin/articles/${id}/unpublish`);
export const uploadFile        = (formData)   => api.post('/api/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data'} });

// Subscriptions (8.8)
export const assignSubscription     = (userId, data) => api.post(`/api/admin/users/${userId}/subscription`, data);
export const changeProgram          = (userId, data) => api.put(`/api/admin/users/${userId}/subscription/change`, data);
export const suspendSubscription    = (userId, data) => api.put(`/api/admin/users/${userId}/subscription/suspend`, data);
export const reactivateSubscription = (userId)       => api.put(`/api/admin/users/${userId}/subscription/reactivate`);
export const getEnrollmentHistory   = (userId)       => api.get(`/api/admin/users/${userId}/enrollment-history`);

// Export (8.7)
export const exportData       = (dataset, payload = {}) =>
  api.post('/api/admin/export', { dataset, ...payload }, { responseType: 'blob' });
export const getExportHistory = () => api.get('/api/admin/export/history');

// Device Management
export const getUserDevices  = (userId)         => api.get(`/api/admin/users/${userId}/devices`);
export const assignDevice    = (userId, data)   => api.post(`/api/admin/users/${userId}/devices`, data);
export const removeDevice    = (userId, devId)  => api.delete(`/api/admin/users/${userId}/devices/${devId}`);
