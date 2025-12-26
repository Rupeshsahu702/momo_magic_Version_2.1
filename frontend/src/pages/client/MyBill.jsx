/**
 * MyBill Page - Displays consolidated bill for the current session.
 * Shows all orders placed during this visit with totals.
 */
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Receipt,
    Clock,
    CheckCircle2,
    CreditCard,
    AlertCircle,
    Loader2,
    ArrowLeft,
    History
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext.jsx";
import { useSocket } from "@/context/SocketContext.jsx";
import CustomerAuthContext from "@/context/CustomerAuthContext.jsx";
import { requestPayment, getConsolidatedBill, getBillRecord } from "@/services/orderService";
import { toast } from "sonner";
import Bill from "@/components/client/Bill.jsx";

const MyBill = () => {
    const { sessionId, orderHistory, fetchSessionOrders, endSession } = useCart();
    const { socket } = useSocket();
    const authContext = useContext(CustomerAuthContext);
    const phone = authContext?.customer?.phone || null;
    const [isLoading, setIsLoading] = useState(true);
    const [billingStatus, setBillingStatus] = useState('unpaid');
    const [showBillModal, setShowBillModal] = useState(false);
    const [consolidatedBillData, setConsolidatedBillData] = useState(null);
    const [billRecord, setBillRecord] = useState(null);

    // Fetch orders and bill record on mount
    useEffect(() => {
        const loadOrders = async () => {
            if (!sessionId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const orders = await fetchSessionOrders();

                // Try to fetch the Bill record from database
                try {
                    const billResponse = await getBillRecord(sessionId);
                    if (billResponse.success && billResponse.data) {
                        setBillRecord(billResponse.data);
                        setBillingStatus(billResponse.data.billingStatus || 'unpaid');
                    }
                } catch {
                    // No bill record yet - get status from orders
                    if (orders && orders.length > 0) {
                        const firstOrderStatus = orders[0]?.billingStatus || 'unpaid';
                        setBillingStatus(firstOrderStatus);
                    }
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [sessionId, fetchSessionOrders]);

    // Listen for billing status updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        const handleBillingStatusUpdate = (data) => {
            if (data.sessionId === sessionId) {
                setBillingStatus(data.billingStatus);
                if (data.billingStatus === 'paid') {
                    toast.success('Your payment has been received! Thank you for dining with us.');
                    // End the session so new orders start fresh billing cycle
                    // Delay slightly to allow UI to update before clearing state
                    setTimeout(() => endSession(), 3000);
                }
            }
        };

        socket.on('billing:statusUpdate', handleBillingStatusUpdate);

        return () => {
            socket.off('billing:statusUpdate', handleBillingStatusUpdate);
        };
    }, [socket, sessionId]);

    // Calculate totals from order history
    const calculateSessionTotals = () => {
        const activeOrders = orderHistory.filter(
            order => order.status !== 'CANCELLED'
        );

        const subtotal = activeOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
        const tax = activeOrders.reduce((sum, order) => sum + (order.tax || 0), 0);
        const total = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        return { subtotal, tax, total, orderCount: activeOrders.length };
    };

    const { subtotal, tax, total, orderCount } = calculateSessionTotals();

    // Handle view consolidated bill
    const handleViewBill = () => {
        // Use bill record data if available, otherwise compute from orders
        if (billRecord) {
            const billData = {
                orderNumber: billRecord.billNumber,
                date: new Date(billRecord.createdAt).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                }),
                time: new Date(billRecord.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                items: billRecord.items,
                subtotal: billRecord.subtotal,
                tax: billRecord.tax,
                total: billRecord.total,
                barcode: billRecord.billNumber,
            };
            setConsolidatedBillData(billData);
        } else {
            // Fallback: compute from orders
            const allItems = orderHistory
                .filter(order => order.status !== 'CANCELLED')
                .flatMap(order => order.items || []);

            const billData = {
                orderNumber: "SESSION",
                date: new Date().toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                }),
                time: new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                items: allItems,
                subtotal,
                tax,
                total,
                barcode: `SESSION-${sessionId?.slice(-8) || Date.now()}`,
            };
            setConsolidatedBillData(billData);
        }
        setShowBillModal(true);
    };

    // Handle pay bill request
    const handlePayBill = async () => {
        if (!sessionId) {
            toast.error('No active session found');
            return;
        }

        try {
            await requestPayment(sessionId);
            toast.success('Payment request sent! A staff member will assist you shortly.');
            setBillingStatus('pending_payment');
        } catch (error) {
            console.error('Error requesting payment:', error);
            toast.error('Failed to send payment request. Please try again.');
            throw error;
        }
    };

    // Get billing status badge
    const getBillingStatusBadge = () => {
        switch (billingStatus) {
            case 'paid':
                return (
                    <Badge className="bg-green-500 text-white px-4 py-2 text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        PAID
                    </Badge>
                );
            case 'pending_payment':
                return (
                    <Badge className="bg-orange-500 text-white px-4 py-2 text-sm flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        AWAITING PAYMENT
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-red-500 text-white px-4 py-2 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        UNPAID
                    </Badge>
                );
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#fafafa] px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Back Button */}
                    <Link to="/">
                        <Button
                            variant="ghost"
                            className="mb-6 text-sm text-[#6b7280] hover:text-[#ff7a3c]"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Menu
                        </Button>
                    </Link>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a]">My Bill</h1>
                        <p className="text-sm text-[#ff7a3c]">
                            View your session bill and request payment
                        </p>
                        {phone && (
                            <Link to="/previous-orders">
                                <Button variant="outline" className="mt-3 text-[#ff7a3c] border-[#ff7a3c] hover:bg-orange-50">
                                    <History className="mr-2 h-4 w-4" />
                                    View Order History
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3c]" />
                            <span className="ml-2 text-[#6b7280]">Loading your bill...</span>
                        </div>
                    ) : !sessionId || orderHistory.length === 0 ? (
                        /* No Orders State */
                        <Card className="border-none shadow-md">
                            <CardContent className="py-16 text-center">
                                <Receipt className="mx-auto h-16 w-16 text-[#9ca3af] mb-4" />
                                <p className="text-lg text-[#6b7280]">No orders in this session</p>
                                <p className="mt-2 text-sm text-[#9ca3af]">
                                    Place an order to see your bill here
                                </p>
                                <Link to="/menu">
                                    <Button className="mt-6 rounded-full bg-[#ff7a3c] hover:bg-[#ff6825]">
                                        Browse Menu
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Bill Content */
                        <div className="space-y-6">
                            {/* Session Summary Card */}
                            <Card className="border-none shadow-md overflow-hidden">
                                <div className="bg-gradient-to-r from-[#ff7a3c] to-[#ff9a5c] p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-90">Session Total</p>
                                            <p className="text-4xl font-bold">₹{total.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium opacity-90">{orderCount} Order(s)</p>
                                            {getBillingStatusBadge()}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#6b7280]">Subtotal</span>
                                            <span className="font-semibold text-[#1a1a1a]">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#6b7280]">Tax (8%)</span>
                                            <span className="font-semibold text-[#1a1a1a]">₹{tax.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-lg font-bold text-[#1a1a1a]">Total</span>
                                            <span className="text-lg font-bold text-[#ff7a3c]">₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Individual Orders */}
                            <div>
                                <h2 className="mb-4 text-xl font-bold text-[#1a1a1a]">Orders in this Session</h2>
                                <div className="space-y-4">
                                    {orderHistory.map((order) => (
                                        <Card key={order.id} className="border-none shadow-sm">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe7cc]">
                                                            <Receipt className="h-5 w-5 text-[#ff7a3c]" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#1a1a1a]">Order #{order.orderNumber}</p>
                                                            <p className="text-xs text-[#6b7280]">{order.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-[#ff7a3c]">₹{order.total?.toFixed(2)}</p>
                                                        <Badge
                                                            className={`text-xs ${order.status === 'SERVED'
                                                                ? 'bg-green-100 text-green-700'
                                                                : order.status === 'CANCELLED'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-orange-100 text-orange-700'
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-[#6b7280]">
                                                    {order.items?.slice(0, 3).map((item, idx) => (
                                                        <span key={idx}>
                                                            {item.quantity}x {item.name}
                                                            {idx < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                    {order.items?.length > 3 && (
                                                        <span className="text-[#9ca3af]"> +{order.items.length - 3} more</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-4">
                                <Button
                                    size="lg"
                                    className="w-full rounded-full bg-[#ff7a3c] text-base font-bold hover:bg-[#ff6825]"
                                    onClick={handleViewBill}
                                >
                                    <Receipt className="mr-2 h-5 w-5" />
                                    View Full Bill
                                </Button>

                                {billingStatus !== 'paid' && (
                                    <Button
                                        size="lg"
                                        className={`w-full rounded-full font-bold ${billingStatus === 'pending_payment'
                                            ? 'bg-green-600 hover:bg-green-600 cursor-default'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                        onClick={handlePayBill}
                                        disabled={billingStatus === 'pending_payment'}
                                    >
                                        {billingStatus === 'pending_payment' ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Payment Request Sent!
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-5 w-5" />
                                                Request Payment
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bill Modal */}
            {showBillModal && consolidatedBillData && (
                <Bill
                    orderData={consolidatedBillData}
                    onClose={() => setShowBillModal(false)}
                    onPayBill={handlePayBill}
                    billingStatus={billingStatus}
                />
            )}
        </>
    );
};

export default MyBill;
