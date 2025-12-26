/**
 * Order Service - API functions for order management.
 * Handles all HTTP requests to the order endpoints.
 */

import api from './api';

/**
 * Create a new order.
 * @param {Object} orderData - The order data including items, table number, etc.
 * @returns {Promise<Object>} The created order with database ID
 */
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

/**
 * Get all orders with optional status filter.
 * @param {string} [status] - Optional status filter (pending, preparing, served, cancelled)
 * @returns {Promise<Object>} Object containing orders array and count
 */
export const getAllOrders = async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data;
};

/**
 * Get a single order by ID.
 * @param {string} orderId - The MongoDB order ID
 * @returns {Promise<Object>} The order data
 */
export const getOrderById = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

/**
 * Get orders by table number.
 * @param {number} tableNumber - The table number
 * @returns {Promise<Object>} Object containing orders array for the table
 */
export const getOrdersByTable = async (tableNumber) => {
    const response = await api.get(`/orders/table/${tableNumber}`);
    return response.data;
};

/**
 * Update order status.
 * @param {string} orderId - The MongoDB order ID
 * @param {string} status - New status (pending, preparing, served, cancelled)
 * @returns {Promise<Object>} The updated order data
 */
export const updateOrderStatus = async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}`, { status });
    return response.data;
};

/**
 * Delete an order.
 * @param {string} orderId - The MongoDB order ID
 * @returns {Promise<Object>} Confirmation of deletion
 */
export const deleteOrder = async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
};


// ============================================================================
// Session-Based Billing
// ============================================================================

/**
 * Get all orders for a specific session.
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} Object containing all orders for the session
 */
export const getSessionOrders = async (sessionId) => {
    const response = await api.get(`/orders/session/${sessionId}`);
    return response.data;
};

/**
 * Get consolidated bill for a session.
 * Aggregates all items from all orders in the session into one bill.
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} Consolidated bill data with all items and totals
 */
export const getConsolidatedBill = async (sessionId) => {
    const response = await api.get(`/orders/session/${sessionId}/bill`);
    return response.data;
};

/**
 * Request payment - notifies admin that customer is ready to pay.
 * Sends instant Socket.IO notification to admin dashboard.
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} Confirmation that notification was sent
 */
export const requestPayment = async (sessionId) => {
    const response = await api.post(`/orders/session/${sessionId}/pay-request`);
    return response.data;
};

/**
 * Get all pending payments for admin Payments tab.
 * @returns {Promise<Object>} List of sessions with pending payments
 */
export const getPendingPayments = async () => {
    const response = await api.get('/orders/payments');
    return response.data;
};

/**
 * Update billing status for a session.
 * Admin uses this to mark bills as Paid or Unpaid.
 * @param {string} sessionId - The session ID
 * @param {string} billingStatus - New status ('paid', 'unpaid', 'pending_payment')
 * @param {string} [paymentMethod] - Optional payment method ('cash', 'card', 'upi')
 * @returns {Promise<Object>} Confirmation of status update
 */
export const updateBillingStatus = async (sessionId, billingStatus, paymentMethod = null) => {
    const response = await api.patch(`/orders/session/${sessionId}/billing-status`, {
        billingStatus,
        paymentMethod
    });
    return response.data;
};


/**
 * Get the Bill document for a session.
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} The Bill document with all details
 */
export const getBillRecord = async (sessionId) => {
    const response = await api.get(`/orders/session/${sessionId}/bill-record`);
    return response.data;
};


/**
 * Get all bills with optional filters (for admin billing history).
 * @param {Object} [filters] - Optional filters { status, startDate, endDate }
 * @returns {Promise<Object>} List of all bills
 */
export const getAllBills = async (filters = {}) => {
    const response = await api.get('/orders/bills', { params: filters });
    return response.data;
};


/**
 * Get all orders by customer phone number.
 * Allows customers to view their complete order history.
 * @param {string} phone - Customer phone number
 * @returns {Promise<Object>} List of all orders for the phone number
 */
export const getOrdersByPhone = async (phone) => {
    const response = await api.get(`/orders/phone/${phone}`);
    return response.data;
};


/**
 * Get all bills by customer phone number.
 * Allows customers to view their complete billing history.
 * @param {string} phone - Customer phone number
 * @returns {Promise<Object>} List of all bills for the phone number
 */
export const getBillsByPhone = async (phone) => {
    const response = await api.get(`/orders/bills/phone/${phone}`);
    return response.data;
};


export default {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByTable,
    getOrdersByPhone,
    updateOrderStatus,
    deleteOrder,
    getSessionOrders,
    getConsolidatedBill,
    requestPayment,
    getPendingPayments,
    updateBillingStatus,
    getBillRecord,
    getAllBills,
    getBillsByPhone
};

