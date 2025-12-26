/**
 * Employee Controller - Handles all CRUD operations for employees.
 * Provides endpoints for managing employees and their attendance records.
 */

const Employee = require('../models/employeeModel');
const Attendance = require('../models/attendanceModel');
const { Parser } = require('json2csv');
const csv = require('csv-parser');

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private (Admin)
 * @query   role - Filter by position category (chefs, cashiers, managers, staff)
 * @query   status - Filter by today's status (present, absent, half-day)
 */
const getAllEmployees = async (req, res) => {
    try {
        const { role, status } = req.query;

        // Build filter object based on query parameters
        const filter = { isActive: true };

        if (role && role !== 'all') {
            filter.positionCategory = role;
        }

        if (status && status !== 'all') {
            filter.todayStatus = status;
        }

        const employees = await Employee.find(filter).sort({ name: 1 });

        // For each employee, fetch their last 5 days attendance
        const employeesWithAttendance = await Promise.all(
            employees.map(async (employee) => {
                const attendanceRecords = await Attendance.getLastNDaysAttendance(employee._id, 5);

                // Convert to simple boolean/status array for the last 5 days
                const last5Days = [];
                const today = new Date();

                for (let i = 4; i >= 0; i--) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    checkDate.setHours(0, 0, 0, 0);

                    const record = attendanceRecords.find(r => {
                        const recordDate = new Date(r.date);
                        recordDate.setHours(0, 0, 0, 0);
                        return recordDate.getTime() === checkDate.getTime();
                    });

                    last5Days.push(record ? record.status : null);
                }

                return {
                    ...employee.toObject(),
                    attendanceHistory: last5Days
                };
            })
        );

        res.status(200).json(employeesWithAttendance);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error while fetching employees' });
    }
};

/**
 * @desc    Get employee statistics
 * @route   GET /api/employees/stats
 * @access  Private (Admin)
 */
const getEmployeeStats = async (req, res) => {
    try {
        const allEmployees = await Employee.find({ isActive: true });

        const stats = {
            totalStaff: allEmployees.length,
            presentToday: allEmployees.filter(emp => emp.todayStatus === 'present').length,
            absentToday: allEmployees.filter(emp => emp.todayStatus === 'absent').length,
            halfDayToday: allEmployees.filter(emp => emp.todayStatus === 'half-day').length
        };

        // Calculate attendance percentage
        const presentCount = stats.presentToday + (stats.halfDayToday * 0.5);
        stats.attendancePercentage = stats.totalStaff > 0
            ? Math.round((presentCount / stats.totalStaff) * 100)
            : 0;

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        res.status(500).json({ message: 'Server error while fetching employee stats' });
    }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (Admin)
 */
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        res.status(500).json({ message: 'Server error while fetching employee' });
    }
};

/**
 * @desc    Create new employee
 * @route   POST /api/employees
 * @access  Private (Admin)
 */
const createEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            name,
            email,
            phone,
            position,
            shift,
            avatar,
            dateOfBirth,
            gender,
            address,
            startDate,
            emergencyContactName,
            emergencyContactPhone,
            permissionLevel,
            isActive
        } = req.body;

        // Validate required fields
        if (!employeeId || !name || !email || !phone || !position) {
            return res.status(400).json({
                message: 'Please provide all required fields: employeeId, name, email, phone, position'
            });
        }

        // Check if employee ID or email already exists
        const existingEmployee = await Employee.findOne({
            $or: [{ employeeId }, { email }]
        });

        if (existingEmployee) {
            const duplicateField = existingEmployee.employeeId === employeeId ? 'Employee ID' : 'Email';
            return res.status(400).json({ message: `${duplicateField} already exists` });
        }

        const employee = await Employee.create({
            employeeId,
            name,
            email,
            phone,
            position,
            shift: shift || '09:00 AM - 05:00 PM',
            avatar: avatar || '',
            dateOfBirth,
            gender,
            address: address || '',
            startDate: startDate || new Date(),
            emergencyContactName: emergencyContactName || '',
            emergencyContactPhone: emergencyContactPhone || '',
            permissionLevel: permissionLevel || 'standard',
            isActive: isActive !== undefined ? isActive : true,
            todayStatus: 'absent'
        });

        res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee ID or email already exists' });
        }

        res.status(500).json({ message: 'Server error while creating employee' });
    }
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Private (Admin)
 */
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee ID or email already exists' });
        }

        res.status(500).json({ message: 'Server error while updating employee' });
    }
};

