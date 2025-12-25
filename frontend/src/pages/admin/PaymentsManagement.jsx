/**
 * PaymentsManagement Page - Admin panel for managing customer payments.
 * Shows all pending payments with ability to mark as paid.
 */
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    CreditCard,
    RefreshCw,
    CheckCircle2,
    Clock,
    Loader2,
    DollarSign,
    AlertCircle,
    History,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { useSocket } from "@/context/SocketContext";
import { getPendingPayments, updateBillingStatus, getAllBills } from "@/services/orderService";
import { toast } from "sonner";

export default function PaymentsManagement() {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    const { socket } = useSocket();

    // Fetch payments on mount
    useEffect(() => {
        fetchAllPayments();
    }, []);

    // Listen for payment requests via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handlePaymentRequest = (data) => {
            console.log('New payment request:', data);
            // Refresh the list when a new payment request comes in
            fetchAllPayments();
            toast.info(`Table ${data.tableNumber} is ready to pay - ₹${data.total?.toFixed(2)}`);
        };

        const handleBillingStatusUpdate = (data) => {
            console.log('Billing status updated:', data);
            // Refresh lists to update status
            fetchAllPayments();
        };

        socket.on('payment:request', handlePaymentRequest);
        socket.on('billing:statusUpdate', handleBillingStatusUpdate);

        return () => {
            socket.off('payment:request', handlePaymentRequest);
            socket.off('billing:statusUpdate', handleBillingStatusUpdate);
        };
    }, [socket]);

    const fetchAllPayments = async () => {
        setIsLoading(true);
        try {
            // Fetch pending payments
            const pendingResponse = await getPendingPayments();
            setPendingPayments(pendingResponse.data || []);

            // Fetch all bills
            const allResponse = await getAllBills();
            setAllPayments(allResponse.data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = async (sessionId) => {
        setProcessingId(sessionId);
        try {
            await updateBillingStatus(sessionId, 'paid');
            toast.success('Payment marked as complete');
            // Refresh both lists
            fetchAllPayments();
        } catch (error) {
            console.error('Error marking as paid:', error);
            toast.error('Failed to update payment status');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending_payment: {
                label: "Awaiting Payment",
                className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
                icon: Clock,
            },
            unpaid: {
                label: "Unpaid",
                className: "bg-red-100 text-red-700 hover:bg-red-100",
                icon: AlertCircle,
            },
        };

        const config = statusConfig[status] || statusConfig.unpaid;
        const Icon = config.icon;
        return (
            <Badge variant="secondary" className={config.className}>
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {config.label}
            </Badge>
        );
    };

    const getTimeAgo = (dateInput) => {
        if (!dateInput) return "—";
        const date = new Date(dateInput);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 bg-white min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-green-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                            <p className="text-sm text-gray-600">
                                Manage customer bill payments
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:text-green-500"
                            onClick={fetchAllPayments}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>

                        {/* Payment Count Badge */}
                        <Badge className="bg-green-500 text-white">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {activeTab === 'pending' ? pendingPayments.length : allPayments.length} {activeTab === 'pending' ? 'Pending' : 'Total'}
                        </Badge>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                                activeTab === 'pending'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending Payments ({pendingPayments.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                                activeTab === 'all'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Payment History ({allPayments.length})
                            </div>
                        </button>
                    </div>

                    {/* Summary Cards */}
                    {activeTab === 'pending' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700">Pending Payments</p>
                                        <p className="text-2xl font-bold text-green-900">{pendingPayments.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700">Awaiting Payment</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            {pendingPayments.filter(p => p.billingStatus === 'pending_payment').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            ₹{pendingPayments.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                        <History className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-700">Total Payments</p>
                                        <p className="text-2xl font-bold text-purple-900">{allPayments.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700">Completed</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {allPayments.filter(p => p.billingStatus === 'paid').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700">Pending</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            {allPayments.filter(p => p.billingStatus === 'pending_payment').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            ₹{allPayments.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                            <span className="ml-2 text-gray-600">Loading payments...</span>
                        </div>
                    ) : (activeTab === 'pending' ? pendingPayments.length === 0 : allPayments.length === 0) ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 text-green-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">
                                {activeTab === 'pending' ? 'All Caught Up!' : 'No Payments'}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'pending' ? 'No pending payments at the moment.' : 'No payments recorded yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200 hover:bg-green-50/50 bg-green-50">
                                        <TableHead className="text-gray-700 font-semibold">BILL #</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">TABLE</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">CUSTOMER</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">ORDERS</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">TOTAL</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">STATUS</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">DATE</TableHead>
                                        {activeTab === 'pending' && (
                                            <TableHead className="text-gray-700 font-semibold text-right">ACTIONS</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(activeTab === 'pending' ? pendingPayments : allPayments).map((payment) => (
                                        <TableRow
                                            key={payment._id}
                                            className="border-gray-200 hover:bg-green-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <span className="text-sm font-mono text-gray-700">
                                                    {payment.billNumber || '—'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-lg px-3 py-1">
                                                    {payment.tableNumber}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                                                            {(payment.customerName || "Guest")
                                                                .split(" ")
                                                                .map((n) => n.charAt(0))
                                                                .slice(0, 2)
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="text-gray-900 font-medium text-sm">
                                                            {payment.customerName || "Guest"}
                                                        </span>
                                                        {payment.customerPhone && (
                                                            <p className="text-xs text-gray-500">{payment.customerPhone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                    {payment.orderCount} {payment.orderCount === 1 ? 'order' : 'orders'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-gray-900 font-bold text-lg">
                                                ₹{payment.total?.toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                {getStatusBadge(payment.billingStatus)}
                                            </TableCell>

                                            <TableCell className="text-gray-600 text-sm">
                                                {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>

                                            {activeTab === 'pending' && (
                                                <TableCell className="text-right">
                                                    <Button
                                                        onClick={() => handleMarkAsPaid(payment._id)}
                                                        disabled={processingId === payment._id}
                                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                                                    >
                                                        {processingId === payment._id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                Mark as Paid
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
