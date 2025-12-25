/**
 * Menu Controller - Handles all CRUD operations for menu items.
 * Provides endpoints for fetching, creating, updating, and deleting menu items.
 */

const MenuItem = require('../models/menuModel');
const { Parser } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * @desc    Get all menu items
 * @route   GET /api/menu
 * @access  Public
 * @query   category - Filter by category (optional)
 * @query   availability - Filter by availability (optional)
 * @query   isVeg - Filter by veg/non-veg (optional)
 */
const getAllMenuItems = async (req, res) => {
    try {
        const { category, availability, isVeg } = req.query;

        // Build filter object based on query parameters
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (availability !== undefined) {
            filter.availability = availability === 'true';
        }

        if (isVeg !== undefined) {
            filter.isVeg = isVeg === 'true';
        }

        const menuItems = await MenuItem.find(filter).sort({ category: 1, productName: 1 });

        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Server error while fetching menu items' });
    }
};

/**
 * @desc    Get single menu item by ID
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json(menuItem);
    } catch (error) {
        console.error('Error fetching menu item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid menu item ID format' });
        }

        res.status(500).json({ message: 'Server error while fetching menu item' });
    }
};

/**
 * @desc    Create new menu item
 * @route   POST /api/menu
 * @access  Private (Admin)
 */
const createMenuItem = async (req, res) => {
    try {
        const { productName, description, amount, category, rating, isVeg, imageLink, availability } = req.body;

        // Validate required fields
        if (!productName || amount === undefined || !category || isVeg === undefined) {
            return res.status(400).json({
                message: 'Please provide all required fields: productName, amount, category, isVeg'
            });
        }

        const menuItem = await MenuItem.create({
            productName,
            description: description || '',
            amount,
            category,
            rating: rating || 0,
            isVeg,
            imageLink: imageLink || '',
            availability: availability !== undefined ? availability : true
        });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Error creating menu item:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error while creating menu item' });
    }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private (Admin)
 */
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Update only provided fields
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedMenuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid menu item ID format' });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error while updating menu item' });
    }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (Admin)
 */
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Menu item deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('Error deleting menu item:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid menu item ID format' });
        }

        res.status(500).json({ message: 'Server error while deleting menu item' });
    }
};

const exportMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({}).sort({ category: 1, productName: 1 });

        const fields = ['productName', 'description', 'amount', 'category', 'rating', 'isVeg', 'availability', 'imageLink'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(menuItems);

        res.header('Content-Type', 'text/csv');
        res.attachment('menu-items.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Error exporting menu:', error);
        res.status(500).json({ message: 'Server error while exporting menu' });
    }
};

/**
 * @desc    Import menu items from CSV
 * @route   POST /api/menu/import
 * @access  Private (Admin)
 */
const importMenu = async (req, res) => {
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
                        if (item.productName && item.amount && item.category) {
                            // Normalize boolean fields
                            const isVeg = item.isVeg === 'true' || item.isVeg === 'TRUE' || item.isVeg === true;
                            const availability = item.availability === 'true' || item.availability === 'TRUE' || item.availability === true;

                            await MenuItem.findOneAndUpdate(
                                { productName: item.productName },
                                {
                                    ...item,
                                    amount: Number(item.amount),
                                    rating: Number(item.rating) || 0,
                                    isVeg,
                                    availability
                                },
                                { upsert: true, new: true, setDefaultsOnInsert: true }
                            );
                            count++;
                        }
                    }

                    // Remove the temporary file
                    fs.unlinkSync(req.file.path);

                    res.status(200).json({ message: `Successfully imported/updated ${count} menu items` });
                } catch (err) {
                    console.error('Error processing CSV:', err);
                    res.status(500).json({ message: 'Error processing CSV file' });
                }
            });
    } catch (error) {
        console.error('Error importing menu:', error);
        res.status(500).json({ message: 'Server error while importing menu' });
    }
};

/**
 * @desc    Get top rated items grouped by category
 * @route   GET /api/menu/top-rated/by-category
 * @access  Public
 * @query   limit - Number of items per category (default: 5)
 */
const getTopRatedItemsByCategory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        // Get all available menu items
        const menuItems = await MenuItem.find({ availability: true });

        // Group items by category
        const categorizedItems = {};
        menuItems.forEach(item => {
            if (!categorizedItems[item.category]) {
                categorizedItems[item.category] = [];
            }
            categorizedItems[item.category].push(item);
        });

        // Sort each category by rating (descending) and take top N items
        const topRatedByCategory = Object.keys(categorizedItems).map(category => {
            const sortedItems = categorizedItems[category]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, limit);

            return {
                category,
                items: sortedItems
            };
        });

        // Filter out categories with no items
        const result = topRatedByCategory.filter(cat => cat.items.length > 0);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching top rated items by category:', error);
        res.status(500).json({ message: 'Server error while fetching top rated items' });
    }
};

/**
 * @desc    Get available categories (categories that have at least one menu item)
 * @route   GET /api/menu/categories/available
 * @access  Public
 */
const getAvailableCategories = async (req, res) => {
    try {
        // Get distinct categories from menu items
        const categories = await MenuItem.distinct('category', { availability: true });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching available categories:', error);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
};

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    exportMenu,
    importMenu,
    getTopRatedItemsByCategory,
    getAvailableCategories
};
