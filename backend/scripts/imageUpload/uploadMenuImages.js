#!/usr/bin/env node

/**
 * Bulk Image Upload Script for Momo Magic Menu Items
 * 
 * USAGE:
 *   node uploadMenuImages.js
 * 
 * SETUP:
 *   1. Place this script in the project root
 *   2. Create 'image-mapping.csv' with format: productName,imageFilename
 *   3. Place all images in 'menu-images/' folder
 *   4. Run: npm install (if dependencies missing)
 *   5. Run: node uploadMenuImages.js
 * 
 * PROCESS:
 *   - Reads image-mapping.csv
 *   - Finds images in menu-images/ folder
 *   - Uploads each image to backend API
 *   - Updates menu item with new image URL
 *   - Logs success/failures
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

const CONFIG = {
    // IMPORTANT: Update this to match your backend URL
    // Local development: 'http://localhost:5000'
    // Production: 'https://your-backend-url.com'
    BACKEND_URL: 'http://localhost:5000',

    // Path to CSV mapping file (relative to script location)
    // Format: productName,imageFilename
    CSV_FILE: './image-mapping.csv',

    // Path to folder containing all menu images
    IMAGES_FOLDER: './menu-images',

    // API endpoints (usually don't need to change these)
    UPLOAD_IMAGE_ENDPOINT: '/api/upload/image',
    UPDATE_MENU_ENDPOINT: '/api/menu',
    GET_MENU_ENDPOINT: '/api/menu',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Read and parse CSV file
 * Returns array of objects: [{ productName, imageFilename }, ...]
 */
function readCSV(filePath) {
    console.log(`📄 Reading CSV file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found: ${filePath}`);
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Skip header row
    const dataLines = lines.slice(1);

    const mappings = dataLines.map((line, index) => {
        const [productName, imageFilename] = line.split(',').map(s => s.trim());

        if (!productName || !imageFilename) {
            console.warn(`⚠️  Line ${index + 2}: Invalid format, skipping`);
            return null;
        }

        return { productName, imageFilename };
    }).filter(Boolean);

    console.log(`✅ Found ${mappings.length} mappings in CSV`);
    return mappings;
}

/**
 * Upload image to backend
 * Returns the uploaded image URL
 */
async function uploadImage(imagePath, filename) {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    try {
        const response = await axios.post(
            `${CONFIG.BACKEND_URL}${CONFIG.UPLOAD_IMAGE_ENDPOINT}`,
            formData,
            {
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        return response.data.imageUrl || response.data.url;
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
}

/**
 * Find menu item by product name
 */
async function findMenuItem(productName) {
    try {
        const response = await axios.get(`${CONFIG.BACKEND_URL}${CONFIG.GET_MENU_ENDPOINT}`);
        const menuItems = response.data;

        // Try exact match first
        let item = menuItems.find(i => i.productName.toLowerCase() === productName.toLowerCase());

        // If not found, try partial match
        if (!item) {
            item = menuItems.find(i =>
                i.productName.toLowerCase().includes(productName.toLowerCase()) ||
                productName.toLowerCase().includes(i.productName.toLowerCase())
            );
        }

        return item;
    } catch (error) {
        throw new Error(`Failed to fetch menu items: ${error.message}`);
    }
}

/**
 * Update menu item with new image URL
 */
async function updateMenuItemImage(itemId, imageUrl) {
    try {
        const response = await axios.put(
            `${CONFIG.BACKEND_URL}${CONFIG.UPDATE_MENU_ENDPOINT}/${itemId}`,
            { imageLink: imageUrl }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Update failed: ${error.message}`);
    }
}

// ============================================================================
// MAIN PROCESS
// ============================================================================

async function processImageUpload(mapping) {
    const { productName, imageFilename } = mapping;
    const imagePath = path.join(CONFIG.IMAGES_FOLDER, imageFilename);

    console.log(`\n🔄 Processing: ${productName} → ${imageFilename}`);

    // Step 1: Check if image file exists
    if (!fs.existsSync(imagePath)) {
        console.error(`  ❌ Image not found: ${imagePath}`);
        return { success: false, error: 'Image file not found' };
    }

    try {
        // Step 2: Find menu item in database
        console.log(`  🔍 Finding menu item: ${productName}`);
        const menuItem = await findMenuItem(productName);

        if (!menuItem) {
            console.error(`  ❌ Menu item not found: ${productName}`);
            return { success: false, error: 'Menu item not found in database' };
        }

        console.log(`  ✅ Found: ${menuItem.productName} (ID: ${menuItem._id})`);

        // Step 3: Upload image
        console.log(`  ⬆️  Uploading image...`);
        const imageUrl = await uploadImage(imagePath, imageFilename);
        console.log(`  ✅ Uploaded: ${imageUrl}`);

        // Step 4: Update menu item
        console.log(`  💾 Updating database...`);
        await updateMenuItemImage(menuItem._id, imageUrl);
        console.log(`  ✅ Updated successfully!`);

        return { success: true, imageUrl, menuItem: menuItem.productName };
    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     Momo Magic - Bulk Image Upload Script               ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Validate configuration
    console.log('📋 Configuration:');
    console.log(`   Backend URL: ${CONFIG.BACKEND_URL}`);
    console.log(`   CSV File: ${CONFIG.CSV_FILE}`);
    console.log(`   Images Folder: ${CONFIG.IMAGES_FOLDER}\n`);

    // Check if images folder exists
    if (!fs.existsSync(CONFIG.IMAGES_FOLDER)) {
        console.error(`❌ Images folder not found: ${CONFIG.IMAGES_FOLDER}`);
        console.log('\n💡 Please create the folder and add your images.');
        process.exit(1);
    }

    try {
        // Read CSV mappings
        const mappings = readCSV(CONFIG.CSV_FILE);

        if (mappings.length === 0) {
            console.log('⚠️  No mappings found in CSV. Nothing to process.');
            process.exit(0);
        }

        // Process each mapping
        console.log(`\n🚀 Starting upload process for ${mappings.length} items...\n`);
        console.log('═'.repeat(60));

        const results = [];
        for (const mapping of mappings) {
            const result = await processImageUpload(mapping);
            results.push({ ...mapping, ...result });

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Summary
        console.log('\n═'.repeat(60));
        console.log('\n📊 SUMMARY\n');

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`✅ Successful: ${successful.length}`);
        console.log(`❌ Failed: ${failed.length}`);
        console.log(`📈 Total: ${results.length}\n`);

        if (successful.length > 0) {
            console.log('✅ Successfully uploaded:');
            successful.forEach(r => console.log(`   • ${r.menuItem || r.productName}`));
            console.log('');
        }

        if (failed.length > 0) {
            console.log('❌ Failed uploads:');
            failed.forEach(r => console.log(`   • ${r.productName}: ${r.error}`));
            console.log('');
        }

        // Save detailed log
        const logFile = `upload-log-${Date.now()}.json`;
        fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
        console.log(`📝 Detailed log saved to: ${logFile}\n`);

    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { uploadImage, findMenuItem, updateMenuItemImage };
