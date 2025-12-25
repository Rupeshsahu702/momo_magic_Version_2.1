/**
 * 2Factor.in Service - Handles OTP sending and verification via 2Factor.in API.
 * Provides a clean interface for customer authentication via phone-based OTP.
 * 
 * API Documentation: https://documenter.getpostman.com/view/301893/TWDamFGh
 */

const axios = require('axios');

const TWO_FACTOR_API_URL = 'https://2factor.in/API/V1';
const OTP_LENGTH = 4; // 4-digit OTP as per requirements

/**
 * Generate a random 4-digit OTP.
 * @returns {string} A 4-digit OTP string
 */
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Send OTP via 2Factor.in API for customer verification.
 * 
 * @param {string} phoneNumber - The recipient's phone number (10 digits without country code)
 * @param {string} otp - The OTP to send
 * @returns {Object} API response with success status and session ID
 * @throws {Error} If API call fails
 * 
 * @example
 * const result = await sendOTP('9876543210', '1234');
 * // result: { success: true, sessionId: 'abc123', message: 'OTP sent successfully' }
 */
const sendOTP = async (phoneNumber, otp) => {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const senderId = process.env.TWO_FACTOR_SENDER_ID || 'MOMOMA'; // Default sender ID for Momo Magic

    if (!apiKey) {
        throw new Error('TWO_FACTOR_API_KEY is not configured in environment variables');
    }

    // Validate phone number format (10 digits for Indian numbers)
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length !== 10) {
        throw new Error('Invalid phone number format. Please provide a 10-digit phone number.');
    }

    try {
        const url = `${TWO_FACTOR_API_URL}/${apiKey}/SMS/${cleanedNumber}/${otp}/AUTOTRIGGER`;
        
        console.log(`Sending OTP to ${cleanedNumber} via 2Factor.in API`);

        const response = await axios.get(url, {
            timeout: 10000
        });

        // 2Factor.in returns status in response.data.Status
        if (response.data && response.data.Status === 'Success') {
            return {
                success: true,
                sessionId: response.data.Details || null,
                message: 'OTP sent successfully',
                data: response.data
            };
        } else {
            throw new Error(response.data?.Reason || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error sending OTP via 2Factor.in:', error.message);
        
        // Provide specific error messages
        if (error.code === 'ECONNABORTED') {
            throw new Error('OTP service timeout. Please try again.');
        }
        if (error.response?.status === 401) {
            throw new Error('OTP service authentication failed. Please check API key.');
        }
        
        throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
};

/**
 * Verify OTP using 2Factor.in API.
 * 
 * @param {string} phoneNumber - The phone number to verify
 * @param {string} sessionId - The session ID from sendOTP
 * @param {string} otp - The OTP entered by the user
 * @returns {Object} Verification result with success status
 * @throws {Error} If verification fails
 * 
 * @example
 * const result = await verifyOTP('9876543210', 'sessionId', '1234');
 * // result: { success: true, message: 'OTP verified successfully' }
 */
const verifyOTP = async (phoneNumber, sessionId, otp) => {
    const apiKey = process.env.TWO_FACTOR_API_KEY;

    if (!apiKey) {
        throw new Error('TWO_FACTOR_API_KEY is not configured in environment variables');
    }

    // Validate phone number format
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length !== 10) {
        throw new Error('Invalid phone number format. Please provide a 10-digit phone number.');
    }

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otp)) {
        throw new Error('Invalid OTP format. OTP must be 4 digits.');
    }

    try {
        const url = `${TWO_FACTOR_API_URL}/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;
        
        console.log(`Verifying OTP for ${cleanedNumber}`);

        const response = await axios.get(url, {
            timeout: 10000
        });

        // 2Factor.in returns status in response.data.Status
        if (response.data && response.data.Status === 'Success') {
            return {
                success: true,
                message: 'OTP verified successfully',
                data: response.data
            };
        } else {
            // OTP verification failed
            return {
                success: false,
                message: response.data?.Reason || 'OTP verification failed',
                data: response.data
            };
        }
    } catch (error) {
        console.error('Error verifying OTP via 2Factor.in:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('OTP verification timeout. Please try again.');
        }
        if (error.response?.status === 401) {
            throw new Error('OTP service authentication failed.');
        }
        
        throw new Error(error.message || 'Failed to verify OTP. Please try again.');
    }
};

/**
 * Complete OTP flow: Generate and send OTP
 * 
 * @param {string} phoneNumber - The phone number to send OTP to
 * @returns {Object} Contains success status and OTP (for testing/logging)
 */
const sendOTPForVerification = async (phoneNumber) => {
    const otp = generateOTP();
    
    try {
        const result = await sendOTP(phoneNumber, otp);
        
        return {
            success: true,
            otp, // Return OTP for server-side logging/testing (remove in production if desired)
            sessionId: result.sessionId,
            message: 'OTP sent successfully. Please check your phone.'
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    sendOTPForVerification
};
