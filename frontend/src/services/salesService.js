/**
 * Sales Service - Handles all API calls for sales analytics.
 * Provides functions for fetching dashboard KPIs, top items, and charts.
 */

import api from './api';


/**
 * Fetch aggregated stats for the dashboard cards.
 * @param {string} period - 'today', 'week', or 'month'
 * @returns {Promise<Object>} Stats including totalRevenue, totalOrders, avgOrderValue, customerRepeatRate
 */
const fetchStats = async (period = 'today') => {
    const response = await api.get('/sales/stats', { params: { period } });
    return response.data;
};


/**
 * Fetch top selling items for the specified period.
 * @param {string} period - 'today', 'week', or 'month'
 * @param {number} limit - Number of items to return (default: 5)
 * @returns {Promise<Array>} Array of { name, quantity, revenue }
 */
const fetchTopSellingItems = async (period = 'today', limit = 5) => {
    const response = await api.get('/sales/top-items', { params: { period, limit } });
    return response.data;
};


/**
 * Fetch least selling items for the specified period.
 * @param {string} period - 'today', 'week', or 'month'
 * @param {number} limit - Number of items to return (default: 5)
 * @returns {Promise<Array>} Array of { name, quantity }
 */
const fetchLeastSellingItems = async (period = 'today', limit = 5) => {
    const response = await api.get('/sales/least-items', { params: { period, limit } });
    return response.data;
};


/**
 * Fetch peak order hours for analytics chart.
 * @param {string} period - 'today', 'week', or 'month'
 * @returns {Promise<Array>} Array of { hour, orderCount } (24 entries, 0-23)
 */
const fetchPeakOrderHours = async (period = 'today') => {
    const response = await api.get('/sales/peak-hours', { params: { period } });
    return response.data;
};


/**
 * Fetch daily revenue data for charts.
 * @param {string} period - 'week' or 'month'
 * @returns {Promise<Array>} Array of { date, revenue, orders }
 */
const fetchRevenueData = async (period = 'week') => {
    const response = await api.get('/sales/revenue', { params: { period } });
    return response.data;
};


/**
 * Fetch recent sales for activity table.
 * @param {number} limit - Number of records to return (default: 10)
 * @returns {Promise<Array>} Array of recent sale records
 */
const fetchRecentSales = async (limit = 10) => {
    const response = await api.get('/sales/recent', { params: { limit } });
    return response.data;
};


const salesService = {
    fetchStats,
    fetchTopSellingItems,
    fetchLeastSellingItems,
    fetchPeakOrderHours,
    fetchRevenueData,
    fetchRecentSales
};

export default salesService;
