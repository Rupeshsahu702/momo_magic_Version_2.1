/**
 * Bill Model - MongoDB schema for customer bills.
 * Stores complete bill details including all order items, totals, and payment status.
 * This provides a permanent record of each billing transaction.
 */

const mongoose = require('mongoose');

// Schema for bill items (copied from order items for persistence)
const billItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: false  // Optional for backward compatibility with existing bills
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

// Main bill schema
const billSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: [true, 'Bill number is required'],
        unique: true
    },
    sessionId: {
        type: String,
        required: [true, 'Session ID is required'],
        index: true
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
        type: [billItemSchema],
        required: [true, 'Bill must contain at least one item'],
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: 'Bill must contain at least one item'
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
    orderCount: {
        type: Number,
        required: true,
        min: [1, 'Must have at least one order']
    },
    orders: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        orderNumber: String
    }],
    billingStatus: {
        type: String,
        enum: ['unpaid', 'pending_payment', 'paid'],
        default: 'pending_payment'
    },
    paymentRequestedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: {
        type: Date,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'other', null],
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
billSchema.index({ billingStatus: 1, createdAt: -1 });
billSchema.index({ tableNumber: 1, createdAt: -1 });

// Virtual for item count
billSchema.virtual('itemCount').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are included in JSON output
billSchema.set('toJSON', { virtuals: true });
billSchema.set('toObject', { virtuals: true });

/**
 * Generate a unique bill number in format: BILL-YYYYMMDD-XXX
 * Example: BILL-20241224-001
 */
billSchema.statics.generateBillNumber = async function () {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Find the last bill created today to get the sequence number
    const lastBill = await this.findOne({
        billNumber: new RegExp(`^BILL-${datePrefix}-`)
    }).sort({ billNumber: -1 });

    let sequenceNumber = 1;
    if (lastBill) {
        const lastSequence = parseInt(lastBill.billNumber.split('-')[2], 10);
        sequenceNumber = lastSequence + 1;
    }

    return `BILL-${datePrefix}-${sequenceNumber.toString().padStart(3, '0')}`;
};

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
