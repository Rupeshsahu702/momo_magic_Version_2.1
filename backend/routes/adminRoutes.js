/**
 * Admin Routes - Defines API endpoints for admin authentication and password reset.
 */

const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    requestPasswordReset,
    verifyOTPAndResetPassword,
    getOTPLogs
} = require('../controllers/adminController');

// Authentication routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', verifyOTPAndResetPassword);

// OTP logs (for admin auditing)
router.get('/otp-logs', getOTPLogs);

module.exports = router;

