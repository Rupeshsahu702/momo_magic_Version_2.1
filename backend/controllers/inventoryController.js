/**
 * Inventory Controller - Handles all CRUD operations for inventory items.
 * Provides endpoints for fetching, creating, updating, and deleting inventory items.
 */

const Inventory = require('../models/inventoryModel');
const { Parser } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private (Admin)
 * @query   category - Filter by category (optional)
 * @query   status - Filter by stock status: in-stock, low-stock, out-of-stock (optional)
 */
const getAllInventoryItems = async (req, res) => {
    try {
        const { category, status } = req.query;

        // Build filter object based on query parameters
        const filter = {};

        if (category && category !== 'all') {
            filter.category = category;
        }

        let inventoryItems = await Inventory.find(filter).sort({ category: 1, name: 1 });

        // Filter by stock status if provided (must be done after fetch due to virtual field)
        if (status && status !== 'all') {
            inventoryItems = inventoryItems.filter(item => item.stockStatus === status);
        }

        res.status(200).json(inventoryItems);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ message: 'Server error while fetching inventory items' });
    }
};

/**
 * @desc    Get inventory statistics
 * @route   GET /api/inventory/stats
 * @access  Private (Admin)
 */
const getInventoryStats = async (req, res) => {
    try {
        const allItems = await Inventory.find({});

        const stats = {
            totalItems: allItems.length,
            lowStockCount: allItems.filter(item => item.stockStatus === 'low-stock').length,
            outOfStockCount: allItems.filter(item => item.stockStatus === 'out-of-stock').length,
            inStockCount: allItems.filter(item => item.stockStatus === 'in-stock').length
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching inventory stats:', error);
        res.status(500).json({ message: 'Server error while fetching inventory stats' });
    }
};

/**
 * @desc    Get single inventory item by ID
 * @route   GET /api/inventory/:id
 * @access  Private (Admin)
 */
const getInventoryItemById = async (req, res) => {
    try {
        const inventoryItem = await Inventory.findById(req.params.id);

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.status(200).json(inventoryItem);
    } catch (error) {
        console.error('Error fetching inventory item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid inventory item ID format' });
        }

        res.status(500).json({ message: 'Server error while fetching inventory item' });
    }
};

/**
 * @desc    Create new inventory item
 * @route   POST /api/inventory
 * @access  Private (Admin)
 */
const createInventoryItem = async (req, res) => {
    try {
        const {
            name,
            category,
            initialQuantity,
            currentQuantity,
            unitOfMeasure,
            threshold,
            supplierName,
            sku,
            description,
            imageUrl
        } = req.body;

        // Validate required fields
        if (!name || initialQuantity === undefined || !category || !unitOfMeasure) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, category, initialQuantity, unitOfMeasure'
            });
        }

        const inventoryItem = await Inventory.create({
            name,
            category,
            initialQuantity,
            currentQuantity: currentQuantity !== undefined ? currentQuantity : initialQuantity,
            unitOfMeasure,
            threshold: threshold || 10,
            supplierName: supplierName || '',
            sku: sku || '',
            description: description || '',
            imageUrl: imageUrl || ''
        });

        res.status(201).json(inventoryItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error while creating inventory item' });
    }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin)
 */
const updateInventoryItem = async (req, res) => {
    try {
        const inventoryItem = await Inventory.findById(req.params.id);

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Update only provided fields
        const updatedInventoryItem = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedInventoryItem);
    } catch (error) {
        console.error('Error updating inventory item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid inventory item ID format' });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error while updating inventory item' });
    }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin)
 */
const deleteInventoryItem = async (req, res) => {
    try {
        const inventoryItem = await Inventory.findById(req.params.id);

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        await Inventory.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Inventory item deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('Error deleting inventory item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid inventory item ID format' });
        }

        res.status(500).json({ message: 'Server error while deleting inventory item' });
    }
};

const exportInventory = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find({}).sort({ category: 1, name: 1 });

        const fields = [
            'name', 'category', 'initialQuantity', 'currentQuantity',
            'unitOfMeasure', 'threshold', 'supplierName',
            'sku', 'description', 'imageUrl'
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(inventoryItems);

        res.header('Content-Type', 'text/csv');
        res.attachment('inventory-items.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Error exporting inventory:', error);
        res.status(500).json({ message: 'Server error while exporting inventory' });
    }
};

/**
 * @desc    Import inventory items from CSV
 * @route   POST /api/inventory/import
 * @access  Private (Admin)
 */
const importInventory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Process each item
                    let count = 0;
                    for (const item of results) {
                        // Basic validation
                        if (item.name && item.category && item.initialQuantity && item.unitOfMeasure) {
                            await Inventory.findOneAndUpdate(
                                { name: item.name },
                                {
                                    ...item,
                                    initialQuantity: Number(item.initialQuantity),
                                    currentQuantity: item.currentQuantity ? Number(item.currentQuantity) : Number(item.initialQuantity),
                                    threshold: Number(item.threshold) || 10
                                },
                                { upsert: true, new: true, setDefaultsOnInsert: true }
                            );
                            count++;
                        }
                    }

                    // Remove the temporary file
                    fs.unlinkSync(req.file.path);

                    res.status(200).json({ message: `Successfully imported/updated ${count} inventory items` });
                } catch (err) {
                    console.error('Error processing CSV:', err);
                    res.status(500).json({ message: 'Error processing CSV file' });
                }
            });
    } catch (error) {
        console.error('Error importing inventory:', error);
        res.status(500).json({ message: 'Server error while importing inventory' });
    }
};

module.exports = {
    getAllInventoryItems,
    getInventoryStats,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    exportInventory,
    importInventory
};
