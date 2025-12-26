/**
 * Upload Routes
 * 
 * Defines routes for file upload operations.
 * Configures multer middleware for handling multipart/form-data.
 */

const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for memory storage (file stored in buffer, not disk)
// This is efficient for direct upload to cloud storage
const storage = multer.memoryStorage();

// File filter to accept only image types
const fileFilter = (request, file, callback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        // Accept the file
        callback(null, true);
    } else {
        // Reject the file
        callback(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// Configure multer middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
});

// POST /api/upload/image - Upload a single image
// The 'image' parameter must match the field name used in the frontend FormData
router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
