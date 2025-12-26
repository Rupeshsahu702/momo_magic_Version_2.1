/**
 * Attendance Model - Defines the schema for tracking daily attendance records.
 * Each record represents one employee's attendance for one specific date.
 */

const mongoose = require('mongoose');


// Number of recent days to fetch for the attendance summary on employee cards
const DEFAULT_ATTENDANCE_HISTORY_DAYS = 5;

// Valid attendance states that can be assigned to an employee for any given day
const ATTENDANCE_STATUSES = ['present', 'absent', 'half-day'];


const attendanceSchema = mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee reference is required']
    },

    date: {
        type: Date,
        required: [true, 'Date is required']
    },

    status: {
        type: String,
        enum: ATTENDANCE_STATUSES,
        required: [true, 'Attendance status is required'],
        default: 'absent'
    }
}, {
    timestamps: true
});


// ============================================================================
// Database Indexes
// ============================================================================

// Prevents duplicate entries: one employee can only have one attendance record per day.
// Also speeds up the most common query pattern: fetching an employee's attendance range.
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Optimizes queries that fetch all employees' attendance for a given date or range
// (e.g., "show me everyone who was absent last Monday")
attendanceSchema.index({ date: 1 });


// ============================================================================
// Static Methods
// ============================================================================

/**
 * Fetches all attendance records for an employee within a date range.
 * Used by the attendance calendar to display monthly history.
 */
attendanceSchema.statics.getAttendanceForRange = async function (employeeId, startDate, endDate) {
    return this.find({
        employee: employeeId,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: 1 });
};


/**
 * Creates or updates an attendance record for a specific date.
 * Uses upsert so we don't need to check if a record already exists.
 */
attendanceSchema.statics.markAttendance = async function (employeeId, date, status) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findOneAndUpdate(
        {
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        },
        {
            employee: employeeId,
            date: startOfDay,
            status: status
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );
};


/**
 * Retrieves attendance for the most recent N days.
 * Powers the quick attendance dots shown on each employee card in the list.
 */
attendanceSchema.statics.getLastNDaysAttendance = async function (employeeId, numberOfDays = DEFAULT_ATTENDANCE_HISTORY_DAYS) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numberOfDays);
    startDate.setHours(0, 0, 0, 0);

    return this.find({
        employee: employeeId,
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ date: 1 });
};


module.exports = mongoose.model('Attendance', attendanceSchema);
