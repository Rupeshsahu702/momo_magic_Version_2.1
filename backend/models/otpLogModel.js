/**
 * OTP Log Model - Stores all OTP exchanges for password reset and auditing.
 * Tracks OTP generation, verification status, and expiry for security purposes.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const OTP_EXPIRY_MINUTES = 5;

const otpLogSchema = mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    otpHash: {
        type: String,
        required: [true, 'OTP hash is required']
    },
    purpose: {
        type: String,
        required: true,
        enum: ['password_reset', 'verification', 'login', 'customer_verification'],
        default: 'verification'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'expired', 'failed'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: ''
    },
    attempts: {
        type: Number,
        default: 0
    },
    sessionId: {
        type: String,
        default: null
    },
    apiResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries on phone number and status
otpLogSchema.index({ phoneNumber: 1, status: 1 });
otpLogSchema.index({ adminId: 1 });
otpLogSchema.index({ expiresAt: 1 });

/**
 * Hash OTP before saving for security.
 * @param {string} otp - The plain OTP to hash
 * @returns {string} The hashed OTP
 */
otpLogSchema.statics.hashOTP = async function (otp) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

/**
 * Verify if the provided OTP matches the stored hash.
 * @param {string} enteredOtp - The OTP entered by user
 * @returns {boolean} True if OTP matches
 */
otpLogSchema.methods.matchOTP = async function (enteredOtp) {
    return bcrypt.compare(enteredOtp, this.otpHash);
};

/**
 * Check if the OTP has expired.
 * @returns {boolean} True if OTP is expired
 */
otpLogSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

/**
 * Mark OTP as verified and update status.
 */
otpLogSchema.methods.markAsVerified = async function () {
    this.status = 'verified';
    this.verifiedAt = new Date();
    return this.save();
};

/**
 * Mark OTP as expired.
 */
otpLogSchema.methods.markAsExpired = async function () {
    this.status = 'expired';
    return this.save();
};

/**
 * Increment failed attempt counter.
 */
otpLogSchema.methods.incrementAttempts = async function () {
    this.attempts += 1;
    if (this.attempts >= 3) {
        this.status = 'failed';
    }
    return this.save();
};

/**
 * Generate a new OTP log entry with expiry time.
 * @param {Object} data - OTP log data
 * @param {string} plainOtp - The plain OTP (will be hashed)
 * @returns {Document} The created OTP log entry
 */
otpLogSchema.statics.createOTPLog = async function (data, plainOtp) {
    const otpHash = await this.hashOTP(plainOtp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    return this.create({
        ...data,
        otpHash,
        expiresAt
    });
};

module.exports = mongoose.model('OTPLog', otpLogSchema);
