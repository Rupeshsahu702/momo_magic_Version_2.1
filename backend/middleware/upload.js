/**
 * Multer Configuration - Sets up file upload middleware for CSV processing.
 * Uses memory storage to keep files in buffer for immediate processing.
 */

const multer = require('multer');

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();

// File filter to only accept CSV files
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        callback(null, true);
    } else {
        callback(new Error('Only CSV files are allowed'), false);
    }
};

// Configure multer with storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});

module.exports = upload;
