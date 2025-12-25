/**
 * Upload Controller
 * 
 * Handles file uploads to Cloudflare R2 storage.
 * Processes uploaded images and returns public URLs for database storage.
 */

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, bucketName, publicUrl } = require('../config/r2Client');

/**
 * Upload an image to Cloudflare R2
 * 
 * @route POST /api/upload/image
 * @access Public (adjust as needed based on your auth requirements)
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.file - Uploaded file from multer middleware
 * @param {Buffer} req.file.buffer - File data in memory
 * @param {string} req.file.originalname - Original filename
 * @param {string} req.file.mimetype - File MIME type
 * 
 * @returns {Object} JSON response with imageUrl
 * @throws {400} If no file is uploaded
 * @throws {500} If upload fails
 * 
 * @example
 * // Frontend usage:
 * const formData = new FormData();
 * formData.append('image', fileInput.files[0]);
 * const response = await fetch('/api/upload/image', {
 *   method: 'POST',
 *   body: formData
 * });
 * const { imageUrl } = await response.json();
 */
const uploadImage = async (request, response) => {
    try {
        // Validate file exists
        if (!request.file) {
            return response.status(400).json({
                success: false,
                message: 'No image file provided. Please upload an image.',
            });
        }

        // Generate unique filename using timestamp to prevent conflicts
        const timestamp = Date.now();
        const fileExtension = request.file.originalname.split('.').pop();
        const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

        // Prepare upload parameters for R2
        const uploadParams = {
            Bucket: bucketName,
            Key: uniqueFilename, // Filename in the bucket
            Body: request.file.buffer, // File data from multer memory storage
            ContentType: request.file.mimetype, // Set correct MIME type for proper rendering
        };

        // Upload to Cloudflare R2 using S3-compatible API
        const command = new PutObjectCommand(uploadParams);
        await r2Client.send(command);

        // Construct the public URL for the uploaded image
        const imageUrl = `${publicUrl}/${uniqueFilename}`;

        // Return success response with image URL
        return response.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
        });

    } catch (error) {
        console.error('❌ Image upload error:', error);
        return response.status(500).json({
            success: false,
            message: 'Failed to upload image. Please try again.',
            error: error.message,
        });
    }
};

module.exports = {
    uploadImage,
};
