/**
 * CustomerAuthContext - Manages customer authentication state and OTP verification flow.
 * Handles phone-based OTP authentication and persists verified customer session.
 */

import { createContext, useState, useCallback } from 'react';
import customerService from '../services/customerService';

const CustomerAuthContext = createContext();

// Local storage key for authenticated customer data
const AUTH_CUSTOMER_STORAGE_KEY = 'momo_auth_customer';

export const CustomerAuthProvider = ({ children }) => {
    // Load authenticated customer from localStorage on init
    const [customer, setCustomer] = useState(() => {
        const stored = localStorage.getItem(AUTH_CUSTOMER_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                localStorage.removeItem(AUTH_CUSTOMER_STORAGE_KEY);
                return null;
            }
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // OTP flow state
    const [otpFlow, setOtpFlow] = useState({
        phoneNumber: '',
        sessionId: null,
        otpSent: false,
        otpVerified: false
    });

    /**
     * Step 1: Send OTP to phone number
     */
    const sendOTP = useCallback(async (phoneNumber) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await customerService.sendOTP(phoneNumber);

            if (response.success) {
                setOtpFlow(prev => ({
                    ...prev,
                    phoneNumber,
                    sessionId: response.sessionId,
                    otpSent: true,
                    otpVerified: false
                }));

                return {
                    success: true,
                    message: response.message,
                    expiresIn: response.expiresIn
                };
            }

            throw new Error(response.message || 'Failed to send OTP');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP';
            setError(errorMsg);
            return {
                success: false,
                message: errorMsg
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Step 2: Verify OTP and authenticate customer
     */
    const verifyOTP = useCallback(async (otp, name, email = '') => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await customerService.verifyOTP({
                phoneNumber: otpFlow.phoneNumber,
                sessionId: otpFlow.sessionId,
                otp,
                name,
                email
            });

            if (response.success) {
                const authenticatedCustomer = {
                    ...response.customer,
                    isAuthenticated: true,
                    verifiedAt: new Date().toISOString()
                };

                setCustomer(authenticatedCustomer);
                localStorage.setItem(AUTH_CUSTOMER_STORAGE_KEY, JSON.stringify(authenticatedCustomer));

                setOtpFlow(prev => ({
                    ...prev,
                    otpVerified: true
                }));

                return {
                    success: true,
                    message: response.message,
                    isNewCustomer: response.isNewCustomer
                };
            }

            throw new Error(response.message || 'OTP verification failed');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'OTP verification failed';
            setError(errorMsg);
            return {
                success: false,
                message: errorMsg
            };
        } finally {
            setIsLoading(false);
        }
    }, [otpFlow.phoneNumber, otpFlow.sessionId]);

    /**
     * Logout - Clear customer session
     */
    const logout = useCallback(() => {
        setCustomer(null);
        setOtpFlow({
            phoneNumber: '',
            sessionId: null,
            otpSent: false,
            otpVerified: false
        });
        setError(null);
        localStorage.removeItem(AUTH_CUSTOMER_STORAGE_KEY);
    }, []);

    /**
     * Reset OTP flow (for modal close or resend)
     */
    const resetOTPFlow = useCallback(() => {
        setOtpFlow({
            phoneNumber: '',
            sessionId: null,
            otpSent: false,
            otpVerified: false
        });
        setError(null);
    }, []);

    /**
     * Check if customer is authenticated
     */
    const isAuthenticated = !!customer?.isAuthenticated;

    /**
     * Update customer profile (name, email, address)
     */
    const updateProfile = useCallback(async (updates) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await customerService.updateCustomer(customer.id, updates);

            if (response.success) {
                const updatedCustomer = {
                    ...customer,
                    ...response.customer
                };

                setCustomer(updatedCustomer);
                localStorage.setItem(AUTH_CUSTOMER_STORAGE_KEY, JSON.stringify(updatedCustomer));

                return {
                    success: true,
                    message: response.message
                };
            }

            throw new Error(response.message || 'Failed to update profile');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMsg);
            return {
                success: false,
                message: errorMsg
            };
        } finally {
            setIsLoading(false);
        }
    }, [customer]);

    const value = {
        // Customer data
        customer,
        isAuthenticated,
        isLoading,
        error,

        // OTP flow state
        otpFlow,

        // Methods
        sendOTP,
        verifyOTP,
        logout,
        resetOTPFlow,
        updateProfile
    };

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export default CustomerAuthContext;
