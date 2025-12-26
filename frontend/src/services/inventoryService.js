/**
 * Inventory Service - Handles all API calls for inventory item operations.
 * Provides functions for CRUD operations on inventory items.
 */

import api from './api';

/**
 * Fetch all inventory items from the database.
 * @param {Object} filters - Optional filters (category, status)
 * @returns {Promise<Array>} Array of inventory items
 */
const fetchAllInventoryItems = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
    }
    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = queryString ? `/inventory?${queryString}` : '/inventory';

    const response = await api.get(url);
    // Ensure we always return an array, even if API returns something unexpected
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Fetch inventory statistics for dashboard.
 * @returns {Promise<Object>} Stats object with counts
 */
const fetchInventoryStats = async () => {
    const response = await api.get('/inventory/stats');
    return response.data;
};

/**
 * Fetch a single inventory item by ID.
 * @param {string} id - Inventory item ID
 * @returns {Promise<Object>} Inventory item object
 */
const fetchInventoryItemById = async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
};

/**
 * Create a new inventory item.
 * @param {Object} inventoryData - Inventory item data
 * @returns {Promise<Object>} Created inventory item
 */
const createInventoryItem = async (inventoryData) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
};

/**
 * Update an existing inventory item.
 * @param {string} id - Inventory item ID
 * @param {Object} inventoryData - Updated inventory item data
 * @returns {Promise<Object>} Updated inventory item
 */
const updateInventoryItem = async (id, inventoryData) => {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
};

/**
 * Delete an inventory item.
 * @param {string} id - Inventory item ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteInventoryItem = async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
};

/**
 * Update only the current quantity of an inventory item.
 * @param {string} id - Inventory item ID
 * @param {number} currentQuantity - New current quantity
 * @returns {Promise<Object>} Updated inventory item
 */
const updateQuantity = async (id, currentQuantity) => {
    return updateInventoryItem(id, { currentQuantity });
};

/**
 * Export inventory items to CSV.
 * @returns {Promise<Blob>} CSV file blob
 */
const exportInventoryCSV = async () => {
    const response = await api.get('/inventory/export/csv', {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Import inventory items from CSV.
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Import result
 */
const importInventoryCSV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/inventory/import/csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const inventoryService = {
    fetchAllInventoryItems,
    fetchInventoryStats,
    fetchInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateQuantity,
    exportInventoryCSV,
    importInventoryCSV
};

export default inventoryService;
