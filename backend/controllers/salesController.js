/**
 * Sales Controller - Handles analytics API endpoints.
 * Provides aggregated data for the admin Analytics dashboard.
 * 
 * NOTE: Analytics now uses Bill data as the primary revenue source since bills
 * are created when customers request payment (before orders are marked as served).
 */

const Sales = require('../models/salesModel');
const Bill = require('../models/billModel');


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
/**
 * Get aggregated stats (total revenue, orders, avg value, repeat rate).
 * Uses Bill data as the primary source since bills are created when payment is requested.
 * @route GET /api/sales/stats
 * @query period - 'today', 'week', 'month' (default: 'today')
 */
const getAggregatedStats = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Fetch paid bills for the period
        const paidBills = await Bill.find({
            billingStatus: 'paid',
            paidAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Calculate stats from bills
        const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.total, 0);
        const totalOrders = paidBills.reduce((sum, bill) => sum + bill.orderCount, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate customer repeat rate from bills
        const customerStats = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: startDate, $lte: endDate },
                    customerPhone: { $ne: '', $exists: true }
                }
            },
            {
                $group: {
                    _id: '$customerPhone',
                    visits: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$visits', 1] }, 1, 0] }
                    }
                }
            }
        ]);

        const repeatRate = customerStats.length > 0 && customerStats[0].totalCustomers > 0
            ? Math.round((customerStats[0].repeatCustomers / customerStats[0].totalCustomers) * 100)
            : 0;

        response.status(200).json({
            success: true,
            data: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalOrders,
                avgOrderValue: Math.round(avgOrderValue * 100) / 100,
                customerRepeatRate: repeatRate,
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
 * Get top selling items by quantity from paid bills.
 * @route GET /api/sales/top-items
 * @query period - 'today', 'week', 'month'
 * @query limit - Number of items to return (default: 5)
 */
const getTopSellingItems = async (request, response) => {
    try {
        const { period = 'today', limit = 5 } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Aggregate top items from paid bills
        const topItems = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: startDate, $lte: endDate }
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
            { $limit: parseInt(limit) }
        ]);

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
 * Get least selling items by quantity from paid bills.
 * @route GET /api/sales/least-items
 * @query period - 'today', 'week', 'month'
 * @query limit - Number of items to return (default: 5)
 */
const getLeastSellingItems = async (request, response) => {
    try {
        const { period = 'today', limit = 5 } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Aggregate least selling items from paid bills
        const leastItems = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: startDate, $lte: endDate }
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
            { $limit: parseInt(limit) }
        ]);

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
 * Get peak order hours distribution from paid bills.
 * @route GET /api/sales/peak-hours
 * @query period - 'today', 'week', 'month'
 */
