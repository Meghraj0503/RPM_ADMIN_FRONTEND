import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006';
const BASE_URL = 'https://adminrpm.pillnurse.com';
// const BASE_URL = 'http://43.204.30.135:3006' || import.meta.env.VITE_API_BASE_URL;
const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 (expired / invalid token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminRole');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