/**
 * @desc    Delete employee (soft delete by setting isActive to false)
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin)
 */
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Soft delete - set isActive to false
        await Employee.findByIdAndUpdate(req.params.id, { isActive: false });

        res.status(200).json({ message: 'Employee deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('Error deleting employee:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        res.status(500).json({ message: 'Server error while deleting employee' });
    }
};

/**
 * @desc    Update today's attendance for an employee
 * @route   PUT /api/employees/:id/attendance
 * @access  Private (Admin)
 */
const updateTodayAttendance = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['present', 'absent', 'half-day'].includes(status)) {
            return res.status(400).json({
                message: 'Please provide a valid status: present, absent, or half-day'
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update employee's todayStatus
        employee.todayStatus = status;
        await employee.save();

        // Also create/update attendance record for today
        const today = new Date();
        await Attendance.markAttendance(employee._id, today, status);

        res.status(200).json({
            message: 'Attendance updated successfully',
            employee: employee
        });
    } catch (error) {
        console.error('Error updating attendance:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        res.status(500).json({ message: 'Server error while updating attendance' });
    }
};

/**
 * @desc    Get attendance history for an employee (for calendar view)
 * @route   GET /api/employees/:id/attendance-history
 * @access  Private (Admin)
 * @query   startDate - Start date for range (YYYY-MM-DD)
 * @query   endDate - End date for range (YYYY-MM-DD)
 */
const getAttendanceHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Default to current month if no dates provided
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            // Default: current month
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.getAttendanceForRange(
            req.params.id,
            start,
            end
        );

        // Format for calendar: { date: 'YYYY-MM-DD', status: 'present' | 'absent' | 'half-day' }
        // Note: Format dates in IST timezone to prevent off-by-one day issues
        const formattedRecords = attendanceRecords.map(record => {
            // Add 5.5 hours (IST offset) to get correct local date
            const istDate = new Date(record.date.getTime() + (5.5 * 60 * 60 * 1000));
            const year = istDate.getUTCFullYear();
            const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(istDate.getUTCDate()).padStart(2, '0');

            return {
                date: `${year}-${month}-${day}`,
                status: record.status
            };
        });

        res.status(200).json({
            employee: {
                id: employee._id,
                name: employee.name,
                employeeId: employee.employeeId
            },
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            attendance: formattedRecords
        });
    } catch (error) {
        console.error('Error fetching attendance history:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        res.status(500).json({ message: 'Server error while fetching attendance history' });
    }
};

/**
 * @desc    Download CSV template with all active employees
 * @route   GET /api/employees/attendance/download-csv
 * @access  Private (Admin)
 */
const downloadAttendanceTemplate = async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true }).sort({ employeeId: 1 });

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No active employees found' });
        }

        // Get date from query parameter or use today
        const dateParam = req.query.date;
        const templateDate = dateParam ? new Date(dateParam) : new Date();
        const dateString = templateDate.toISOString().split('T')[0];

        // Prepare data for CSV with minimal columns (Date, Employee ID, Name, Attendance Status)
        const csvData = employees.map(employee => ({
            'Date': dateString,
            'Employee ID': employee.employeeId,
            'Name': employee.name,
            'Attendance Status': employee.todayStatus || 'absent'
        }));

        // Configure CSV parser with minimal fields
        const fields = ['Date', 'Employee ID', 'Name', 'Attendance Status'];
        const json2csvParser = new Parser({ fields });
        const csvContent = json2csvParser.parse(csvData);

        // Set headers for file download
        const filename = `attendance-template-${dateString}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error generating CSV template:', error);
        res.status(500).json({ message: 'Server error while generating CSV template' });
    }
};

/**
 * @desc    Upload and process attendance CSV
 * @route   POST /api/employees/attendance/upload-csv
 * @access  Private (Admin)
 */
const uploadAttendanceCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const validStatuses = ['present', 'absent', 'half-day'];
        const results = [];
        const errors = [];

        // Get today's date at midnight in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = today.toISOString().split('T')[0];

        // Parse CSV buffer
        const csvString = req.file.buffer.toString('utf-8');
        const rows = csvString.split('\n').map(row => row.trim()).filter(row => row);

        if (rows.length < 2) {
            return res.status(400).json({ message: 'CSV file is empty or has no data rows' });
        }

        // Parse header row
        const headerRow = rows[0];
        const headers = parseCSVRow(headerRow);

        // Check if Date column exists
        const hasDateColumn = headers.some(h => h.toLowerCase().includes('date'));

        // Find column indices
        const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
        const employeeIdIndex = headers.findIndex(h => h.toLowerCase().includes('employee id'));
        const statusIndex = headers.findIndex(h => h.toLowerCase().includes('attendance status'));

        if (employeeIdIndex === -1 || statusIndex === -1) {
            return res.status(400).json({
                message: 'CSV must include "Employee ID" and "Attendance Status" columns'
            });
        }

        // Process data rows
        const dataRows = rows.slice(1);

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row) continue;

            // Parse CSV row
            const values = parseCSVRow(row);

            // Extract values by column index
            const employeeId = values[employeeIdIndex]?.trim();
            const attendanceStatus = values[statusIndex]?.trim();
            const dateValue = hasDateColumn && dateIndex !== -1 ? values[dateIndex]?.trim() : todayString;

            if (!employeeId || !attendanceStatus) {
                errors.push({
                    row: i + 2,
                    employeeId: employeeId || 'Unknown',
                    error: 'Missing Employee ID or Attendance Status'
                });
                continue;
            }

            // Parse and validate date
            let attendanceDate;
            let attendanceDateString;

            if (dateValue && dateValue !== '') {
                // Parse date string - supports both YYYY-MM-DD and DD-MM-YYYY formats
                const dateParts = dateValue.split('-');
                if (dateParts.length === 3) {
                    let year, month, day;

                    // Auto-detect format by checking which part is the year
                    const part0 = parseInt(dateParts[0]);
                    const part1 = parseInt(dateParts[1]);
                    const part2 = parseInt(dateParts[2]);

                    // If first part > 31, it's YYYY-MM-DD format
                    // If last part > 31, it's DD-MM-YYYY format
                    if (part0 > 31) {
                        // YYYY-MM-DD format
                        year = part0;
                        month = part1 - 1; // Month is 0-indexed
                        day = part2;
                    } else if (part2 > 31) {
                        // DD-MM-YYYY format
                        day = part0;
                        month = part1 - 1; // Month is 0-indexed
                        year = part2;
                    } else {
                        // Ambiguous - default to YYYY-MM-DD for ISO standard
                        year = part0;
                        month = part1 - 1;
                        day = part2;
                    }

                    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
                        errors.push({
                            row: i + 2,
                            employeeId,
                            error: `Invalid date format "${dateValue}". Use YYYY-MM-DD or DD-MM-YYYY`
                        });
                        continue;
                    }

                    attendanceDate = new Date(year, month, day);

                    // Validate that the date is valid (e.g., not Feb 31)
                    if (attendanceDate.getDate() !== day || attendanceDate.getMonth() !== month || attendanceDate.getFullYear() !== year) {
                        errors.push({
                            row: i + 2,
                            employeeId,
                            error: `Invalid date "${dateValue}". Day/month/year combination doesn't exist`
                        });
                        continue;
                    }

                    attendanceDateString = attendanceDate.toISOString().split('T')[0];
                } else {
                    errors.push({
                        row: i + 2,
                        employeeId,
                        error: `Invalid date format "${dateValue}". Use YYYY-MM-DD or DD-MM-YYYY`
                    });
                    continue;
                }
            } else {
                attendanceDate = new Date(today);
                attendanceDateString = todayString;
            }

            // Validate status
            const statusLower = attendanceStatus.toLowerCase().trim();
            if (!validStatuses.includes(statusLower)) {
                errors.push({
                    row: i + 2,
                    employeeId,
                    error: `Invalid status "${attendanceStatus}". Must be: present, absent, or half-day`
                });
                continue;
            }

            // Find employee and update attendance
            try {
                const employee = await Employee.findOne({ employeeId: employeeId.trim() });

                if (!employee) {
                    errors.push({
                        row: i + 2,
                        employeeId,
                        error: 'Employee not found'
                    });
                    continue;
                }

                // Update employee todayStatus only if date is today
                const isTodayDate = attendanceDateString === todayString;
                if (isTodayDate) {
                    employee.todayStatus = statusLower;
                    await employee.save();
                }

                // Create/update attendance record for the specified date
                await Attendance.markAttendance(employee._id, attendanceDate, statusLower);

                results.push({
                    employeeId,
                    name: employee.name,
                    date: attendanceDateString,
                    status: statusLower
                });
            } catch (updateError) {
                errors.push({
                    row: i + 2,
                    employeeId,
                    error: updateError.message
                });
            }
        }

        // Return summary
        res.status(200).json({
            message: 'CSV processed successfully',
            summary: {
                total: dataRows.length,
                successful: results.length,
                failed: errors.length
            },
            results,
            errors
        });
    } catch (error) {
        console.error('Error processing CSV upload:', error);
        res.status(500).json({ message: 'Server error while processing CSV file' });
    }
};

