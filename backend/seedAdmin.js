/**
 * Seed Script for Admin Credentials
 * Seeds temporary admin login credentials for master@gmail.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/adminModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const seedAdmin = async () => {
    try {
        console.log('Starting admin seed...');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'master@gmail.com' });

        if (existingAdmin) {
            console.log('Admin with email master@gmail.com already exists!');
            console.log('Deleting existing admin to reseed...');
            await Admin.deleteOne({ email: 'master@gmail.com' });
        }

        // Create new admin
        const adminData = {
            name: 'Master Admin',
            email: 'master@gmail.com',
            phoneNumber: '+919999999999',
            password: 'master123',
            position: 'Super Admin'
        };

        const admin = await Admin.create(adminData);

        console.log('✅ Admin seeded successfully!');
        console.log('-----------------------------------');
        console.log('Email:', admin.email);
        console.log('Password: master123');
        console.log('Name:', admin.name);
        console.log('Position:', admin.position);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAdmin();
