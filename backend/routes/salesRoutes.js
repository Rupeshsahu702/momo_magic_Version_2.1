/**
 * Sales Routes - API endpoints for sales analytics.
 * Provides data for the admin Analytics dashboard.
 */

const express = require('express');
const router = express.Router();
const {
    getAggregatedStats,
    getTopSellingItems,
    getLeastSellingItems,
    getPeakOrderHours,
    getRevenueData,
    getRecentSales
} = require('../controllers/salesController');


// ============================================================================
// Analytics Endpoints
// ============================================================================

// Get aggregated KPIs (revenue, orders, avg value, repeat rate)
router.get('/stats', getAggregatedStats);

// Get top 5 most-selling items by quantity
router.get('/top-items', getTopSellingItems);

// Get top 5 least-selling items by quantity
router.get('/least-items', getLeastSellingItems);

// Get hourly order distribution for peak times chart
router.get('/peak-hours', getPeakOrderHours);

// Get daily revenue breakdown for charts
router.get('/revenue', getRevenueData);

// Get recent sales for activity table
router.get('/recent', getRecentSales);


module.exports = router;
