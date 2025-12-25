/**
 * Sales Model - Stores completed order data for analytics and reporting.
 * A Sales record is created when an order status changes to "served".
 */

const mongoose = require('mongoose');


// Schema for individual sold items (denormalized for faster analytics queries)
const soldItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    // Category helps with "top selling by category" analytics
    category: {
        type: String,
        default: 'Uncategorized'
    }
}, { _id: false });


const salesSchema = new mongoose.Schema({
    // Reference to the original order (for traceability)
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },

    orderNumber: {
        type: String,
        required: true
    },

    tableNumber: {
        type: Number,
        required: true
    },

    customerName: {
        type: String,
        default: 'Guest'
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null,
        index: true
    },

    customerPhone: {
        type: String,
        trim: true,
        default: ''
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

    // Denormalized items array for fast aggregation queries
    items: {
        type: [soldItemSchema],
        required: true
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0
    },

    tax: {
        type: Number,
        required: true,
        min: 0
    },

    total: {
        type: Number,
        required: true,
        min: 0
    },

    // When the order was marked as served (key timestamp for analytics)
    servedAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    // Original order creation time (for calculating preparation time)
    orderCreatedAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});


// ============================================================================
// Indexes for Analytics Queries
// ============================================================================

// Primary index for time-based queries (today, this week, this month)
salesSchema.index({ servedAt: -1 });

// Compound index for filtering by date range with totals
salesSchema.index({ servedAt: 1, total: 1 });

// Index for customer-based queries (repeat customer analysis)
salesSchema.index({ customerName: 1, servedAt: -1 });


// ============================================================================
// Static Methods for Analytics
// ============================================================================

/**
 * Get aggregated stats for a given time period.
 * Returns: totalRevenue, totalOrders, avgOrderValue
 */
salesSchema.statics.getAggregatedStats = async function (startDate, endDate) {
    const pipeline = [
        {
            $match: {
                servedAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$total' }
            }
        }
    ];

    const result = await this.aggregate(pipeline);
    return result[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
};


/**
 * Get top selling items by quantity for a given period.
 */
salesSchema.statics.getTopSellingItems = async function (startDate, endDate, limit = 5) {
    const pipeline = [
        {
            $match: {
                servedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.name',
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
    ];

    return this.aggregate(pipeline);
};


/**
 * Get least selling items by quantity for a given period.
 */
salesSchema.statics.getLeastSellingItems = async function (startDate, endDate, limit = 5) {
    const pipeline = [
        {
            $match: {
                servedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.name',
                totalQuantity: { $sum: '$items.quantity' }
            }
        },
        { $sort: { totalQuantity: 1 } },
        { $limit: limit }
    ];

    return this.aggregate(pipeline);
};


/**
 * Get peak order hours for a given period.
 * Returns hourly distribution of orders (0-23).
 */
salesSchema.statics.getPeakOrderHours = async function (startDate, endDate) {
    const pipeline = [
        {
            $match: {
                servedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: { $hour: '$servedAt' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ];

    return this.aggregate(pipeline);
};


/**
 * Get revenue data grouped by day for charts.
 */
salesSchema.statics.getRevenueByDay = async function (startDate, endDate) {
    const pipeline = [
        {
            $match: {
                servedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$servedAt' },
                    month: { $month: '$servedAt' },
                    day: { $dayOfMonth: '$servedAt' }
                },
                revenue: { $sum: '$total' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ];

    return this.aggregate(pipeline);
};


/**
 * Get unique customer count and repeat rate for a period.
 */
salesSchema.statics.getCustomerStats = async function (startDate, endDate) {
    const pipeline = [
        {
            $match: {
                servedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: '$customerName',
                orderCount: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                repeatCustomers: {
                    $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
                }
            }
        }
    ];

    const result = await this.aggregate(pipeline);
    if (result.length === 0) {
        return { totalCustomers: 0, repeatCustomers: 0, repeatRate: 0 };
    }

    const { totalCustomers, repeatCustomers } = result[0];
    const repeatRate = totalCustomers > 0
        ? Math.round((repeatCustomers / totalCustomers) * 100)
        : 0;

    return { totalCustomers, repeatCustomers, repeatRate };
};


module.exports = mongoose.model('Sales', salesSchema);
