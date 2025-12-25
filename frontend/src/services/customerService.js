/**
 * Customer Service - Handles all API calls for customer operations.
 * Provides functions for OTP-based login/register and profile management.
 */

import api from './api';

/**
 * Send OTP to phone number for authentication.
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {Promise<Object>} { success, message, sessionId, expiresIn }
 */
const sendOTP = async (phoneNumber) => {
    const response = await api.post('/users/send-otp', {
        phoneNumber
    });
    return response.data;
};

/**
 * Verify OTP and create/fetch customer session.
 * @param {Object} verificationData - { phoneNumber, sessionId, otp, name, email }
 * @returns {Promise<Object>} { success, message, isNewCustomer, customer }
 */
const verifyOTP = async (verificationData) => {
    const response = await api.post('/users/verify-otp', verificationData);
    return response.data;
};

/**
 * Get customer by phone number.
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {Promise<Object>} Customer data
 */
const getCustomerByPhone = async (phoneNumber) => {
    const response = await api.get(`/users/phone/${phoneNumber}`);
    return response.data;
};

/**
 * Login or register a customer (legacy - email-based).
 * If email exists, returns existing customer. Otherwise creates new one.
 * @param {Object} customerData - { name, email, phone }
 * @returns {Promise<Object>} Customer data and login status
 */
const loginOrRegister = async (customerData) => {
    const response = await api.post('/users/login', customerData);
    return response.data;
};

/**
 * Get customer by email address.
 * @param {string} email - Customer email
 * @returns {Promise<Object>} Customer data
 */
const getCustomerByEmail = async (email) => {
    const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
    return response.data;
};

/**
 * Update customer profile.
 * @param {string} id - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {Promise<Object>} Updated customer
 */
const updateCustomer = async (id, customerData) => {
    const response = await api.put(`/users/${id}`, customerData);
    return response.data;
};

/**
 * Get all customers (admin use).
 * @returns {Promise<Array>} List of customers
 */
const getAllCustomers = async () => {
    const response = await api.get('/users');
    return response.data;
};

const customerService = {
    sendOTP,
    verifyOTP,
    getCustomerByPhone,
    loginOrRegister,
    getCustomerByEmail,
    updateCustomer,
    getAllCustomers
};

export default customerService;
