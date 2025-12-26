/**
 * Menu Routes - Defines API endpoints for menu item operations.
 */

const express = require('express');
const router = express.Router();
const {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    exportMenu,
    importMenu,
    getTopRatedItemsByCategory,
    getAvailableCategories
} = require('../controllers/menuController');

// Import/Export routes (must come before /:id to avoid conflict)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/export/csv', exportMenu);
router.post('/import/csv', upload.single('file'), importMenu);

// Top rated items route (must come before /:id to avoid conflict)
router.get('/top-rated/by-category', getTopRatedItemsByCategory);

// Available categories route
router.get('/categories/available', getAvailableCategories);

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Admin routes (TODO: Add authentication middleware)
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;
