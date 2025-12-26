/**
 * Admin Controller - Handles admin authentication and password reset operations.
 * Includes OTP-based password reset using Fast2SMS API.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');
const OTPLog = require('../models/otpLogModel');
const { generateOTP, sendOTPWithRetry } = require('../services/fast2smsService');

/**
 * @desc    Register new admin
 * @route   POST /api/admin/register
 * @access  Public (should be protected or removed in prod after initial setup)
 */
const registerAdmin = async (req, res) => {
    const { name, email, phoneNumber, password, position } = req.body;

    if (!name || !email || !phoneNumber || !password || !position) {
        res.status(400).json({ message: 'Please add all fields' });
        return;
    }

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400).json({ message: 'Admin already exists' });
        return;
    }

    // Create admin
    const admin = await Admin.create({
        name,
        email,
        phoneNumber,
        password,
        position
    });

    if (admin) {
        res.status(201).json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            token: generateToken(admin._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};

/**
 * @desc    Authenticate a admin
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordProvided: !!password }); // Debug log

    // Check for admin email
    const admin = await Admin.findOne({ email });

    console.log('Admin found:', admin ? 'Yes' : 'No'); // Debug log

    if (admin && (await admin.matchPassword(password))) {
        // Update last login
        admin.lastLoginDateTime = new Date();
        await admin.save();

        res.json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            position: admin.position,
            token: generateToken(admin._id),
            lastLoginDateTime: admin.lastLoginDateTime,
            createdAt: admin.createdAt
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

/**
 * @desc    Request password reset OTP
 * @route   POST /api/admin/forgot-password
 * @access  Public
 * 
 * @param {string} req.body.phoneNumber - Admin's registered phone number
 * @returns {Object} Success message or error
 */
const requestPasswordReset = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Please provide your phone number' });
        }

        // Find admin by phone number
        const admin = await Admin.findOne({ phoneNumber });
        if (!admin) {
            // Return generic message to prevent phone number enumeration
            return res.status(200).json({
                message: 'If this phone number is registered, you will receive an OTP shortly.'
            });
        }

        // Invalidate any existing pending OTPs for this phone number
        await OTPLog.updateMany(
            { phoneNumber, status: 'pending' },
            { status: 'expired' }
        );

        // Generate new OTP
        const otp = generateOTP();
        console.log('------------------------------------------------');
        console.log('GENERATED OTP (DEV MODE):', otp);
        console.log('------------------------------------------------');

        const clientIp = req.ip || req.connection.remoteAddress || '';

        // Send OTP via Fast2SMS
        let smsResponse;
        try {
            smsResponse = await sendOTPWithRetry(phoneNumber, otp);
        } catch (err) {
            console.log('SMS Send Failed (Mocking for Dev):', err.message);
            // Verify if error is due to verification/balance issues which are common in dev
            smsResponse = {
                success: true,
                message: 'Mock OTP sent (SMS failed but bypassed for Dev)',
                data: { error: err.message }
            };
        }

        if (!smsResponse.success) {
            // Log the failed attempt
            await OTPLog.createOTPLog({
                phoneNumber,
                adminId: admin._id,
                purpose: 'password_reset',
                status: 'failed',
                ipAddress: clientIp,
                fast2smsResponse: smsResponse.data
            }, otp);

            return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }

        // Create OTP log entry with successful send (or mock success)
        await OTPLog.createOTPLog({
            phoneNumber,
            adminId: admin._id,
            purpose: 'password_reset',
            ipAddress: clientIp,
            fast2smsResponse: smsResponse.data
        }, otp);

        res.status(200).json({
            message: 'OTP sent successfully to your registered phone number.',
            expiresIn: '5 minutes'
        });
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({ message: error.message || 'Server error while sending OTP' });
    }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/admin/reset-password
 * @access  Public
 * 
 * @param {string} req.body.phoneNumber - Admin's phone number
 * @param {string} req.body.otp - The OTP received via SMS
 * @param {string} req.body.newPassword - The new password to set
 * @returns {Object} Success message or error
 */
const verifyOTPAndResetPassword = async (req, res) => {
    try {
        const { phoneNumber, otp, newPassword } = req.body;

        if (!phoneNumber || !otp || !newPassword) {
            return res.status(400).json({
                message: 'Please provide phone number, OTP, and new password'
            });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find the most recent pending OTP for this phone number
        const otpLog = await OTPLog.findOne({
            phoneNumber,
            status: 'pending',
            purpose: 'password_reset'
        }).sort({ createdAt: -1 });

        if (!otpLog) {
            return res.status(400).json({
                message: 'No pending OTP found. Please request a new OTP.'
            });
        }

        // Check if OTP is expired
        if (otpLog.isExpired()) {
            await otpLog.markAsExpired();
            return res.status(400).json({
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isOTPValid = await otpLog.matchOTP(otp);
        if (!isOTPValid) {
            await otpLog.incrementAttempts();
            const remainingAttempts = 3 - otpLog.attempts;

            if (remainingAttempts <= 0) {
                return res.status(400).json({
                    message: 'Too many failed attempts. Please request a new OTP.'
                });
            }

            return res.status(400).json({
                message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
            });
        }

        // OTP is valid - update password
        const admin = await Admin.findById(otpLog.adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin account not found' });
        }

        admin.password = newPassword;
        await admin.save();

        // Mark OTP as verified
        await otpLog.markAsVerified();

        res.status(200).json({
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Error in verifyOTPAndResetPassword:', error);
        res.status(500).json({ message: 'Server error while resetting password' });
    }
};

/**
 * @desc    Get OTP logs for auditing (admin only)
 * @route   GET /api/admin/otp-logs
 * @access  Private (Admin)
 * 
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 20)
 * @returns {Object} Paginated OTP logs
 */
const getOTPLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const totalLogs = await OTPLog.countDocuments();
        const otpLogs = await OTPLog.find()
            .populate('adminId', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-otpHash'); // Never expose OTP hash

        res.status(200).json({
            logs: otpLogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalLogs,
                hasMore: page * limit < totalLogs
            }
        });
    } catch (error) {
        console.error('Error in getOTPLogs:', error);
        res.status(500).json({ message: 'Server error while fetching OTP logs' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'abc12345', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerAdmin,
    loginAdmin,
    requestPasswordReset,
    verifyOTPAndResetPassword,
    getOTPLogs
};

