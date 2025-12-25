/**
 * Inventory Routes - Defines API endpoints for inventory item operations.
 */

const express = require('express');
const router = express.Router();
const {
    getAllInventoryItems,
    getInventoryStats,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    exportInventory,
    importInventory
} = require('../controllers/inventoryController');

// Import/Export routes (must come before /:id to avoid conflict)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/export/csv', exportInventory);
router.post('/import/csv', upload.single('file'), importInventory);

// Stats route (must come before /:id to avoid conflict)
router.get('/stats', getInventoryStats);

// CRUD routes
router.get('/', getAllInventoryItems);
router.get('/:id', getInventoryItemById);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
