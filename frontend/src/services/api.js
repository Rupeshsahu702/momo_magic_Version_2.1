import axios from 'axios';

// Read API URL from environment variable, with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (admin?.token) {
            config.headers.Authorization = `Bearer ${admin.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
