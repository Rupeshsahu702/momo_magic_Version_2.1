/**
 * Employee Routes - Defines API endpoints for employee operations and attendance tracking.
 */

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getAllEmployees,
    getEmployeeStats,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateTodayAttendance,
    getAttendanceHistory,
    downloadAttendanceTemplate,
    uploadAttendanceCSV,
    getAllAttendance
} = require('../controllers/employeeController');

// Stats route (must come before /:id to avoid conflict)
router.get('/stats', getEmployeeStats);

// CRUD routes
router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

// Attendance routes
router.put('/:id/attendance', updateTodayAttendance);
router.get('/:id/attendance-history', getAttendanceHistory);

// CSV routes (must comebefore /:id to avoid conflict)
router.get('/attendance/download-csv', downloadAttendanceTemplate);
router.post('/attendance/upload-csv', upload.single('csvFile'), uploadAttendanceCSV);
router.get('/attendance/all', getAllAttendance);

module.exports = router;
