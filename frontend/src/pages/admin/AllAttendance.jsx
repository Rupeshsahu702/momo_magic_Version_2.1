/**
 * AllAttendance - Admin page for viewing and filtering all attendance records.
 * Displays comprehensive attendance history with date range, employee, and status filters.
 */

import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
    ArrowLeft,
    Calendar as CalendarIcon,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    ChevronLeft,
    ChevronRight,
    DownloadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import AdminSidebar from "@/components/admin/Sidebar";
import employeeService from "@/services/employeeService";

export default function AllAttendance() {
    // Filter state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Data state
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        halfDay: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        recordsPerPage: 20
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch attendance records
    const fetchAttendance = async (page = 1) => {
        try {
            setIsLoading(true);
            const filters = {
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                employeeId: employeeSearch || undefined,
                status: statusFilter,
                page,
                limit: 20
            };

            const data = await employeeService.getAllAttendance(filters);
            setAttendance(data.records);
            setStats(data.stats);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            toast.error("Failed to load attendance records");
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        fetchAttendance(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle filter apply
    const handleApplyFilters = () => {
        fetchAttendance(1);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setEmployeeSearch("");
        setStatusFilter("all");
        // Will trigger fetch via useEffect
        setTimeout(() => fetchAttendance(1), 0);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAttendance(newPage);
        }
    };

    // Export filtered results to CSV
    const exportCSV = () => {
        const headers = ["Date", "Employee ID", "Name", "Position", "Status"];
        const rows = attendance.map(record => [
            record.date,
            record.employeeId,
            record.name,
            record.position,
            record.status
        ]);

        const csvContent = [headers, ...rows]
            .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `attendance-records-${new Date().toISOString().slice(0, 10)}.csv`;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Attendance records exported successfully");
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const badges = {
            present: "bg-green-100 text-green-700 border-green-300",
            absent: "bg-red-100 text-red-700 border-red-300",
            "half-day": "bg-yellow-100 text-yellow-700 border-yellow-300",
        };
        return badges[status] || "bg-gray-100 text-gray-700";
    };

    // Stats cards
    const statsCards = [
        {
            icon: Users,
            iconBg: "bg-blue-500",
            label: "Total Records",
            value: stats.total,
        },
        {
            icon: CheckCircle2,
            iconBg: "bg-green-500",
            label: "Present",
            value: stats.present,
        },
        {
            icon: XCircle,
            iconBg: "bg-red-500",
            label: "Absent",
            value: stats.absent,
        },
        {
            icon: Clock,
            iconBg: "bg-yellow-500",
            label: "Half Day",
            value: stats.halfDay,
        },
    ];

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 bg-white min-h-screen">
                {/* Header */}
                <header className="border-b border-orange-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <Link to="/admin/employees">
                                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-500">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">All Attendance Records</h1>
                        </div>

                        <Button onClick={exportCSV} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <DownloadCloud className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Start Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        End Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Employee Search */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Employee ID
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., EMP001"
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Status
                                    </label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="present">Present</SelectItem>
                                            <SelectItem value="absent">Absent</SelectItem>
                                            <SelectItem value="half-day">Half Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 items-end">
                                    <Button onClick={handleApplyFilters} className="bg-orange-500 hover:bg-orange-600 text-white flex-1">
                                        Apply
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            <span className="ml-2 text-gray-600">Loading attendance records...</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && attendance.length === 0 && (
                        <div className="text-center py-20">
                            <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Attendance Records Found</h3>
                            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                        </div>
                    )}

                    {/* Attendance Table */}
                    {!isLoading && attendance.length > 0 && (
                        <>
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 hover:bg-orange-50/50 bg-orange-50">
                                            <TableHead className="text-gray-700 font-semibold">DATE</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">EMPLOYEE ID</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">NAME</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">POSITION</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">STATUS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendance.map((record) => (
                                            <TableRow key={record._id} className="border-gray-200 hover:bg-orange-100/50">
                                                <TableCell className="font-medium">{record.date}</TableCell>
                                                <TableCell>{record.employeeId}</TableCell>
                                                <TableCell>{record.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{record.position}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusBadge(record.status)} border`}>
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-gray-600">
                                    Showing {((pagination.currentPage - 1) * pagination.recordsPerPage) + 1} to{" "}
                                    {Math.min(pagination.currentPage * pagination.recordsPerPage, pagination.totalRecords)} of{" "}
                                    {pagination.totalRecords} records
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-700">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
