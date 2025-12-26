/**
 * useCustomerAuth Hook - Provides easy access to customer authentication context
 * Returns customer data and authentication methods
 */
import { useContext } from 'react';
import CustomerAuthContext from '@/context/CustomerAuthContext';

export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext);

    if (!context) {
        throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    }

    // Return customer phone for convenience
    return {
        ...context,
        phone: context.customer?.phone || null
    };
};

export default useCustomerAuth;
