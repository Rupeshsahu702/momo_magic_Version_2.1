/**
 * Sales Controller - Handles analytics API endpoints.
 * Provides aggregated data for the admin Analytics dashboard.
 */

const Sales = require('../models/salesModel');


// Helper Functions

// /**
//  * Calculates date range based on period string.
//  * @param {string} period - 'today', 'week', 'month', or 'year'
//  * @returns {{ startDate: Date, endDate: Date }}
//  */
const getDateRangeForPeriod = (period) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(now);

    switch (period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;

        case 'week':
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;

        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;

        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;

        default:
            // Default to today if period is unrecognized
            startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
};


// API Handlers
// /**
//  * Get aggregated stats (total revenue, orders, avg value, repeat rate).
//  * @route GET /api/sales/stats
//  * @query period - 'today', 'week', 'month' (default: 'today')
//  */
const getAggregatedStats = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Fetch all stats in parallel for better performance
        const [salesStats, customerStats] = await Promise.all([
            Sales.getAggregatedStats(startDate, endDate),
            Sales.getCustomerStats(startDate, endDate)
        ]);

        response.status(200).json({
            success: true,
            data: {
                totalRevenue: salesStats.totalRevenue || 0,
                totalOrders: salesStats.totalOrders || 0,
                avgOrderValue: Math.round((salesStats.avgOrderValue || 0) * 100) / 100,
                customerRepeatRate: customerStats.repeatRate || 0,
                period
            }
        });

    } catch (error) {
        console.error('Error fetching aggregated stats:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch analytics stats',
            error: error.message
        });
    }
};


/**
 * Get top selling items by quantity.
 * @route GET /api/sales/top-items
 * @query period - 'today', 'week', 'month'
 * @query limit - Number of items to return (default: 5)
 */
const getTopSellingItems = async (request, response) => {
    try {
        const { period = 'today', limit = 5 } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        const topItems = await Sales.getTopSellingItems(startDate, endDate, parseInt(limit));

        // Format response for frontend charts
        const formattedItems = topItems.map(item => ({
            name: item._id,
            quantity: item.totalQuantity,
            revenue: Math.round(item.totalRevenue * 100) / 100
        }));

        response.status(200).json({
            success: true,
            data: formattedItems
        });

    } catch (error) {
        console.error('Error fetching top selling items:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch top selling items',
            error: error.message
        });
    }
};


/**
 * Get least selling items by quantity.
 * @route GET /api/sales/least-items
 * @query period - 'today', 'week', 'month'
 * @query limit - Number of items to return (default: 5)
 */
const getLeastSellingItems = async (request, response) => {
    try {
        const { period = 'today', limit = 5 } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        const leastItems = await Sales.getLeastSellingItems(startDate, endDate, parseInt(limit));

        const formattedItems = leastItems.map(item => ({
            name: item._id,
            quantity: item.totalQuantity
        }));

        response.status(200).json({
            success: true,
            data: formattedItems
        });

    } catch (error) {
        console.error('Error fetching least selling items:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch least selling items',
            error: error.message
        });
    }
};


/**
 * Get peak order hours distribution.
 * @route GET /api/sales/peak-hours
 * @query period - 'today', 'week', 'month'
 */
const getPeakOrderHours = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        const peakHours = await Sales.getPeakOrderHours(startDate, endDate);

        // Fill in missing hours with 0 for complete 24-hour chart
        const hourlyData = Array.from({ length: 24 }, (_, hour) => {
            const found = peakHours.find(item => item._id === hour);
            return {
                hour,
                orderCount: found ? found.orderCount : 0
            };
        });

        response.status(200).json({
            success: true,
            data: hourlyData
        });

    } catch (error) {
        console.error('Error fetching peak order hours:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch peak order hours',
            error: error.message
        });
    }
};


/**
 * Get revenue data for charts (daily breakdown).
 * @route GET /api/sales/revenue
 * @query period - 'week', 'month'
 */
const getRevenueData = async (request, response) => {
    try {
        const { period = 'week' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        const revenueData = await Sales.getRevenueByDay(startDate, endDate);

        // Format for chart display
        const formattedData = revenueData.map(item => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            revenue: Math.round(item.revenue * 100) / 100,
            orders: item.orderCount
        }));

        response.status(200).json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Error fetching revenue data:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch revenue data',
            error: error.message
        });
    }
};


/**
 * Get recent sales for activity table.
 * @route GET /api/sales/recent
 * @query limit - Number of records to return (default: 10)
 */
const getRecentSales = async (request, response) => {
    try {
        const { limit = 10 } = request.query;

        const recentSales = await Sales.find()
            .sort({ servedAt: -1 })
            .limit(parseInt(limit))
            .select('orderNumber customerName items total servedAt tableNumber');

        response.status(200).json({
            success: true,
            data: recentSales
        });

    } catch (error) {
        console.error('Error fetching recent sales:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch recent sales',
            error: error.message
        });
    }
};


module.exports = {
    getAggregatedStats,
    getTopSellingItems,
    getLeastSellingItems,
    getPeakOrderHours,
    getRevenueData,
    getRecentSales
};
