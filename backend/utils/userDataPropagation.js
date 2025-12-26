/**
 * User Data Propagation Utility
 * 
 * Provides standardized functions for extracting and propagating user details
 * across orders, bills, and sales records throughout the application lifecycle.
 * This ensures consistent user data transfer and availability for downstream operations.
 */

/**
 * Extract comprehensive user details from an order object.
 * Ensures all user information is properly formatted and available.
 * 
 * @param {Object} order - Order object containing user details
 * @returns {Object} Standardized user details object
 */
const extractUserDetailsFromOrder = (order) => {
    if (!order) {
        return getDefaultUserDetails();
    }

    return {
        userId: order.userId || null,
        customerName: order.customerName || 'Guest',
        customerPhone: order.customerPhone || '',
        customerEmail: order.customerEmail || '',
        customerAddress: order.customerAddress || ''
    };
};

/**
 * Extract user details from multiple orders (session orders).
 * Uses the first order as the source of truth for user details.
 * 
 * @param {Array} orders - Array of order objects
 * @returns {Object} Standardized user details from the first order
 */
const extractUserDetailsFromOrders = (orders) => {
    if (!orders || orders.length === 0) {
        return getDefaultUserDetails();
    }

    return extractUserDetailsFromOrder(orders[0]);
};

/**
 * Get default/empty user details structure.
 * Used when user details are not available.
 * 
 * @returns {Object} Default user details object
 */
const getDefaultUserDetails = () => ({
    userId: null,
    customerName: 'Guest',
    customerPhone: '',
    customerEmail: '',
    customerAddress: ''
});

/**
 * Propagate user details to a bill object.
 * Ensures bill contains all customer information from orders.
 * 
 * @param {Object} bill - Bill object to update
 * @param {Object} userDetails - User details object from orders
 * @returns {Object} Updated bill object with user details
 */
const propagateUserDetailsToBill = (bill, userDetails) => {
    if (!bill) return bill;

    bill.userId = userDetails.userId || null;
    bill.customerName = userDetails.customerName || 'Guest';
    bill.customerPhone = userDetails.customerPhone || '';
    bill.customerEmail = userDetails.customerEmail || '';
    bill.customerAddress = userDetails.customerAddress || '';

    return bill;
};

/**
 * Propagate user details to a sales record.
 * Ensures sales records contain customer information for analytics.
 * 
 * @param {Object} salesRecord - Sales record to update
 * @param {Object} userDetails - User details object from orders
 * @returns {Object} Updated sales record with user details
 */
const propagateUserDetailsToSales = (salesRecord, userDetails) => {
    if (!salesRecord) return salesRecord;

    salesRecord.userId = userDetails.userId || null;
    salesRecord.customerPhone = userDetails.customerPhone || '';
    salesRecord.customerEmail = userDetails.customerEmail || '';
    salesRecord.customerAddress = userDetails.customerAddress || '';

    return salesRecord;
};

/**
 * Create a user details payload for Socket.IO emissions.
 * Formats user details for real-time broadcast to connected clients.
 * 
 * @param {Object} userDetails - User details object
 * @param {Object} additionalData - Additional data to include (optional)
 * @returns {Object} Formatted payload for Socket.IO emission
 */
const createUserDetailsPayload = (userDetails, additionalData = {}) => {
    return {
        userId: userDetails.userId || null,
        customerName: userDetails.customerName || 'Guest',
        customerPhone: userDetails.customerPhone || '',
        customerEmail: userDetails.customerEmail || '',
        customerAddress: userDetails.customerAddress || '',
        ...additionalData
    };
};

/**
 * Validate and sanitize user details.
 * Removes any invalid or potentially harmful data.
 * 
 * @param {Object} userDetails - User details to validate
 * @returns {Object} Sanitized user details
 */
const sanitizeUserDetails = (userDetails) => {
    if (!userDetails) {
        return getDefaultUserDetails();
    }

    return {
        userId: userDetails.userId ? String(userDetails.userId) : null,
        customerName: String(userDetails.customerName || 'Guest').substring(0, 255),
        customerPhone: String(userDetails.customerPhone || '').substring(0, 20),
        customerEmail: String(userDetails.customerEmail || '').toLowerCase().substring(0, 255),
        customerAddress: String(userDetails.customerAddress || '').substring(0, 1000)
    };
};

/**
 * Build complete user context object for logging and tracking.
 * Useful for audit trails and user activity tracking.
 * 
 * @param {Object} userDetails - User details object
 * @param {String} action - Action being performed (e.g., 'order_created', 'bill_generated')
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Object} Complete user context object
 */
const buildUserContext = (userDetails, action, metadata = {}) => {
    return {
        userDetails: sanitizeUserDetails(userDetails),
        action,
        timestamp: new Date(),
        metadata
    };
};

/**
 * Check if user details are complete/valid.
 * Ensures at least basic customer information is available.
 * 
 * @param {Object} userDetails - User details to check
 * @returns {Boolean} True if user details are valid
 */
const isUserDetailsValid = (userDetails) => {
    return (
        userDetails &&
        (userDetails.userId || userDetails.customerPhone || userDetails.customerEmail)
    );
};

/**
 * Merge user details from multiple sources.
 * Prioritizes non-empty values from multiple user detail objects.
 * 
 * @param {Array<Object>} userDetailSources - Array of user detail objects to merge
 * @returns {Object} Merged user details
 */
const mergeUserDetails = (userDetailSources) => {
    const merged = getDefaultUserDetails();

    if (!Array.isArray(userDetailSources)) {
        return merged;
    }

    for (const source of userDetailSources) {
        if (!source) continue;

        if (source.userId && !merged.userId) {
            merged.userId = source.userId;
        }
        if (source.customerName && merged.customerName === 'Guest') {
            merged.customerName = source.customerName;
        }
        if (source.customerPhone && !merged.customerPhone) {
            merged.customerPhone = source.customerPhone;
        }
        if (source.customerEmail && !merged.customerEmail) {
            merged.customerEmail = source.customerEmail;
        }
        if (source.customerAddress && !merged.customerAddress) {
            merged.customerAddress = source.customerAddress;
        }
    }

    return merged;
};

module.exports = {
    extractUserDetailsFromOrder,
    extractUserDetailsFromOrders,
    getDefaultUserDetails,
    propagateUserDetailsToBill,
    propagateUserDetailsToSales,
    createUserDetailsPayload,
    sanitizeUserDetails,
    buildUserContext,
    isUserDetailsValid,
    mergeUserDetails
};
