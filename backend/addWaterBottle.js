const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const MenuItem = require('./models/menuModel');

dotenv.config();

const addWaterBottle = async () => {
    try {
        await connectDB();

        const waterBottleName = "Water Bottle";
        const existingItem = await MenuItem.findOne({ productName: waterBottleName });

        if (existingItem) {
            console.log('Water Bottle already exists.');
            if (!existingItem.availability) {
                existingItem.availability = true;
                await existingItem.save();
                console.log('Updated Water Bottle availability to true.');
            }
        } else {
            const newItem = new MenuItem({
                productName: waterBottleName,
                description: "Mineral Water Bottle",
                amount: 20,
                category: "Beverages",
                isVeg: true,
                availability: true,
                imageLink: "/images/water_bottle.png" // Placeholder or actual link if available
            });

            await newItem.save();
            console.log('Water Bottle added successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error adding Water Bottle:', error);
        process.exit(1);
    }
};

addWaterBottle();
