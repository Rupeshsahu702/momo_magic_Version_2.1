/**
 * Order Model - MongoDB schema for customer orders.
 * Stores order details, items, status, and timestamps for the Momo Magic restaurant.
 */

const mongoose = require('mongoose');

// Schema for individual order items
const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: false  // Optional for backward compatibility with existing orders
    },
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        default: ''
    },
    imageLink: {
        type: String,
        default: ''  // Fallback to empty string if no image provided
    }
}, { _id: false });

// Main order schema
const orderSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: [true, 'Session ID is required for billing'],
        index: true  // Index for efficient session-based queries
    },
    orderNumber: {
        type: String,
        required: [true, 'Order number is required'],
        unique: true
    },
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        min: [1, 'Table number must be at least 1']
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    customerPhone: {
        type: String,
        trim: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null,
        index: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    customerAddress: {
        type: String,
        trim: true,
        default: ''
    },
    items: {
        type: [orderItemSchema],
        required: [true, 'Order must contain at least one item'],
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: 'Order must contain at least one item'
        }
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: true,
        min: [0, 'Tax cannot be negative']
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'served', 'cancelled'],
        default: 'pending'
    },
    estimatedTime: {
        type: String,
        default: '15-20 mins'
    },
    billingStatus: {
        type: String,
        enum: ['unpaid', 'pending_payment', 'paid'],
        default: 'unpaid'
    },
    paymentRequestedAt: {
        type: Date,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Index for faster queries by status and creation date
orderSchema.index({ status: 1, createdAt: -1 });

// Virtual for item count
orderSchema.virtual('itemCount').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are included in JSON output
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
