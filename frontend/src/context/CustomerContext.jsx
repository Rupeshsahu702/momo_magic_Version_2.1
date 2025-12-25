/**
 * CustomerContext - Manages customer authentication state for the website.
 * Persists customer data to localStorage and provides login/logout functions.
 */

import { createContext, useState, useEffect, useContext } from 'react';
import customerService from '../services/customerService';

const CustomerContext = createContext();

// Local storage key for customer data
const CUSTOMER_STORAGE_KEY = 'momo_customer';

export const CustomerProvider = ({ children }) => {
    // Use lazy initialization to load customer from localStorage on mount
    const [customer, setCustomer] = useState(() => {
        const storedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
        if (storedCustomer) {
            try {
                return JSON.parse(storedCustomer);
            } catch (parseError) {
                console.error('Error parsing stored customer:', parseError);
                localStorage.removeItem(CUSTOMER_STORAGE_KEY);
                return null;
            }
        }
        return null;
    });

    // Since we use lazy initialization, data is never "loading" - customer is available immediately
    const isLoading = false;
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Show login modal if no customer after initial load
    useEffect(() => {
        if (!isLoading && !customer) {
            // Small delay to let the page render first
            const timer = setTimeout(() => {
                setShowLoginModal(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, customer]);

    /**
     * Login or register customer
     * @param {Object} customerData - { name, email, phone }
     */
    const login = async (customerData) => {
        try {
            const response = await customerService.loginOrRegister(customerData);
            const customerInfo = response.customer;

            // Save to state and localStorage
            setCustomer(customerInfo);
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo));
            setShowLoginModal(false);

            return { success: true, isNewCustomer: response.isNewCustomer, message: response.message };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message: errorMessage };
        }
    };

    /**
     * Logout customer - clear state and localStorage
     */
    const logout = () => {
        setCustomer(null);
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    };

    /**
     * Update customer profile
     * @param {Object} updateData - Fields to update
     */
    const updateProfile = async (updateData) => {
        if (!customer?.id) return { success: false, message: 'Not logged in' };

        try {
            const response = await customerService.updateCustomer(customer.id, updateData);
            const updatedCustomer = response.customer;

            setCustomer(updatedCustomer);
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(updatedCustomer));

            return { success: true, message: 'Profile updated!' };
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, message: 'Failed to update profile' };
        }
    };

    /**
     * Open login modal manually
     */
    const openLoginModal = () => {
        setShowLoginModal(true);
    };

    /**
     * Close login modal
     */
    const closeLoginModal = () => {
        setShowLoginModal(false);
    };

    return (
        <CustomerContext.Provider value={{
            customer,
            isLoading,
            isLoggedIn: !!customer,
            showLoginModal,
            login,
            logout,
            updateProfile,
            openLoginModal,
            closeLoginModal
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

// Custom hook for using customer context
export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return context;
};

export default CustomerContext;
