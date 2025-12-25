/**
 * Menu Item Model - Defines the schema for menu items in the database.
 * Handles product information, pricing, categorization, and availability.
 */

const mongoose = require('mongoose');


// Rating constraints: Uses a 5-star system common in restaurant apps
const MINIMUM_RATING = 0;
const MAXIMUM_RATING = 5;

// These categories match the physical menu sections at the restaurant
const MENU_CATEGORIES = [
    'Momos',
    'Tandoori Momos',
    'Special Momos',
    'Noodles',
    'Rice',
    'Soups',
    'Sizzlers',
    'Chinese Starters',
    'Moburg',
    'Pasta',
    'Maggi',
    'Special Dishes',
    'Beverages',
    'Desserts'
];


const menuItemSchema = mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },

    description: {
        type: String,
        trim: true,
        default: ''
    },

    amount: {
        type: Number,
        required: [true, 'Please add a price amount'],
        min: [0, 'Amount cannot be negative']
    },

    // Category must match one of our physical menu sections
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: MENU_CATEGORIES,
        default: 'Steamed'
    },

    // Customer ratings are aggregated; new items start at 0 until they receive reviews
    rating: {
        type: Number,
        default: MINIMUM_RATING,
        min: MINIMUM_RATING,
        max: MAXIMUM_RATING
    },

    // Required for dietary filtering in the customer menu
    isVeg: {
        type: Boolean,
        required: [true, 'Please specify if item is vegetarian'],
        default: false
    },

    imageLink: {
        type: String,
        default: ''
    },

    // Optional add-ons for item customization (e.g., "Extra Cheese" - ₹50)
    // Empty array means no customizations available for this item
    customizationOptions: {
        type: [{
            name: { type: String, required: true, trim: true },
            price: { type: Number, required: true, min: 0 }
        }],
        default: []
    },

    // Mark high-volume items to display "Recommended" badge on customer menu
    isRecommended: {
        type: Boolean,
        default: false
    },

    // Set to false when item is out of stock; shows as "unavailable" on customer menu
    availability: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('MenuItem', menuItemSchema);