// Helper function to parse CSV row properly
function parseCSVRow(row) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    values.push(current.trim());

    return values;
}

/**
 * @desc    Get all attendance records with filters
 * @route   GET /api/employees/attendance/all
 * @access   Private (Admin)
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @query   employeeId - Filter by employee ID
 * @query   status - Filter by attendance status
 * @query   page - Page number (default: 1)
 * @query   limit - Records per page (default: 20)
 */
const getAllAttendance = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            employeeId,
            status,
            page = 1,
            limit = 20
        } = req.query;

        // Build filter object
        const filter = {};

        // Date range filter
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                filter.date.$lte = endDateTime;
            }
        }

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Employee filter
        let employeeFilter = {};
        if (employeeId) {
            const employee = await Employee.findOne({ employeeId });
            if (employee) {
                filter.employee = employee._id;
            } else {
                return res.status(404).json({ message: 'Employee not found' });
            }
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch attendance records with employee details
        const attendanceRecords = await Attendance.find(filter)
            .populate('employee', 'employeeId name position email phone')
            .sort({ date: -1, 'employee.name': 1 })
            .skip(skip)
            .limit(limitNumber);

        // Get total count for pagination
        const totalRecords = await Attendance.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limitNumber);

        // Calculate stats for filtered records
        const stats = await Attendance.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsObject = {
            total: totalRecords,
            present: 0,
            absent: 0,
            halfDay: 0
        };

        stats.forEach(stat => {
            if (stat._id === 'present') statsObject.present = stat.count;
            if (stat._id === 'absent') statsObject.absent = stat.count;
            if (stat._id === 'half-day') statsObject.halfDay = stat.count;
        });

        // Format records for response
        // Note: Format dates in IST timezone to prevent off-by-one day issues
        const formattedRecords = attendanceRecords.map(record => {
            // Add 5.5 hours (IST offset) to get correct local date
            const istDate = new Date(record.date.getTime() + (5.5 * 60 * 60 * 1000));
            const year = istDate.getUTCFullYear();
            const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(istDate.getUTCDate()).padStart(2, '0');

            return {
                _id: record._id,
                date: `${year}-${month}-${day}`,
                employeeId: record.employee?.employeeId || 'N/A',
                name: record.employee?.name || 'Unknown',
                position: record.employee?.position || 'N/A',
                email: record.employee?.email || 'N/A',
                phone: record.employee?.phone || 'N/A',
                status: record.status
            };
        });

        res.status(200).json({
            records: formattedRecords,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalRecords,
                recordsPerPage: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            },
            stats: statsObject
        });
    } catch (error) {
        console.error('Error fetching all attendance:', error);
        res.status(500).json({ message: 'Server error while fetching attendance records' });
    }
};

module.exports = {
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
};