const getPeakOrderHours = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Aggregate peak hours from paid bills using paidAt timestamp
        // Note: Add 330 minutes (5.5 hours) to convert UTC to IST (Asia/Kolkata)
        const peakHours = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $addFields: {
                    // Convert UTC to IST by adding 5 hours 30 minutes (330 minutes)
                    istTime: { $add: ['$paidAt', 330 * 60 * 1000] }
                }
            },
            {
                $group: {
                    _id: { $hour: '$istTime' },
                    totalOrders: { $sum: '$orderCount' },
                    totalBills: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate number of days in the period for averaging
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;

        // Fill in missing hours with 0 for complete 24-hour chart
        // For week/month, show average orders per hour; for today, show total
        const hourlyData = Array.from({ length: 24 }, (_, hour) => {
            const found = peakHours.find(item => item._id === hour);
            const totalOrders = found ? found.totalOrders : 0;

            // For today, show total orders; for week/month show average per day
            const orderCount = period === 'today'
                ? totalOrders
                : Math.round(totalOrders / daysDiff * 10) / 10; // Average with 1 decimal

            return {
                hour,
                orderCount,
                totalOrders: found ? found.totalOrders : 0
            };
        });

        response.status(200).json({
            success: true,
            data: hourlyData,
            period: period,
            daysInPeriod: daysDiff
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
 * Get recent paid bills for activity table.
 * @route GET /api/sales/recent
 * @query limit - Number of records to return (default: 10)
 */
const getRecentSales = async (request, response) => {
    try {
        const { limit = 10 } = request.query;

        // Fetch recent paid bills instead of sales
        const recentBills = await Bill.find({ billingStatus: 'paid' })
            .sort({ paidAt: -1 })
            .limit(parseInt(limit))
            .select('billNumber customerName items total paidAt tableNumber');

        // Transform bills to match expected format
        const recentSales = recentBills.map(bill => ({
            orderNumber: bill.billNumber,
            customerName: bill.customerName,
            items: bill.items,
            total: bill.total,
            servedAt: bill.paidAt,
            tableNumber: bill.tableNumber
        }));

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


/**
 * Get hourly revenue breakdown for enhanced revenue visualization.
 * For 'today': Returns hourly breakdown (24 hours)
 * For 'week' and 'month': Returns daily breakdown
 * @route GET /api/sales/revenue-by-hour
 * @query period - 'today', 'week', 'month'
 */
const getRevenueByHour = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        if (period === 'today') {
            // For today: aggregate by hour
            const hourlyRevenue = await Bill.aggregate([
                {
                    $match: {
                        billingStatus: 'paid',
                        paidAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $addFields: {
                        // Convert UTC to IST by adding 5 hours 30 minutes (330 minutes)
                        istTime: { $add: ['$paidAt', 330 * 60 * 1000] }
                    }
                },
                {
                    $group: {
                        _id: { $hour: '$istTime' },
                        revenue: { $sum: '$total' },
                        orderCount: { $sum: '$orderCount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Fill in missing hours with 0 for complete 24-hour chart
            const hourlyData = Array.from({ length: 24 }, (_, hour) => {
                const found = hourlyRevenue.find(item => item._id === hour);
                return {
                    hour,
                    revenue: found ? Math.round(found.revenue * 100) / 100 : 0,
                    orderCount: found ? found.orderCount : 0
                };
            });

            response.status(200).json({
                success: true,
                data: hourlyData,
                type: 'hourly'
            });
        } else {
            // For week and month: aggregate by day
            const dailyRevenue = await Bill.aggregate([
                {
                    $match: {
                        billingStatus: 'paid',
                        paidAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $addFields: {
                        // Convert UTC to IST
                        istTime: { $add: ['$paidAt', 330 * 60 * 1000] }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$istTime' },
                            month: { $month: '$istTime' },
                            day: { $dayOfMonth: '$istTime' }
                        },
                        revenue: { $sum: '$total' },
                        orderCount: { $sum: '$orderCount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // Create a map for quick lookup
            const revenueMap = {};
            dailyRevenue.forEach(item => {
                const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
                revenueMap[key] = {
                    revenue: Math.round(item.revenue * 100) / 100,
                    orderCount: item.orderCount
                };
            });

            // Fill in all days in the range
            const allDays = [];
            const currentDate = new Date(startDate);
            // Convert to IST for correct date iteration
            currentDate.setMinutes(currentDate.getMinutes() + 330);

            const endDateIST = new Date(endDate);
            endDateIST.setMinutes(endDateIST.getMinutes() + 330);

            while (currentDate <= endDateIST) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const day = currentDate.getDate();
                const dayOfWeek = currentDate.getDay() + 1; // Convert 0-6 to 1-7
                const key = `${year}-${month}-${day}`;

                const dayData = revenueMap[key] || { revenue: 0, orderCount: 0 };

                allDays.push({
                    year,
                    month,
                    day,
                    dayOfWeek,
                    revenue: dayData.revenue,
                    orderCount: dayData.orderCount,
                    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                });

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            response.status(200).json({
                success: true,
                data: allDays,
                type: 'daily',
                period: period
            });
        }

    } catch (error) {
        console.error('Error fetching revenue by hour:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch hourly revenue data',
            error: error.message
        });
    }
};


/**
 * Get new customers count over time.
 * @route GET /api/sales/new-customers
 * @query period - 'week', 'month'
 */
const getNewCustomers = async (request, response) => {
    try {
        const { period = 'week' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Get first-time customers by finding the earliest bill for each phone number
        const customerFirstOrders = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    customerPhone: { $ne: '', $exists: true }
                }
            },
            {
                $sort: { paidAt: 1 }
            },
            {
                $group: {
                    _id: '$customerPhone',
                    firstOrderDate: { $first: '$paidAt' }
                }
            },
            {
                $addFields: {
                    // Convert UTC to IST
                    istTime: { $add: ['$firstOrderDate', 330 * 60 * 1000] }
                }
            },
            {
                $match: {
                    firstOrderDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$istTime' },
                        month: { $month: '$istTime' },
                        day: { $dayOfMonth: '$istTime' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Create a map for quick lookup
        const customerMap = {};
        customerFirstOrders.forEach(item => {
            const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
            customerMap[key] = item.count;
        });

        // Fill in all days in the range
        const allDays = [];
        const currentDate = new Date(startDate);
        currentDate.setMinutes(currentDate.getMinutes() + 330); // Convert to IST

        const endDateIST = new Date(endDate);
        endDateIST.setMinutes(endDateIST.getMinutes() + 330);

        while (currentDate <= endDateIST) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            const dayOfWeek = currentDate.getDay() + 1;
            const key = `${year}-${month}-${day}`;

            allDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day,
                month,
                dayOfWeek,
                count: customerMap[key] || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        response.status(200).json({
            success: true,
            data: allDays,
            period: period
        });

    } catch (error) {
        console.error('Error fetching new customers:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch new customers data',
            error: error.message
        });
    }
};


/**
 * Get popular food item combinations from bills.
 * @route GET /api/sales/popular-combos
 * @query period - 'today', 'week', 'month'
 * @query limit - Number of combos to return (default: 5)
 */
const getPopularCombos = async (request, response) => {
    try {
        const { period = 'today', limit = 5 } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Find bills with multiple items and analyze combinations
        const bills = await Bill.find({
            billingStatus: 'paid',
            paidAt: { $gte: startDate, $lte: endDate }
        }).select('items');

        // Count item pairs
        const comboCounts = {};
        bills.forEach(bill => {
            if (bill.items.length >= 2) {
                // Sort items to ensure "A + B" is same as "B + A"
                const itemNames = bill.items.map(item => item.name).sort();

                // Create pairs
                for (let i = 0; i < itemNames.length - 1; i++) {
                    for (let j = i + 1; j < itemNames.length; j++) {
                        const comboKey = `${itemNames[i]} + ${itemNames[j]}`;
                        comboCounts[comboKey] = (comboCounts[comboKey] || 0) + 1;
                    }
                }
            }
        });

        // Convert to array and sort by count
        const sortedCombos = Object.entries(comboCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, parseInt(limit));

        // Calculate maxCount for progress bars
        const maxCount = sortedCombos.length > 0 ? sortedCombos[0].count : 1;
        const formattedCombos = sortedCombos.map(combo => ({
            name: combo.name,
            count: combo.count,
            maxCount
        }));

        response.status(200).json({
            success: true,
            data: formattedCombos
        });

    } catch (error) {
        console.error('Error fetching popular combos:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch popular combos',
            error: error.message
        });
    }
};


/**
 * Get growth metrics for KPI cards (percentage changes).
 * @route GET /api/sales/growth-metrics
 * @query period - 'today', 'week', 'month'
 */
const getGrowthMetrics = async (request, response) => {
    try {
        const { period = 'today' } = request.query;
        const { startDate, endDate } = getDateRangeForPeriod(period);

        // Calculate the previous period dates for comparison
        const periodLength = endDate - startDate;
        const prevStartDate = new Date(startDate.getTime() - periodLength);
        const prevEndDate = new Date(startDate.getTime() - 1);

        // Fetch current period stats
        const currentBills = await Bill.find({
            billingStatus: 'paid',
            paidAt: { $gte: startDate, $lte: endDate }
        });

        // Fetch previous period stats
        const previousBills = await Bill.find({
            billingStatus: 'paid',
            paidAt: { $gte: prevStartDate, $lte: prevEndDate }
        });

        // Calculate current metrics
        const currentRevenue = currentBills.reduce((sum, bill) => sum + bill.total, 0);
        const currentOrders = currentBills.reduce((sum, bill) => sum + bill.orderCount, 0);
        const currentAvgValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;

        // Calculate previous metrics
        const previousRevenue = previousBills.reduce((sum, bill) => sum + bill.total, 0);
        const previousOrders = previousBills.reduce((sum, bill) => sum + bill.orderCount, 0);
        const previousAvgValue = previousOrders > 0 ? previousRevenue / previousOrders : 0;

        // Calculate percentage changes
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
        const ordersGrowth = calculateGrowth(currentOrders, previousOrders);
        const avgValueGrowth = calculateGrowth(currentAvgValue, previousAvgValue);

        // For repeat rate, we need to calculate separately
        const currentCustomerStats = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: startDate, $lte: endDate },
                    customerPhone: { $ne: '', $exists: true }
                }
            },
            {
                $group: {
                    _id: '$customerPhone',
                    visits: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$visits', 1] }, 1, 0] }
                    }
                }
            }
        ]);

        const previousCustomerStats = await Bill.aggregate([
            {
                $match: {
                    billingStatus: 'paid',
                    paidAt: { $gte: prevStartDate, $lte: prevEndDate },
                    customerPhone: { $ne: '', $exists: true }
                }
            },
            {
                $group: {
                    _id: '$customerPhone',
                    visits: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$visits', 1] }, 1, 0] }
                    }
                }
            }
        ]);

        const currentRepeatRate = currentCustomerStats.length > 0 && currentCustomerStats[0].totalCustomers > 0
            ? (currentCustomerStats[0].repeatCustomers / currentCustomerStats[0].totalCustomers) * 100
            : 0;

        const previousRepeatRate = previousCustomerStats.length > 0 && previousCustomerStats[0].totalCustomers > 0
            ? (previousCustomerStats[0].repeatCustomers / previousCustomerStats[0].totalCustomers) * 100
            : 0;

        const repeatRateGrowth = calculateGrowth(currentRepeatRate, previousRepeatRate);

        response.status(200).json({
            success: true,
            data: {
                revenueGrowth,
                ordersGrowth,
                avgValueGrowth,
                repeatRateGrowth
            }
        });

    } catch (error) {
        console.error('Error fetching growth metrics:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch growth metrics',
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
    getRecentSales,
    getRevenueByHour,
    getNewCustomers,
    getPopularCombos,
    getGrowthMetrics
};
