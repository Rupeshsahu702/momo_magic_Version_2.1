/**
 * Fast2SMS Service - Handles OTP sending via Fast2SMS API.
 * Provides a clean interface for sending SMS OTPs with error handling and logging.
 */

const axios = require('axios');

const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Generate a random 6-digit OTP.
 * @returns {string} A 6-digit OTP string
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Fast2SMS API.
 * 
 * @param {string} phoneNumber - The recipient's phone number (10 digits)
 * @param {string} otp - The OTP to send
 * @returns {Object} API response with success status and message
 * @throws {Error} If API call fails
 * 
 * @example
 * const result = await sendOTP('9876543210', '123456');
 * // result: { success: true, message: 'OTP sent successfully', data: {...} }
 */
const sendOTP = async (phoneNumber, otp) => {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
        throw new Error('FAST2SMS_API_KEY is not configured in environment variables');
    }

    // Validate phone number format (10 digits for Indian numbers)
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length !== 10) {
        throw new Error('Invalid phone number format. Please provide a 10-digit phone number.');
    }

    try {
        const response = await axios.get(FAST2SMS_API_URL, {
            params: {
                authorization: apiKey,
                route: 'otp',
                variables_values: otp,
                flash: 0,
                numbers: cleanedNumber
            },
            headers: {
                'cache-control': 'no-cache'
            }
        });

        // Fast2SMS returns return: true on success
        if (response.data && response.data.return === true) {
            return {
                success: true,
                message: 'OTP sent successfully',
                requestId: response.data.request_id,
                data: response.data
            };
        } else {
            // API returned but with an error
            return {
                success: false,
                message: response.data?.message || 'Failed to send OTP',
                data: response.data
            };
        }
    } catch (error) {
        console.error('Fast2SMS API Error:', error.response?.data || error.message);

        // Handle specific error cases
        if (error.response?.status === 401) {
            throw new Error('Invalid Fast2SMS API key. Please check your credentials.');
        }

        if (error.response?.status === 403) {
            throw new Error('Fast2SMS API access forbidden. Ensure your account is activated with minimum balance.');
        }

        throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Send OTP with retry logic for reliability.
 * 
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} otp - The OTP to send
 * @param {number} maxRetries - Maximum retry attempts (default: 2)
 * @returns {Object} API response
 */
const sendOTPWithRetry = async (phoneNumber, otp, maxRetries = 2) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendOTP(phoneNumber, otp);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`OTP send attempt ${attempt} failed:`, error.message);

            // Don't retry on authentication errors
            if (error.message.includes('API key') || error.message.includes('forbidden')) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError;
};

module.exports = {
    generateOTP,
    sendOTP,
    sendOTPWithRetry
};
