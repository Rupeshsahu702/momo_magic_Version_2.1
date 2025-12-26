/**
 * Employee Service - Handles all API calls for employee operations.
 * Provides functions for CRUD operations on employees and attendance tracking.
 */

import api from './api';

/**
 * Fetch all employees from the database.
 * @param {Object} filters - Optional filters (role, status)
 * @returns {Promise<Array>} Array of employees with attendance history
 */
const fetchAllEmployees = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.role && filters.role !== 'all') {
        params.append('role', filters.role);
    }
    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = queryString ? `/employees?${queryString}` : '/employees';

    const response = await api.get(url);
    return response.data;
};

/**
 * Fetch employee statistics for dashboard.
 * @returns {Promise<Object>} Stats object with counts
 */
const fetchEmployeeStats = async () => {
    const response = await api.get('/employees/stats');
    return response.data;
};

/**
 * Fetch a single employee by ID.
 * @param {string} id - Employee ID (MongoDB ObjectId)
 * @returns {Promise<Object>} Employee object
 */
const fetchEmployeeById = async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
};

/**
 * Create a new employee.
 * @param {Object} employeeData - Employee data
 * @returns {Promise<Object>} Created employee
 */
const createEmployee = async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
};

/**
 * Update an existing employee.
 * @param {string} id - Employee ID
 * @param {Object} employeeData - Updated employee data
 * @returns {Promise<Object>} Updated employee
 */
const updateEmployee = async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
};

/**
 * Delete an employee (soft delete).
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteEmployee = async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
};

/**
 * Update today's attendance for an employee.
 * @param {string} id - Employee ID
 * @param {string} status - Attendance status (present, absent, half-day)
 * @returns {Promise<Object>} Updated employee with attendance
 */
const updateTodayAttendance = async (id, status) => {
    const response = await api.put(`/employees/${id}/attendance`, { status });
    return response.data;
};

/**
 * Fetch attendance history for an employee (for calendar view).
 * @param {string} id - Employee ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Attendance history with employee info
 */
const fetchAttendanceHistory = async (id, startDate, endDate) => {
    const params = new URLSearchParams();

    if (startDate) {
        params.append('startDate', startDate);
    }
    if (endDate) {
        params.append('endDate', endDate);
    }

    const queryString = params.toString();
    const url = queryString
        ? `/employees/${id}/attendance-history?${queryString}`
        : `/employees/${id}/attendance-history`;

    const response = await api.get(url);
    return response.data;
};

/**
 * Download attendance CSV template with all active employees.
 * @returns {Promise<Blob>} CSV file blob
 */
const downloadAttendanceTemplate = async () => {
    const response = await api.get('/employees/attendance/download-csv', {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Upload attendance CSV and bulk update employee attendance.
 * @param {File} file - CSV file to upload
 * @returns {Promise<Object>} Upload results with summary
 */
const uploadAttendanceCSV = async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);

    const response = await api.post('/employees/attendance/upload-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Get all attendance records with filters.
 * @param {Object} filters - Optional filters (startDate, endDate, employeeId, status, page, limit)
 * @returns {Promise<Object>} Attendance records with pagination and stats
 */
const getAllAttendance = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = queryString ? `/employees/attendance/all?${queryString}` : '/employees/attendance/all';

    const response = await api.get(url);
    return response.data;
};

const employeeService = {
    fetchAllEmployees,
    fetchEmployeeStats,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateTodayAttendance,
    fetchAttendanceHistory,
    downloadAttendanceTemplate,
    uploadAttendanceCSV,
    getAllAttendance
};

export default employeeService;
