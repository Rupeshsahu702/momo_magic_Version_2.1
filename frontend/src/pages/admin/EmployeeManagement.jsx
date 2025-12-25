/**
 * EmployeeManagement - Admin page for managing employees and tracking attendance.
 * Displays employee list with CRUD operations and attendance status management.
 */

import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardContent } from "../../components/ui/card";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Search,
    Bell,
    Settings,
    Plus,
    MoreVertical,
    Briefcase,
    CheckCircle2,
    Calendar,
    Mail,
    Phone,
    DownloadCloud,
    Pencil,
    Trash2,
    CalendarDays,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import AdminSidebar from "@/components/admin/Sidebar";
import DeleteEmployeeModal from "@/components/admin/DeleteEmployeeModal";
import AttendanceCalendar from "@/components/admin/AttendanceCalendar";
import { Link, useNavigate } from "react-router-dom";
import employeeService from "@/services/employeeService";

export default function EmployeeManagement() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeRole, setActiveRole] = useState("all");
    const [activeStatus, setActiveStatus] = useState("all");
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Data state
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({
        totalStaff: 0,
        presentToday: 0,
        absentToday: 0,
        attendancePercentage: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(null);

    // Attendance calendar modal state
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedEmployeeForCalendar, setSelectedEmployeeForCalendar] = useState(null);

    // Fetch employees on mount and when filters change
    useEffect(() => {
        fetchEmployees();
        fetchStats();
        // NOTE: fetchEmployees and fetchStats don't need to be dependencies since they 
        // only use setters and service calls which are stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRole, activeStatus]);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const data = await employeeService.fetchAllEmployees({
                role: activeRole,
                status: activeStatus
            });
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await employeeService.fetchEmployeeStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Handle attendance change
    const handleAttendanceChange = async (employeeId, newStatus) => {
        setIsUpdatingAttendance(employeeId);

        try {
            await employeeService.updateTodayAttendance(employeeId, newStatus);

            // Update local state
            setEmployees((prevEmployees) =>
                prevEmployees.map((emp) =>
                    emp._id === employeeId ? { ...emp, todayStatus: newStatus } : emp
                )
            );

            // Refresh stats
            fetchStats();
            toast.success("Attendance updated successfully");
        } catch (error) {
            console.error("Error updating attendance:", error);
            toast.error("Failed to update attendance");
        } finally {
            setIsUpdatingAttendance(null);
        }
    };

    // Delete employee
    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            await employeeService.deleteEmployee(employeeToDelete._id);
            setEmployees((prev) => prev.filter((emp) => emp._id !== employeeToDelete._id));
            fetchStats();
            toast.success("Employee removed successfully");
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to remove employee");
        } finally {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    // Menu handlers
    const toggleRowMenu = (id) => {
        setActiveMenuId((prev) => (prev === id ? null : id));
    };

    const handleEditEmployee = (employee) => {
        navigate(`/admin/employees/edit/${employee._id}`, { state: { employee } });
        setActiveMenuId(null);
    };

    const handleRemoveEmployee = (employee) => {
        setEmployeeToDelete(employee);
        setDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const handleViewCalendar = (employee) => {
        setSelectedEmployeeForCalendar(employee);
        setCalendarOpen(true);
        setActiveMenuId(null);
    };

    // Stats cards configuration
    const statsCards = [
        {
            icon: Briefcase,
            iconBg: "bg-blue-500",
            label: "Total Staff",
            value: stats.totalStaff,
            badge: "",
            badgeColor: "",
        },
        {
            icon: CheckCircle2,
            iconBg: "bg-orange-500",
            label: "Present Today",
            value: stats.presentToday,
            badge: `${stats.attendancePercentage}%`,
            badgeColor: "bg-orange-500/20 text-orange-400",
        },
        {
            icon: Calendar,
            iconBg: "bg-red-500",
            label: "On Leave",
            value: stats.absentToday,
            badge: "",
            badgeColor: "",
        },
    ];

    // Role filters
    const roleFilters = [
        { key: "all", label: "All Roles" },
        { key: "chefs", label: "Chefs" },
        { key: "cashiers", label: "Cashiers" },
        { key: "managers", label: "Managers" },
    ];

    // Status filters
    const statusFilters = [
        { key: "all", label: "All", color: "text-gray-600" },
        { key: "present", label: "Present", color: "text-orange-500" },
        { key: "absent", label: "Absent", color: "text-red-500" },
        { key: "half-day", label: "Half Day", color: "text-yellow-500" },
    ];

    // Filter employees by search query
    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Export to CSV
    const exportCSV = () => {
        const headers = ["ID", "Name", "Employee ID", "Role", "Shift", "Email", "Phone", "Status"];
        const rows = filteredEmployees.map(e => [
            e._id,
            e.name,
            e.employeeId,
            e.position,
            e.shift,
            e.email,
            e.phone,
            e.todayStatus,
        ]);

        const csvContent = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const filename = `employees-${now.toISOString().slice(0, 10)}.csv`;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Get select trigger style based on status
    const getSelectTriggerClass = (status) => {
        const classes = {
            present: "border-green-500 bg-green-50 text-green-700 hover:bg-green-100",
            absent: "border-red-500 bg-red-50 text-red-700 hover:bg-red-100",
            "half-day": "border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        };
        return classes[status] || "border-gray-300";
    };

    // Get attendance dot color based on status
    const getAttendanceDotColor = (status) => {
        const colors = {
            present: "bg-green-500",
            "half-day": "bg-yellow-500",
            absent: "bg-red-500",
        };
        return colors[status] || "bg-gray-300";
    };

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 bg-white min-h-screen">
                {/* Header */}
                <header className="border-b border-orange-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                                />
                            </div>

                            {/* Notification */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                            >
                                <Bell className="h-5 w-5" />
                            </Button>

                            {/* Settings */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Today's Roster Section with Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Header and Button */}
                        <div className="lg:col-span-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                    Today's <span className="text-orange-500">Roster</span>
                                </h2>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Efficiently track attendance, manage shifts, and update your team profiles
                                </p>
                            </div>
                            <Link to="/admin/employees/add">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white mt-4 w-full h-14 text-lg font-semibold">
                                    <Plus className="h-6 w-6 mr-2" />
                                    Add New Employee
                                </Button>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        {statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={index} className="bg-white border-gray-200 shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`p-4 rounded-lg ${stat.iconBg}`}>
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            {stat.badge && (
                                                <Badge className={`${stat.badgeColor} border-0 text-sm px-3 py-1`}>
                                                    {stat.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                        <p className="text-base text-gray-600 font-medium">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            {roleFilters.map((filter) => (
                                <Button
                                    key={filter.key}
                                    variant={activeRole === filter.key ? "default" : "ghost"}
                                    onClick={() => setActiveRole(filter.key)}
                                    className={`${activeRole === filter.key
                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                        : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                                        }`}
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-gray-200"></div>

                        <div className="flex items-center gap-2">
                            {statusFilters.map((filter) => (
                                <Button
                                    key={filter.key}
                                    variant="ghost"
                                    onClick={() => setActiveStatus(filter.key)}
                                    className={`${activeStatus === filter.key
                                        ? filter.color + " bg-gray-100"
                                        : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    <span className="mr-2">●</span>
                                    {filter.label}
                                </Button>
                            ))}
                        </div>
                        <div className="ml-4">
                            <Button onClick={exportCSV} className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                                <DownloadCloud className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            <span className="ml-2 text-gray-600">Loading employees...</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredEmployees.length === 0 && (
                        <div className="text-center py-20">
                            <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Employees Found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery ? "Try a different search term" : "Add your first employee to get started"}
                            </p>
                            <Link to="/admin/employees/add">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Employee
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Employee Table */}
                    {!isLoading && filteredEmployees.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200 hover:bg-orange-50/50 bg-orange-50">
                                        <TableHead className="text-gray-700 font-semibold">EMPLOYEE</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">ROLE & SHIFT</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">CONTACT</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">
                                            HISTORY (5 DAYS)
                                        </TableHead>
                                        <TableHead className="text-gray-700 font-semibold">
                                            TODAY'S ATTENDANCE
                                        </TableHead>
                                        <TableHead className="text-gray-700 font-semibold">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow
                                            key={employee._id}
                                            className="border-gray-200 hover:bg-orange-100/50"
                                        >
                                            {/* Employee */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={employee.avatar} />
                                                        <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                                                            {employee.name.split(" ").map((n) => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{employee.name}</p>
                                                        <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Role & Shift */}
                                            <TableCell>
                                                <Badge className={`${employee.roleColor} border-0 mb-1`}>
                                                    {employee.position}
                                                </Badge>
                                                <p className="text-sm text-gray-600">{employee.shift}</p>
                                            </TableCell>

                                            {/* Contact */}
                                            <TableCell>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Mail className="h-4 w-4 text-gray-600" />
                                                    <p className="text-sm text-gray-700">{employee.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-600" />
                                                    <p className="text-sm text-gray-600">{employee.phone}</p>
                                                </div>
                                            </TableCell>

                                            {/* History (5 Days) */}
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {(employee.attendanceHistory || []).map((status, index) => (
                                                        <div
                                                            key={index}
                                                            className={`h-3 w-3 rounded-full ${getAttendanceDotColor(status)}`}
                                                            title={status ? status.charAt(0).toUpperCase() + status.slice(1) : "No data"}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            {/* Today's Attendance - Dropdown */}
                                            <TableCell>
                                                <Select
                                                    value={employee.todayStatus}
                                                    onValueChange={(value) => handleAttendanceChange(employee._id, value)}
                                                    disabled={isUpdatingAttendance === employee._id}
                                                >
                                                    <SelectTrigger className={`w-36 ${getSelectTriggerClass(employee.todayStatus)}`}>
                                                        {isUpdatingAttendance === employee._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="present">
                                                            <span className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                                Present
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="absent">
                                                            <span className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                                Absent
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="half-day">
                                                            <span className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                                                Half Day
                                                            </span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right relative">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleRowMenu(employee._id)}
                                                    className="text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>

                                                {activeMenuId === employee._id && (
                                                    <>
                                                        {/* Backdrop overlay */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveMenuId(null)}
                                                        />

                                                        {/* Popup menu */}
                                                        <div className="absolute right-0 top-10 w-48 rounded-lg bg-gray-900 shadow-2xl border border-gray-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {/* View Calendar */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewCalendar(employee)}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 transition-colors"
                                                            >
                                                                <CalendarDays className="h-4 w-4" />
                                                                <span>View Attendance</span>
                                                            </button>

                                                            {/* Edit */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditEmployee(employee)}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 transition-colors border-t border-gray-800"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span>Edit</span>
                                                            </button>

                                                            {/* Remove */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveEmployee(employee)}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors border-t border-gray-800"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>Remove</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Employee Modal */}
            <DeleteEmployeeModal
                employee={employeeToDelete}
                isOpen={deleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            {/* Attendance Calendar Modal */}
            <AttendanceCalendar
                employee={selectedEmployeeForCalendar}
                isOpen={calendarOpen}
                onClose={() => {
                    setCalendarOpen(false);
                    setSelectedEmployeeForCalendar(null);
                }}
            />
        </>
    );
}
