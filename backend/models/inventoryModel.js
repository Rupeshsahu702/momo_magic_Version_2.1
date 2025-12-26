/**
 * Inventory Model - Defines the schema for inventory items in the database.
 * Handles stock tracking, supplier information, and low-stock alerts.
 */

const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an item name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Meat', 'Produce', 'Dry Goods', 'Sauce & Spices', 'Packaging', 'Beverages'],
        default: 'Dry Goods'
    },
    initialQuantity: {
        type: Number,
        required: [true, 'Please add initial stock quantity'],
        min: [0, 'Quantity cannot be negative']
    },
    currentQuantity: {
        type: Number,
        min: [0, 'Quantity cannot be negative'],
        default: function () {
            return this.initialQuantity;
        }
    },
    unitOfMeasure: {
        type: String,
        required: [true, 'Please select a unit of measure'],
        enum: ['kg', 'g', 'L', 'mL', 'pcs', 'pks'],
        default: 'kg'
    },
    threshold: {
        type: Number,
        min: [0, 'Threshold cannot be negative'],
        default: 10
    },
    supplierName: {
        type: String,
        trim: true,
        default: ''
    },
    sku: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Virtual field to calculate stock status based on current quantity and threshold
inventorySchema.virtual('stockStatus').get(function () {
    if (this.currentQuantity === 0) {
        return 'out-of-stock';
    } else if (this.currentQuantity <= this.threshold) {
        return 'low-stock';
    }
    return 'in-stock';
});

// Ensure virtuals are included when converting to JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
