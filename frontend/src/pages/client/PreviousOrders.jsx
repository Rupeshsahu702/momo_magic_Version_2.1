/**
 * PreviousOrders Page - Displays customer's order and bill history.
 * Shows all previous orders and bills associated with the customer's phone number.
 */
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Receipt,
    ChevronDown,
    ChevronUp,
    Calendar,
    DollarSign,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomerAuthContext from "@/context/CustomerAuthContext";
import { getOrdersByPhone, getBillsByPhone } from "@/services/orderService";
import { toast } from "sonner";

const PreviousOrders = () => {
    const authContext = useContext(CustomerAuthContext);
    const phone = authContext?.customer?.phone || null;
    const [orders, setOrders] = useState([]);
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [expandedBill, setExpandedBill] = useState(null);
    const [activeTab, setActiveTab] = useState('bills'); // 'orders' or 'bills'

    // Fetch orders and bills on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!phone) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch orders
                const ordersResponse = await getOrdersByPhone(phone);
                if (ordersResponse.success) {
                    setOrders(ordersResponse.data || []);
                }

                // Fetch bills
                const billsResponse = await getBillsByPhone(phone);
                if (billsResponse.success) {
                    setBills(billsResponse.data || []);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
                toast.error('Failed to load order history');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [phone]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'served':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getBillingStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending_payment':
                return 'bg-orange-100 text-orange-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    <p className="text-gray-600">Loading your history...</p>
                </div>
            </div>
        );
    }

    if (!phone) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <Link to="/mybill" className="flex items-center gap-2 text-red-600 mb-6 hover:text-red-700">
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </Link>
                    <Card className="border-red-200">
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-600">Please log in to view your order history.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/mybill" className="text-red-600 hover:text-red-700">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Your Order History</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('bills')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'bills'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Receipt className="h-5 w-5 inline mr-2" />
                        Bills ({bills.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'orders'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Orders ({orders.length})
                    </button>
                </div>

                {/* Bills Tab */}
                {activeTab === 'bills' && (
                    <div className="space-y-4">
                        {bills.length === 0 ? (
                            <Card className="border-red-200">
                                <CardContent className="pt-6">
                                    <p className="text-center text-gray-500">No bills found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            bills.map((bill) => (
                                <Card key={bill._id} className="border-red-200 overflow-hidden">
                                    <div
                                        className="p-4 bg-gradient-to-r from-orange-50 to-red-50 cursor-pointer hover:from-orange-100 hover:to-red-100 transition-colors"
                                        onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{bill.billNumber}</h3>
                                                    <Badge className={getBillingStatusColor(bill.billingStatus)}>
                                                        {bill.billingStatus}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(bill.createdAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        ₹{bill.total.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                                {expandedBill === bill._id ? (
                                                    <ChevronUp className="h-6 w-6 text-red-600" />
                                                ) : (
                                                    <ChevronDown className="h-6 w-6 text-red-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Bill Details */}
                                    {expandedBill === bill._id && (
                                        <>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="space-y-3">
                                                    {bill.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-start py-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="font-semibold text-gray-900">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    <Separator className="my-2" />
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Subtotal:</span>
                                                            <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Tax:</span>
                                                            <span className="font-medium">₹{bill.tax.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-base font-bold text-red-600 mt-2">
                                                            <span>Total:</span>
                                                            <span>₹{bill.total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <Card className="border-red-200">
                                <CardContent className="pt-6">
                                    <p className="text-center text-gray-500">No orders found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            orders.map((order) => (
                                <Card key={order._id} className="border-red-200 overflow-hidden">
                                    <div
                                        className="p-4 bg-gradient-to-r from-orange-50 to-red-50 cursor-pointer hover:from-orange-100 hover:to-red-100 transition-colors"
                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(order.createdAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        ₹{order.total.toFixed(2)}
                                                    </span>
                                                    {order.estimatedTime && (
                                                        <span className="text-gray-500">Est: {order.estimatedTime}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                                {expandedOrder === order._id ? (
                                                    <ChevronUp className="h-6 w-6 text-red-600" />
                                                ) : (
                                                    <ChevronDown className="h-6 w-6 text-red-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {expandedOrder === order._id && (
                                        <>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-start py-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="font-semibold text-gray-900">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    <Separator className="my-2" />
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Subtotal:</span>
                                                            <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Tax:</span>
                                                            <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-base font-bold text-red-600 mt-2">
                                                            <span>Total:</span>
                                                            <span>₹{order.total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviousOrders;
