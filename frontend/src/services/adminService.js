import api from './api';

const registerAdmin = async (adminData) => {
    const response = await api.post('/admin/register', adminData);
    if (response.data) {
        localStorage.setItem('admin', JSON.stringify(response.data));
    }
    return response.data;
};

const loginAdmin = async (adminData) => {
    const response = await api.post('/admin/login', adminData);
    if (response.data) {
        localStorage.setItem('admin', JSON.stringify(response.data));
    }
    return response.data;
};

const logoutAdmin = () => {
    localStorage.removeItem('admin');
};

const requestPasswordReset = async (phoneNumber) => {
    const response = await api.post('/admin/forgot-password', { phoneNumber });
    return response.data;
};

const verifyOTPAndResetPassword = async (data) => {
    const response = await api.post('/admin/reset-password', data);
    return response.data;
};

const getOTPLogs = async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/otp-logs?page=${page}&limit=${limit}`);
    return response.data;
};

const adminService = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    requestPasswordReset,
    verifyOTPAndResetPassword,
    getOTPLogs,
};

export default adminService;
