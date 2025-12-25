import { createContext, useState } from 'react';
import adminService from '../services/adminService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Use lazy initialization to load admin from localStorage on mount
    // This avoids calling setState in useEffect
    const [admin, setAdmin] = useState(() => {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            try {
                return JSON.parse(storedAdmin);
            } catch {
                localStorage.removeItem('admin');
                return null;
            }
        }
        return null;
    });

    // Since we use lazy initialization, auth is never "loading" - admin is available immediately
    const isLoading = false;

    const login = async (adminData) => {
        const data = await adminService.loginAdmin(adminData);
        setAdmin(data);
    };

    const logout = () => {
        adminService.logoutAdmin();
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
