import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/",
});

// Add a request interceptor to inject the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle global errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location.replace instead of href to prevent back button issues
      // but still cause a refresh to clear app state
      window.location.replace('/login');
    } else if (error.response && error.response.status === 403) {
      // Handling subscription expiration specifically
      alert('Your subscription has expired or is inactive. You are now in Read-Only mode. Please activate a new Security Code.');
      window.location.replace('/activate');
    }
    return Promise.reject(error);
  }
);

export default api;
