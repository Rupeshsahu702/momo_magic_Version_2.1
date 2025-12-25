/**
 * Order Routes - API endpoints for order management.
 * These routes handle the complete lifecycle of customer orders from creation to completion.
 */

const express = require('express');
const router = express.Router();
const { verifyCustomerAuth, optionalCustomerAuth } = require('../middleware/authMiddleware');
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByTable,
    getOrdersByPhone,
    getSessionOrders,
    getConsolidatedBill,
    requestPayment,
    updateBillingStatus,
    getPendingPayments,
    getBillBySession,
    getAllBills,
    getBillsByPhone
} = require('../controllers/orderController');


// ============================================================================
// Order Creation & Retrieval
// ============================================================================

// Customers place orders through this endpoint; supports both authenticated and guest users
router.post('/', optionalCustomerAuth, createOrder);

// Admin dashboard uses this to display all orders, with optional filtering by status
router.get('/', getAllOrders);

// Customers can track their own orders by providing their table number
router.get('/table/:tableNumber', getOrdersByTable);

// Get orders by customer phone number (for order history)
router.get('/phone/:phone', getOrdersByPhone);


// ============================================================================
// Payments Management (Admin)
// ============================================================================

// Get all pending payments for admin Payments tab
router.get('/payments', getPendingPayments);

// Get all bills (admin billing history)
router.get('/bills', getAllBills);

// Get bills by customer phone number (for customer billing history)
router.get('/bills/phone/:phone', getBillsByPhone);


// ============================================================================
// Session-Based Billing (Consolidated Bills)
// ============================================================================

// Get all orders for a specific session (customer's visit)
router.get('/session/:sessionId', getSessionOrders);

// Get consolidated bill aggregating all items from the session
router.get('/session/:sessionId/bill', getConsolidatedBill);

// Get bill record from database for a session
router.get('/session/:sessionId/bill-record', getBillBySession);

// Request payment - sends instant notification to admin that customer is ready to pay
router.post('/session/:sessionId/pay-request', requestPayment);

// Update billing status (paid/unpaid) - admin only
router.patch('/session/:sessionId/billing-status', updateBillingStatus);


// ============================================================================
// Order Lifecycle Management
// ============================================================================

// Detailed view of a single order (used when clicking on an order in the list)
router.get('/:id', getOrderById);

// Status transitions: pending → preparing → served (or cancelled at any point)
router.patch('/:id', updateOrderStatus);

// Permanent removal of an order record (use sparingly; prefer status = 'cancelled')
router.delete('/:id', deleteOrder);


module.exports = router;
