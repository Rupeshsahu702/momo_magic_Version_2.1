/**
 * Upload Service
 * 
 * Handles file uploads to Cloudflare R2 storage via backend API.
 * Provides methods for uploading images and retrieving public URLs.
 */

import api from './api';

/**
 * Upload an image file to Cloudflare R2
 * 
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} The public URL of the uploaded image
 * @throws {Error} If upload fails or file is invalid
 * 
 * @example
 * const file = document.querySelector('input[type="file"]').files[0];
 * const imageUrl = await uploadImage(file);
 * console.log('Image uploaded:', imageUrl);
 */
const uploadImage = async (imageFile) => {
    // Validate file exists
    if (!imageFile) {
        throw new Error('No image file provided');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    // Validate file size (5MB limit)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSizeInBytes) {
        throw new Error('File size exceeds 5MB limit. Please choose a smaller image.');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        // Upload to backend
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Extract and return the image URL
        const { imageUrl } = response.data;

        if (!imageUrl) {
            throw new Error('Server did not return an image URL');
        }

        return imageUrl;
    } catch (error) {
        console.error('Image upload error:', error);

        // Provide user-friendly error messages
        if (error.response) {
            // Server responded with error
            const errorMessage = error.response.data?.message || 'Upload failed';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request made but no response
            throw new Error('Upload failed: No response from server. Please check your connection.');
        } else {
            // Error in request setup or validation
            throw new Error(error.message || 'Upload failed: Unknown error');
        }
    }
};

export default {
    uploadImage,
};
