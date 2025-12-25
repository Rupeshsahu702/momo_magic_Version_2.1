/**
 * User Routes - Defines API endpoints for customer authentication and operations.
 */

const express = require('express');
const router = express.Router();
const {
    sendOTP,
    verifyOTP,
    getCustomerByPhone,
    loginOrRegisterCustomer,
    getCustomerByEmail,
    updateCustomer,
    getAllCustomers
} = require('../controllers/userController');

// OTP-based Authentication (New Flow)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Get customer by phone
router.get('/phone/:phone', getCustomerByPhone);

// Legacy login/register (email-based)
router.post('/login', loginOrRegisterCustomer);

// Get all customers (admin)
router.get('/', getAllCustomers);

// Get customer by email
router.get('/email/:email', getCustomerByEmail);

// Update customer
router.put('/:id', updateCustomer);

module.exports = router;
