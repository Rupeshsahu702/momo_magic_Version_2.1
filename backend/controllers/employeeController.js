/**
 * Employee Controller - Handles all CRUD operations for employees.
 * Provides endpoints for managing employees and their attendance records.
 */

const Employee = require('../models/employeeModel');
const Attendance = require('../models/attendanceModel');

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
        const formattedRecords = attendanceRecords.map(record => ({
            date: record.date.toISOString().split('T')[0],
            status: record.status
        }));

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

module.exports = {
    getAllEmployees,
    getEmployeeStats,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateTodayAttendance,
    getAttendanceHistory
};
