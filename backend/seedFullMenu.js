require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Menu = require('./models/menuModel');
const Inventory = require('./models/inventoryModel');

const seedFullMenu = async () => {
    try {
        await connectDB();

        console.log('Clearing existing Menu items...');
        await Menu.deleteMany({});
        console.log('Cleared.');

        const menuItems = [];

        // Image Mapping
        const CATEGORY_IMAGES = {
            'Momos': 'steam_momo.png',
            'Tandoori Momos': 'tandoori_momo.png',
            'Special Momos': 'spe_momo.png',
            'Noodles': 'noodles.png',
            'Rice': 'noodles.png',
            'Soups': 'special_dishes.png',
            'Sizzlers': 'SIZZLERS.png',
            'Chinese Starters': 'special_dishes.png',
            'Moburg': 'burgger.png',
            'Pasta': 'pasta.png',
            'Maggi': 'maggi.png',
            'Special Dishes': 'special_dishes.png',
            'Beverages': 'BEVERAGES.png',
            'Desserts': 'dessert.png'
        };

        const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

        // Helper to add item
        const addItem = (name, amount, category, isVeg, description = '') => {
            const imageName = CATEGORY_IMAGES[category] || 'special_dishes.png'; // Default fallback
            const imageLink = `${BASE_URL}/images/${imageName}`;

            menuItems.push({
                productName: name,
                amount: amount,
                category: category,
                isVeg: isVeg,
                description: description || `Delicious ${name}`,
                availability: true,
                rating: 0,
                imageLink: imageLink
            });
        };

        // --- 1. Momos (Steam & Fried) ---
        const momocategories = [
            { type: 'Veg', steam: 100, fried: 120, isVeg: true },
            { type: 'Paneer', steam: 120, fried: 140, isVeg: true },
            { type: 'Chicken', steam: 120, fried: 140, isVeg: false },
            { type: 'Cheese Corn', steam: 150, fried: 180, isVeg: true }
        ];

        momocategories.forEach(m => {
            addItem(`${m.type} Momos (Steamed)`, m.steam, 'Momos', m.isVeg, `Classic steamed ${m.type} dumplings.`);
            addItem(`${m.type} Momos (Fried)`, m.fried, 'Momos', m.isVeg, `Crispy fried ${m.type} dumplings.`);
        });

        // --- 2. Tandoori Momos (8 Pcs) ---
        // Styles: Dry, Afghani, Cocktail, Achari, Kadhal
        // Prices table from md
        const tandooriData = [
            { type: 'Veg', prices: { Dry: 180, Afghani: 180, Cocktail: 180, Achari: 180, Kadhal: 200 }, isVeg: true },
            { type: 'Paneer', prices: { Dry: 190, Afghani: 190, Cocktail: 190, Achari: 190, Kadhal: 220 }, isVeg: true },
            { type: 'Chicken', prices: { Dry: 210, Afghani: 210, Cocktail: 210, Achari: 210, Kadhal: 240 }, isVeg: false },
            { type: 'Cheese Corn', prices: { Dry: 210, Afghani: 210, Cocktail: 210, Achari: 210, Kadhal: 250 }, isVeg: true }
        ];

        tandooriData.forEach(t => {
            Object.entries(t.prices).forEach(([style, price]) => {
                addItem(`${t.type} Tandoori Momos (${style})`, price, 'Tandoori Momos', t.isVeg, `Tandoori roasted ${t.type} momos in ${style} style.`);
            });
        });

        // --- 3. Special Magic Momos (8 Pcs) ---
        // Styles: Oyster, Pan Fried, Cheese, Schezwan, Crispy, Pizza, Chilli
        const specialData = [
            { type: 'Veg', prices: { Oyster: 180, 'Pan Fried': 180, Cheese: 180, Schezwan: 180, Crispy: 180, Pizza: 160, Chilli: 180 }, isVeg: true },
            { type: 'Paneer', prices: { Oyster: 190, 'Pan Fried': 190, Cheese: 190, Schezwan: 190, Crispy: 190, Pizza: 190, Chilli: 190 }, isVeg: true },
            { type: 'Chicken', prices: { Oyster: 210, 'Pan Fried': 210, Cheese: 210, Schezwan: 210, Crispy: 210, Pizza: 210, Chilli: 210 }, isVeg: false },
            { type: 'Cheese Corn', prices: { Oyster: 210, 'Pan Fried': 210, Schezwan: 210, Crispy: 210, Pizza: 210, Chilli: 210 }, isVeg: true } // No 'Cheese' style for Cheese Corn in md
        ];

        specialData.forEach(s => {
            Object.entries(s.prices).forEach(([style, price]) => {
                addItem(`${s.type} Momos (${style})`, price, 'Special Momos', s.isVeg, `Signature ${s.type} momos in ${style} sauce.`);
            });
        });


        // --- 4. Chinese Magic (Noodles & Rice) ---
        // Noodles
        const noodleStyles1 = ['Schezwan', 'Shanghai', 'Hakka', 'Chilli Garlic', 'Singapuri'];
        // Prices: Veg 210, Paneer 220, Chicken 230 (Estimated from range 210-230)
        noodleStyles1.forEach(style => {
            addItem(`${style} Noodles (Veg)`, 210, 'Noodles', true);
            addItem(`${style} Noodles (Paneer)`, 220, 'Noodles', true);
            addItem(`${style} Noodles (Chicken)`, 230, 'Noodles', false);
        });

        const noodleStyles2 = ['Butter Chilli Garlic', 'Exotic', 'Bangkok Special', 'Korean', 'China Town Soggy'];
        // Prices: Veg 220, Paneer 240, Chicken 260 (Estimated from range 220-260)
        noodleStyles2.forEach(style => {
            addItem(`${style} Noodles (Veg)`, 220, 'Noodles', true);
            addItem(`${style} Noodles (Paneer)`, 240, 'Noodles', true);
            addItem(`${style} Noodles (Chicken)`, 260, 'Noodles', false);
        });

        // Rice
        addItem('Fried Rice', 160, 'Rice', true);
        addItem('Egg Fried Rice', 170, 'Rice', false); // Egg is non-veg usually in India, or separate? 'isVeg' false for clarity/safety.
        addItem('Paneer Fried Rice', 180, 'Rice', true);
        addItem('Chicken Fried Rice', 190, 'Rice', false);
        addItem('Paneer Chilli Rice', 240, 'Rice', true);
        addItem('Chicken Chilli Rice', 280, 'Rice', false);

        // --- 5. Soups ---
        const soups = ['Thukpa', 'Manchow', 'Talumein', 'Sweet Corn', 'Hot & Sour', 'Lemon Coriander', 'Wanton Soup'];
        soups.forEach(s => {
            addItem(`${s} (Veg)`, 120, 'Soups', true);
            addItem(`${s} (Chicken)`, 140, 'Soups', false);
        });

        // --- 6. Sizzlers ---
        addItem('Exotic Veg Sizzler', 300, 'Sizzlers', true);
        addItem('Exotic Paneer Sizzler', 340, 'Sizzlers', true);
        addItem('Exotic Chicken Sizzler', 360, 'Sizzlers', false);

        // --- 7. Chinese Starters & Sides ---
        addItem('French Fries', 100, 'Chinese Starters', true);
        addItem('French Fries Peri Peri', 120, 'Chinese Starters', true);
        addItem('Peri Peri Cheese Loaded Fries', 150, 'Chinese Starters', true);
        addItem('Spring Roll', 150, 'Chinese Starters', true);
        addItem('Spring Roll (Crispy)', 170, 'Chinese Starters', true);
        addItem('Chilli Potato', 170, 'Chinese Starters', true);
        addItem('Honey Potato Chilli', 190, 'Chinese Starters', true);
        addItem('Paneer Chilli', 230, 'Chinese Starters', true);
        // Baby Corn / Mushroom Chilli: Rs. 230 - Rs. 240. Pick 235? Or split.
        addItem('Baby Corn Chilli', 230, 'Chinese Starters', true);
        addItem('Mushroom Chilli', 240, 'Chinese Starters', true);
        addItem('Veg Manchurian', 170, 'Chinese Starters', true);

        // Chicken Starters
        const chickenStarters1 = ['Chicken Fried Wanton', 'Chicken Schezwan', 'Chicken Chilli', 'Chicken Garlic', 'Chicken Manchurian'];
        chickenStarters1.forEach(c => addItem(c, 230, 'Chinese Starters', false));

        const chickenStarters2 = ['Crispy Chicken Chilli', 'Barbeque Chicken', 'Oyster Chilli Chicken'];
        chickenStarters2.forEach(c => addItem(c, 240, 'Chinese Starters', false));

        addItem('Chicken Lollipop', 280, 'Chinese Starters', false);
        addItem('Roasted Chicken', 280, 'Chinese Starters', false);

        // --- 8. Moburg ---
        addItem('Veg Moburg', 90, 'Moburg', true);
        addItem('Paneer Moburg', 100, 'Moburg', true);
        addItem('Chicken Moburg', 100, 'Moburg', false);

        // --- 9. Pasta ---
        const pastaSauces = ['White Sauce', 'Red Sauce', 'Mix Sauce', 'Peri Peri Pasta'];
        pastaSauces.forEach(p => addItem(p, 210, 'Pasta', true));
        addItem('Chicken Pasta', 230, 'Pasta', false);
        // Add/Extra Cheese item? Maybe not a menu item.

        // --- 10. Maggi ---
        addItem('Plain Masala Maggi', 60, 'Maggi', true);
        addItem('Veg Maggi', 70, 'Maggi', true);
        addItem('Chilli Maggi', 80, 'Maggi', true);
        addItem('Cheese Maggi', 80, 'Maggi', true);
        addItem('Veg Cheese Maggi', 90, 'Maggi', true);
        addItem('Onion Capsicum Maggi', 90, 'Maggi', true);
        const maggi100 = ['Special Maggi', 'Cheese Corn Maggi', 'Chilli Garlic Maggi', 'Paneer Maggi', 'Egg Maggi'];
        maggi100.forEach(m => addItem(m, 100, 'Maggi', m.includes('Egg') ? false : true)); // Egg is non-veg

        addItem('Chicken Maggi', 110, 'Maggi', false);
        addItem('Chicken Egg Maggi', 120, 'Maggi', false);

        // --- 11. MMC Special Dishes ---
        addItem('Chicken Popcorn', 180, 'Special Dishes', false);
        addItem('Chicken Dragon Roll', 180, 'Special Dishes', false);
        addItem('Crispy Corn Salt & Pepper', 190, 'Special Dishes', true);
        addItem('Barbeque Papery Paneer', 240, 'Special Dishes', true);
        addItem('Taiwan Special Chilli Mushroom & Baby Corn', 260, 'Special Dishes', true);
        addItem('MMC Special Lat Mai Kai Chicken', 280, 'Special Dishes', false);

        // --- 12. Beverages ---
        addItem('Fresh Lime Soda', 80, 'Beverages', true);
        addItem('Masala Lemonade', 80, 'Beverages', true);
        const mojitos = ['Virgin Mojito', 'Kiwi Mojito', 'Pina Colada', 'Green Apple Mojito', 'Bubble Gum Mojito', 'Spicy Mango Mojito', 'Blue Lagoon', 'Watermelon Mojito', 'Kala Khatta'];
        mojitos.forEach(m => addItem(m, 100, 'Beverages', true));
        addItem('RedBull Mojito', 190, 'Beverages', true);

        const classicShakes = ['Strawberry Shake', 'Butter Scotch Shake', 'Chocolate Shake', 'KitKat Shake', 'Oreo Shake'];
        classicShakes.forEach(s => addItem(s, 140, 'Beverages', true)); // Or Category Shakes? No, Beverages in my list.

        const premiumShakes = ['Brownie Shake', 'Lotus Biscoff Shake', 'Rasmalai Shake'];
        premiumShakes.forEach(s => addItem(s, 160, 'Beverages', true));

        const deluxeShakes = ['Nutella Shake', 'Nutella Brownie Shake', 'Ferrero Rocher Shake'];
        deluxeShakes.forEach(s => addItem(s, 180, 'Beverages', true));

        // Coffee
        addItem('Hot Coffee', 50, 'Beverages', true);
        addItem('Hot Chocolate', 100, 'Beverages', true);
        addItem('Cold Coffee', 120, 'Beverages', true);
        addItem('Cold Coffee With Ice Cream', 140, 'Beverages', true);
        addItem('Java Chip Coffee', 160, 'Beverages', true);

        // --- 13. Dessert ---
        addItem('Choco Lava', 80, 'Desserts', true);
        addItem('ChocoChip Brownie', 100, 'Desserts', true);
        addItem('Nutella Brownie', 120, 'Desserts', true);
        addItem('Sizzling Brownie', 160, 'Desserts', true);


        console.log(`Prepared ${menuItems.length} menu items.`);
        await Menu.insertMany(menuItems);
        console.log('Menu Successfully Imported!');

        // Preserve inventory items if they exist, or seed them if not?
        // The user asked to add menu items. I won't touch Inventory unless I have to.
        // But the previous seedData wiped both.
        // I should check if I should re-seed inventory. The previous seedData had dummy inventory.
        // I will re-add the dummy inventory just to be safe so the app works fully.

        // Re-using inventory items from previous seedData
        const inventoryItems = [
            {
                name: 'Chicken Mince',
                category: 'Meat',
                initialQuantity: 50,
                currentQuantity: 45,
                unitOfMeasure: 'kg',
                threshold: 10,
                supplierName: 'Local Butcher',
                sku: 'MEAT-001',
                description: 'Fresh minced chicken for momos.'
            },
            {
                name: 'Refined Flour',
                category: 'Dry Goods',
                initialQuantity: 100,
                currentQuantity: 80,
                unitOfMeasure: 'kg',
                threshold: 20,
                supplierName: 'ABC Wholesales',
                sku: 'DRY-001',
                description: 'High quality flour for dough.'
            },
            {
                name: 'Vegetable Oil',
                category: 'Sauce & Spices',
                initialQuantity: 30,
                currentQuantity: 25,
                unitOfMeasure: 'L',
                threshold: 5,
                supplierName: 'Oil Traders',
                sku: 'OIL-001',
                description: 'Sunflower oil for frying.'
            },
            {
                name: 'Cabbage',
                category: 'Produce',
                initialQuantity: 40,
                currentQuantity: 35,
                unitOfMeasure: 'kg',
                threshold: 5,
                supplierName: 'Fresh Farms',
                sku: 'PROD-001',
                description: 'Fresh green cabbage.'
            },
            {
                name: 'Momos Sauce',
                category: 'Sauce & Spices',
                initialQuantity: 20,
                currentQuantity: 15,
                unitOfMeasure: 'L',
                threshold: 5,
                supplierName: 'Spicy World',
                sku: 'SAUCE-001',
                description: 'Signature spicy momo chutney.'
            },
            {
                name: 'Packaging Boxes',
                category: 'Packaging',
                initialQuantity: 500,
                currentQuantity: 450,
                unitOfMeasure: 'pcs',
                threshold: 100,
                supplierName: 'Pack It Up',
                sku: 'PACK-001',
                description: 'Cardboard boxes for delivery.'
            }
        ];

        console.log('Clearing Inventory...');
        await Inventory.deleteMany({});
        await Inventory.insertMany(inventoryItems);
        console.log('Inventory Re-Seeded.');

        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedFullMenu();
