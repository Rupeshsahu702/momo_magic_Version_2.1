/**
 * User Controller - Handles customer registration, authentication, and OTP verification.
 * Provides endpoints for phone-based OTP authentication and profile management.
 */

const Customer = require('../models/customerModel');
const OTPLog = require('../models/otpLogModel');
const twoFactorService = require('../services/twoFactorService');

// ============================================================================
// OTP-Based Authentication Flow
// ============================================================================

/**
 * @desc    Send OTP to customer's phone number
 * @route   POST /api/users/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Validate phone number
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const cleanedNumber = phoneNumber.replace(/\D/g, '');
        if (cleanedNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit phone number'
            });
        }

        try {
            // Generate and send OTP
            const otpResult = await twoFactorService.sendOTPForVerification(cleanedNumber);

            // Store OTP log for verification tracking
            const otpLog = await OTPLog.create({
                phoneNumber: cleanedNumber,
                otpHash: otpResult.otp, // In production, this should be hashed
                purpose: 'customer_verification',
                status: 'pending',
                sessionId: otpResult.sessionId,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
                ipAddress: req.ip || ''
            });

            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                sessionId: otpResult.sessionId,
                expiresIn: 300 // 5 minutes in seconds
            });
        } catch (otpError) {
            console.error('Error sending OTP:', otpError.message);
            return res.status(500).json({
                success: false,
                message: otpError.message || 'Failed to send OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in sendOTP:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending OTP'
        });
    }
};

/**
 * @desc    Verify OTP and create/fetch customer session
 * @route   POST /api/users/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, sessionId, otp, name, email } = req.body;

        // Validate required fields
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        if (!/^\d{4}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'OTP must be 4 digits'
            });
        }

        const cleanedNumber = phoneNumber.replace(/\D/g, '');

        try {
            // Verify OTP with 2Factor.in
            const verificationResult = await twoFactorService.verifyOTP(cleanedNumber, sessionId, otp);

            if (!verificationResult.success) {
                // Update OTP log with failed attempt
                const otpLog = await OTPLog.findOne({
                    phoneNumber: cleanedNumber,
                    status: 'pending'
                }).sort({ createdAt: -1 });

                if (otpLog) {
                    otpLog.attempts = (otpLog.attempts || 0) + 1;
                    if (otpLog.attempts >= 3) {
                        otpLog.status = 'failed';
                    }
                    await otpLog.save();
                }

                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP. Please try again.'
                });
            }

            // OTP verified successfully - create or fetch customer
            let customer = await Customer.findOne({ phone: cleanedNumber });

            if (customer) {
                // Existing customer - update last visit
                customer.lastVisit = new Date();
                if (name && name !== customer.name) customer.name = name;
                if (email && email !== customer.email) customer.email = email;
                if (email) customer.isVerified = true;
                await customer.save();

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back!',
                    isNewCustomer: false,
                    customer: {
                        id: customer._id,
                        name: customer.name,
                        phone: customer.phone,
                        email: customer.email || '',
                        isVerified: customer.isVerified
                    }
                });
            }

            // New customer - create account
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer name is required for new accounts'
                });
            }

            customer = await Customer.create({
                name,
                phone: cleanedNumber,
                email: email || undefined,
                isVerified: true,
                verifiedAt: new Date(),
                lastVisit: new Date()
            });

            // Mark OTP as verified in log
            const otpLog = await OTPLog.findOne({
                phoneNumber: cleanedNumber,
                status: 'pending'
            }).sort({ createdAt: -1 });

            if (otpLog) {
                otpLog.status = 'verified';
                otpLog.verifiedAt = new Date();
                otpLog.customerId = customer._id;
                await otpLog.save();
            }

            return res.status(201).json({
                success: true,
                message: 'Account created and verified successfully!',
                isNewCustomer: true,
                customer: {
                    id: customer._id,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email || '',
                    isVerified: customer.isVerified
                }
            });
        } catch (verifyError) {
            console.error('Error verifying OTP:', verifyError.message);
            return res.status(500).json({
                success: false,
                message: verifyError.message || 'Failed to verify OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification'
        });
    }
};

/**
 * @desc    Get customer by phone (for session retrieval)
 * @route   GET /api/users/phone/:phone
 * @access  Public
 */
const getCustomerByPhone = async (req, res) => {
    try {
        const cleanedNumber = req.params.phone.replace(/\D/g, '');

        if (cleanedNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number'
            });
        }

        const customer = await Customer.findOne({ phone: cleanedNumber });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            customer: {
                id: customer._id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email || '',
                isVerified: customer.isVerified,
                totalOrders: customer.totalOrders
            }
        });
    } catch (error) {
        console.error('Error fetching customer by phone:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Register new customer or login existing one (Legacy - for backwards compatibility)
 * @route   POST /api/users/login
 * @access  Public
 */
const loginOrRegisterCustomer = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and phone number'
            });
        }

        // Check if customer already exists by phone (primary key)
        let customer = await Customer.findOne({ phone: phone.replace(/\D/g, '') });

        if (customer) {
            // Existing customer - update last visit and return
            customer.lastVisit = new Date();

            // Update name and email if different
            if (customer.name !== name) customer.name = name;
            if (email && customer.email !== email) customer.email = email;

            await customer.save();

            return res.status(200).json({
                success: true,
                message: 'Welcome back!',
                isNewCustomer: false,
                customer: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email || '',
                    phone: customer.phone,
                    totalOrders: customer.totalOrders
                }
            });
        }

        // New customer - create account
        customer = await Customer.create({
            name,
            email: email || undefined,
            phone: phone.replace(/\D/g, ''),
            lastVisit: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            isNewCustomer: true,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone,
                totalOrders: customer.totalOrders
            }
        });
    } catch (error) {
        console.error('Error in customer login/register:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already registered`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

/**
 * @desc    Get customer by email
 * @route   GET /api/users/email/:email
 * @access  Public
 */
const getCustomerByEmail = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            email: req.params.email.toLowerCase()
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                totalOrders: customer.totalOrders
            }
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update customer details
 * @route   PUT /api/users/:id
 * @access  Public
 */
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const { name, phone, address, email } = req.body;

        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        if (email) customer.email = email;

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone,
                address: customer.address
            }
        });
    } catch (error) {
        console.error('Error updating customer:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get all customers (admin use)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    getCustomerByPhone,
    loginOrRegisterCustomer,
    getCustomerByEmail,
    updateCustomer,
    getAllCustomers
};
