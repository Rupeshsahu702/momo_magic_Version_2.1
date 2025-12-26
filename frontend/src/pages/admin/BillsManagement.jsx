/**
 * BillsManagement Page - Admin view for all bills and billing history.
 * Displays all customer bills with filtering, search, and payment management.
 */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Receipt,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Download,
    MoreVertical,
    CheckCircle2,
    Clock,
    Loader2,
    Printer
} from "lucide-react";
import { getAllBills, updateBillingStatus } from "@/services/orderService";
import { toast } from "sonner";

const BillsManagement = () => {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBill, setExpandedBill] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedBill, setSelectedBill] = useState(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    // Fetch bills on mount
    useEffect(() => {
        fetchBills();
    }, [filterStatus]);

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const filters = {};
            if (filterStatus !== "all") {
                filters.status = filterStatus;
            }
            const response = await getAllBills(filters);
            if (response.success) {
                setBills(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
            toast.error("Failed to load bills");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = async (bill) => {
        setSelectedBill(bill);
        setIsPaymentDialogOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        try {
            const response = await updateBillingStatus(
                selectedBill.sessionId,
                "paid",
                paymentMethod
            );

            if (response.success) {
                toast.success("Bill marked as paid");
                setIsPaymentDialogOpen(false);
                setPaymentMethod("");
                // Update bill in local state
                setBills(bills.map(b =>
                    b._id === selectedBill._id
                        ? { ...b, billingStatus: "paid", paidAt: new Date() }
                        : b
                ));
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error("Failed to update payment status");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getBillingStatusColor = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800";
            case "pending_payment":
                return "bg-orange-100 text-orange-800";
            case "unpaid":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Filter bills
    const filteredBills = bills.filter((bill) => {
        const matchesSearch = (
            bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.customerPhone?.includes(searchQuery)
        );
        return matchesSearch;
    });

    // Sort bills
    const sortedBills = [...filteredBills].sort((a, b) => {
        switch (sortBy) {
            case "recent":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest":
                return new Date(a.createdAt) - new Date(b.createdAt);
            case "amount_high":
                return b.total - a.total;
            case "amount_low":
                return a.total - b.total;
            default:
                return 0;
        }
    });

    // Calculate statistics
    const stats = {
        totalBills: bills.length,
        paidBills: bills.filter(b => b.billingStatus === "paid").length,
        pendingBills: bills.filter(b => b.billingStatus === "pending_payment").length,
        unpaidBills: bills.filter(b => b.billingStatus === "unpaid").length,
        totalAmount: bills.reduce((sum, b) => sum + b.total, 0),
        paidAmount: bills.filter(b => b.billingStatus === "paid").reduce((sum, b) => sum + b.total, 0),
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    <p className="text-gray-600">Loading bills...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-red-600" />
                        Bills Management
                    </h1>
                    <p className="text-gray-600 mt-1">View and manage all customer bills</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Total Bills</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalBills}</p>
                            <p className="text-sm text-gray-500">₹{stats.totalAmount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Paid Bills</p>
                            <p className="text-3xl font-bold text-green-600">{stats.paidBills}</p>
                            <p className="text-sm text-green-600">₹{stats.paidAmount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Pending Payment</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.pendingBills}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Unpaid Bills</p>
                            <p className="text-3xl font-bold text-red-600">{stats.unpaidBills}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search by bill number, customer name, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Bills</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="amount_high">Highest Amount</SelectItem>
                        <SelectItem value="amount_low">Lowest Amount</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bills List */}
            <div className="space-y-4">
                {sortedBills.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="pt-6 text-center">
                            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No bills found</p>
                        </CardContent>
                    </Card>
                ) : (
                    sortedBills.map((bill) => (
                        <Card key={bill._id} className="overflow-hidden">
                            <div
                                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                                onClick={() =>
                                    setExpandedBill(expandedBill === bill._id ? null : bill._id)
                                }
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-gray-900">{bill.billNumber}</h3>
                                        <Badge className={getBillingStatusColor(bill.billingStatus)}>
                                            {bill.billingStatus === "paid" && (
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                            )}
                                            {bill.billingStatus === "pending_payment" && (
                                                <Clock className="h-3 w-3 mr-1" />
                                            )}
                                            {bill.billingStatus}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                        <div>
                                            <p className="text-xs text-gray-500">Customer</p>
                                            <p className="font-medium text-gray-900">{bill.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{bill.customerPhone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(bill.createdAt).split(',')[0]}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="font-bold text-red-600">₹{bill.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    {expandedBill === bill._id ? (
                                        <ChevronUp className="h-6 w-6 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="h-6 w-6 text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Expanded Bill Details */}
                            {expandedBill === bill._id && (
                                <CardContent className="pt-6 border-t">
                                    <div className="space-y-4">
                                        {/* Items */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Items Ordered</h4>
                                            <div className="space-y-2">
                                                {bill.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between items-start pb-2 border-b"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-medium">₹{bill.tax.toFixed(2)}</span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between font-bold text-red-600">
                                                <span>Total:</span>
                                                <span>₹{bill.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => window.print()}
                                            >
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print
                                            </Button>
                                            {bill.billingStatus !== "paid" && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleMarkAsPaid(bill)}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Mark as Paid
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Bill as Paid</DialogTitle>
                        <DialogDescription>
                            Bill: {selectedBill?.billNumber} - ₹{selectedBill?.total.toFixed(2)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsPaymentDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleConfirmPayment}
                        >
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BillsManagement;
