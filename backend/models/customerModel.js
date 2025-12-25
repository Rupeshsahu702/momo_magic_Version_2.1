/**
 * Customer Model - Defines the schema for customers (website visitors/users).
 * Stores customer information for order tracking and personalization.
 * Authentication is phone-number based with OTP verification.
 */

const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add your name'],
        trim: true
    },
    email: {
        type: String,
        optional: true,
        unique: false,
        trim: true,
        lowercase: true,
        sparse: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Please add your phone number'],
        unique: true,
        trim: true,
        index: true
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    totalOrders: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update lastVisit on each login
customerSchema.methods.updateLastVisit = async function () {
    this.lastVisit = new Date();
    return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
