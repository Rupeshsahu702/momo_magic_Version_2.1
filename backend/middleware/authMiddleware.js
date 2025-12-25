/**
 * Authentication Middleware
 * Protects routes that require customer authentication
 */

const Customer = require('../models/customerModel');

/**
 * Middleware to verify customer authentication via customerId in request body or headers
 * For checkout and order placement endpoints
 */
const verifyCustomerAuth = async (req, res, next) => {
    try {
        // Get customerId from body, headers, or query
        const customerId = req.body.customerId || req.headers['x-customer-id'] || req.query.customerId;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in to continue.'
            });
        }

        // Verify customer exists and is verified
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!customer.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Customer verification required'
            });
        }

        // Attach customer to request for use in controllers
        req.customer = customer;
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication verification failed'
        });
    }
};

/**
 * Middleware to verify customer via phone number (for API calls)
 */
const verifyCustomerByPhone = async (req, res, next) => {
    try {
        const phoneNumber = req.body.phone || req.headers['x-phone'];

        if (!phoneNumber) {
            return res.status(401).json({
                success: false,
                message: 'Phone number required for authentication'
            });
        }

        const cleanedNumber = phoneNumber.replace(/\D/g, '');

        const customer = await Customer.findOne({ phone: cleanedNumber });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!customer.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Customer not verified'
            });
        }

        req.customer = customer;
        next();
    } catch (error) {
        console.error('Phone verification middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication verification failed'
        });
    }
};

/**
 * Optional auth middleware - doesn't fail if not authenticated
 * Sets req.customer if found
 */
const optionalCustomerAuth = async (req, res, next) => {
    try {
        const customerId = req.body.customerId || req.headers['x-customer-id'] || req.query.customerId;

        if (customerId) {
            const customer = await Customer.findById(customerId);
            if (customer && customer.isVerified) {
                req.customer = customer;
            }
        }

        next();
    } catch (error) {
        // Non-critical error, just continue without auth
        next();
    }
};

module.exports = {
    verifyCustomerAuth,
    verifyCustomerByPhone,
    optionalCustomerAuth
};
