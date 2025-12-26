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
    getRecentSales,
    getRevenueByHour,
    getNewCustomers,
    getPopularCombos,
    getGrowthMetrics
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

// Get hourly revenue breakdown
router.get('/revenue-by-hour', getRevenueByHour);

// Get new customers data
router.get('/new-customers', getNewCustomers);

// Get popular food combos
router.get('/popular-combos', getPopularCombos);

// Get growth metrics for KPI cards
router.get('/growth-metrics', getGrowthMetrics);


module.exports = router;
