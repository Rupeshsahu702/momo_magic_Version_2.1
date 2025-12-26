/**
 * Menu Service - Handles all API calls for menu item operations.
 * Provides functions for CRUD operations on menu items.
 */

import api from './api';

/**
 * Fetch all menu items from the database.
 * @param {Object} filters - Optional filters (category, availability, isVeg)
 * @returns {Promise<Array>} Array of menu items
 */
const fetchAllMenuItems = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) {
        params.append('category', filters.category);
    }
    if (filters.availability !== undefined) {
        params.append('availability', filters.availability);
    }
    if (filters.isVeg !== undefined) {
        params.append('isVeg', filters.isVeg);
    }

    const queryString = params.toString();
    const url = queryString ? `/menu?${queryString}` : '/menu';

    const response = await api.get(url);
    // Ensure we always return an array, even if API returns something unexpected
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Fetch only available menu items (for customer view).
 * @returns {Promise<Array>} Array of available menu items
 */
const fetchAvailableMenuItems = async () => {
    return fetchAllMenuItems({ availability: true });
};

/**
 * Fetch a single menu item by ID.
 * @param {string} id - Menu item ID
 * @returns {Promise<Object>} Menu item object
 */
const fetchMenuItemById = async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
};

/**
 * Fetch a menu item by its product name.
 * Used for finding special items like "Water Bottle" for auto-add cart feature.
 * @param {string} productName - Product name to search for
 * @returns {Promise<Object|null>} Menu item object or null if not found
 */
const fetchMenuItemByName = async (productName) => {
    try {
        const allItems = await fetchAllMenuItems();
        return allItems.find(item => item.productName === productName) || null;
    } catch (error) {
        console.error('Error fetching menu item by name:', error);
        return null;
    }
};

/**
 * Create a new menu item.
 * @param {Object} menuItemData - Menu item data
 * @returns {Promise<Object>} Created menu item
 */
const createMenuItem = async (menuItemData) => {
    const response = await api.post('/menu', menuItemData);
    return response.data;
};

/**
 * Update an existing menu item.
 * @param {string} id - Menu item ID
 * @param {Object} menuItemData - Updated menu item data
 * @returns {Promise<Object>} Updated menu item
 */
const updateMenuItem = async (id, menuItemData) => {
    const response = await api.put(`/menu/${id}`, menuItemData);
    return response.data;
};

/**
 * Delete a menu item.
 * @param {string} id - Menu item ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteMenuItem = async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
};

/**
 * Update only the availability status of a menu item.
 * @param {string} id - Menu item ID
 * @param {boolean} availability - New availability status
 * @returns {Promise<Object>} Updated menu item
 */
const updateAvailability = async (id, availability) => {
    return updateMenuItem(id, { availability });
};

/**
 * Export menu items to CSV.
 * @returns {Promise<Blob>} CSV file blob
 */
const exportMenuCSV = async () => {
    const response = await api.get('/menu/export/csv', {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Import menu items from CSV.
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Import result
 */
const importMenuCSV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/menu/import/csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Fetch top rated items grouped by category.
 * @param {number} limit - Number of items per category (default: 5)
 * @returns {Promise<Array>} Array of { category, items[] }
 */
const fetchTopRatedByCategory = async (limit = 5) => {
    const response = await api.get('/menu/top-rated/by-category', {
        params: { limit }
    });
    return response.data;
};

/**
 * Fetch available categories (categories that have at least one menu item).
 * @returns {Promise<Array<string>>} Array of category names
 */
const fetchAvailableCategories = async () => {
    const response = await api.get('/menu/categories/available');
    return response.data;
};

const menuService = {
    fetchAllMenuItems,
    fetchAvailableMenuItems,
    fetchMenuItemById,
    fetchMenuItemByName,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateAvailability,
    exportMenuCSV,
    importMenuCSV,
    fetchTopRatedByCategory,
    fetchAvailableCategories
};

export default menuService;
