// FIXED uploadAttendanceCSV function with better CSV parsing
// Replace the uploadAttendanceCSV function in employeeController.js (lines 434-547)

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
                // Parse date string (YYYY-MM-DD format) in local timezone
                const dateParts = dateValue.split('-');
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                    const day = parseInt(dateParts[2]);

                    if (isNaN(year) || isNaN(month) || isNaN(day)) {
                        errors.push({
                            row: i + 2,
                            employeeId,
                            error: `Invalid date format "${dateValue}". Use YYYY-MM-DD`
                        });
                        continue;
                    }

                    attendanceDate = new Date(year, month, day);
                    attendanceDateString = attendanceDate.toISOString().split('T')[0];
                } else {
                    errors.push({
                        row: i + 2,
                        employeeId,
                        error: `Invalid date format "${dateValue}". Use YYYY-MM-DD`
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
