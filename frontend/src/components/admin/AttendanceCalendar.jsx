/**
 * AttendanceCalendar - A visual calendar component for viewing employee attendance history.
 * Displays a monthly view with color-coded days:
 *   - Green: Present
 *   - Yellow: Half-day
 *   - Red: Absent
 */

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import employeeService from "@/services/employeeService";


// ============================================================================
// Constants
// ============================================================================

// Background colors for each attendance status (displayed on calendar day cells)
const ATTENDANCE_STATUS_COLORS = {
    present: "bg-green-500",
    "half-day": "bg-yellow-500",
    absent: "bg-red-500"
};

// Human-readable labels shown on hover tooltip
const ATTENDANCE_STATUS_LABELS = {
    present: "Present",
    "half-day": "Half Day",
    absent: "Absent"
};

// Week starts on Sunday (index 0) in this calendar
const WEEKDAY_ABBREVIATIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Full month names for the header
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


// ============================================================================
// Component
// ============================================================================

export default function AttendanceCalendar({ employee, isOpen, onClose }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);


    // -------------------------------------------------------------------------
    // Data Fetching
    // -------------------------------------------------------------------------

    /**
     * Re-fetch attendance whenever:
     * - Modal opens (isOpen changes to true)
     * - Employee changes (viewing a different employee's calendar)
     * - Month changes (navigating to a different month)
     */
    useEffect(() => {
        if (isOpen && employee) {
            fetchAttendanceData();
        }
        // NOTE: fetchAttendanceData is defined inside the component but doesn't need to be
        // a dependency since we only want to refetch when isOpen, employee, or month changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, employee, currentDate]);

    const fetchAttendanceData = async () => {
        if (!employee?._id) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Build date range for the entire month
            const startDate = new Date(year, month, 1).toISOString().split("T")[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

            const response = await employeeService.fetchAttendanceHistory(
                employee._id,
                startDate,
                endDate
            );

            // Convert the array response into a lookup object for O(1) access by date
            const attendanceByDate = {};
            response.attendance.forEach((record) => {
                attendanceByDate[record.date] = record.status;
            });

            setAttendanceData(attendanceByDate);

        } catch (error) {
            console.error("Error fetching attendance:", error);
            setErrorMessage("Failed to load attendance data");

        } finally {
            setIsLoading(false);
        }
    };


    // -------------------------------------------------------------------------
    // Navigation Handlers
    // -------------------------------------------------------------------------

    const navigateToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const navigateToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const navigateToCurrentMonth = () => {
        setCurrentDate(new Date());
    };


    // -------------------------------------------------------------------------
    // Calendar Grid Helpers
    // -------------------------------------------------------------------------

    /**
     * Builds an array of day objects for rendering the calendar grid.
     * Includes empty slots for days before the 1st (to align with weekday columns).
     */
    const buildCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const totalDaysInMonth = lastDayOfMonth.getDate();
        const startingWeekday = firstDayOfMonth.getDay();

        const calendarDays = [];

        // Add empty placeholder cells for days before the 1st of the month
        for (let emptySlot = 0; emptySlot < startingWeekday; emptySlot++) {
            calendarDays.push({ dayNumber: null, dateString: null });
        }

        // Add all days of the month
        for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
            const formattedMonth = String(month + 1).padStart(2, "0");
            const formattedDay = String(dayNumber).padStart(2, "0");
            const dateString = `${year}-${formattedMonth}-${formattedDay}`;

            calendarDays.push({ dayNumber, dateString });
        }

        return calendarDays;
    };

    const getAttendanceStatusForDate = (dateString) => {
        return attendanceData[dateString] || null;
    };

    const checkIfDateIsToday = (dateString) => {
        if (!dateString) return false;
        const todayString = new Date().toISOString().split("T")[0];
        return dateString === todayString;
    };

    const checkIfDateIsInFuture = (dateString) => {
        if (!dateString) return false;
        const todayString = new Date().toISOString().split("T")[0];
        return dateString > todayString;
    };


    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // Don't render anything if the modal isn't open
    if (!isOpen) {
        return null;
    }

    const calendarDays = buildCalendarDays();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Attendance History</CardTitle>
                            <p className="text-sm text-gray-500">
                                {employee?.name} ({employee?.employeeId})
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={navigateToPreviousMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={navigateToCurrentMonth}
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            >
                                Today
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={navigateToNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                        </div>
                    )}

                    {/* Error State */}
                    {errorMessage && (
                        <div className="text-center py-8 text-red-500">
                            {errorMessage}
                        </div>
                    )}

                    {/* Calendar Grid */}
                    {!isLoading && !errorMessage && (
                        <>
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAY_ABBREVIATIONS.map((weekday) => (
                                    <div
                                        key={weekday}
                                        className="text-center text-sm font-medium text-gray-500 py-2"
                                    >
                                        {weekday}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((dayInfo, index) => {
                                    const attendanceStatus = dayInfo.dateString
                                        ? getAttendanceStatusForDate(dayInfo.dateString)
                                        : null;
                                    const isToday = checkIfDateIsToday(dayInfo.dateString);
                                    const isFutureDate = checkIfDateIsInFuture(dayInfo.dateString);

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                aspect-square flex items-center justify-center
                                                rounded-lg text-sm relative
                                                ${!dayInfo.dayNumber ? "bg-transparent" : ""}
                                                ${isToday ? "ring-2 ring-orange-500 ring-offset-2" : ""}
                                                ${isFutureDate ? "text-gray-300" : ""}
                                                ${!isFutureDate && dayInfo.dayNumber && !attendanceStatus ? "bg-gray-100 text-gray-600" : ""}
                                                ${attendanceStatus ? `${ATTENDANCE_STATUS_COLORS[attendanceStatus]} text-white font-medium` : ""}
                                            `}
                                            title={attendanceStatus ? ATTENDANCE_STATUS_LABELS[attendanceStatus] : ""}
                                        >
                                            {dayInfo.dayNumber}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-500" />
                                    <span className="text-sm text-gray-600">Present</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-500" />
                                    <span className="text-sm text-gray-600">Half Day</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-500" />
                                    <span className="text-sm text-gray-600">Absent</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
