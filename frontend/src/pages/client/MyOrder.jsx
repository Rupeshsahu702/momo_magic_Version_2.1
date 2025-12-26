/**
 * MyOrder Page - Displays customer's order history with real-time status updates.
 * Listens to WebSocket events for live status synchronization.
 */
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle2, XCircle, RotateCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext.jsx";
import { useSocket } from "@/context/SocketContext.jsx";
import CustomerAuthContext from "@/context/CustomerAuthContext";
import { requestPayment, getOrdersByPhone } from "@/services/orderService";
import { toast } from "sonner";
import Bill from "@/components/client/Bill.jsx";
import placeholderImg from "@/assets/steam-1.png";

const MyOrder = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { orderHistory, updateOrderStatus, sessionId, fetchSessionOrders, endSession } = useCart();
  const { socket } = useSocket();
  const authContext = useContext(CustomerAuthContext);
  const customerPhone = authContext?.customer?.phone || null;
  const [showBill, setShowBill] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billingStatus, setBillingStatus] = useState('unpaid');
  const [isLoading, setIsLoading] = useState(true);
  const [historicalOrders, setHistoricalOrders] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch orders from server when component mounts or session changes
  useEffect(() => {
    const loadOrders = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const orders = await fetchSessionOrders();

        // Get billing status from the first order (all orders in session share the same status)
        if (orders && orders.length > 0) {
          const firstOrderStatus = orders[0]?.billingStatus || 'unpaid';
          setBillingStatus(firstOrderStatus);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders. Showing cached data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [sessionId, fetchSessionOrders]);

  // Fetch historical orders when customer is authenticated
  useEffect(() => {
    const loadHistoricalOrders = async () => {
      if (!customerPhone) {
        setHistoricalOrders([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const response = await getOrdersByPhone(customerPhone);
        if (response.success) {
          // Filter out orders from current session to avoid duplicates
          const pastOrders = (response.data || []).filter(
            order => order.sessionId !== sessionId
          );
          setHistoricalOrders(pastOrders);
        }
      } catch (error) {
        console.error('Error loading historical orders:', error);
        // Silently fail - historical orders are supplementary data
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoricalOrders();
  }, [customerPhone, sessionId]);

  // Listen for real-time order status updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (updatedOrder) => {
      // Update order status in local state when receiving WebSocket event
      updateOrderStatus(updatedOrder._id, updatedOrder.status);
    };

    // Listen for billing status updates from admin
    const handleBillingStatusUpdate = (data) => {
      console.log('Billing status updated:', data);
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

    socket.on('order:statusUpdate', handleStatusUpdate);
    socket.on('billing:statusUpdate', handleBillingStatusUpdate);

    return () => {
      socket.off('order:statusUpdate', handleStatusUpdate);
      socket.off('billing:statusUpdate', handleBillingStatusUpdate);
    };
  }, [socket, updateOrderStatus, sessionId]);

  // Handle view bill click
  const handleViewBill = (order) => {
    const billData = {
      orderNumber: order.orderNumber,
      date: order.fullDate,
      time: order.time,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      barcode: order.barcode,
    };
    setSelectedOrder(billData);
    setShowBill(true);
  };

  /**
   * Handle pay bill request - sends notification to admin.
   * Called when customer clicks "Pay Bill" in the Bill modal.
   */
  const handlePayBill = async () => {
    if (!sessionId) {
      toast.error('No active session found');
      return;
    }

    try {
      await requestPayment(sessionId);
      toast.success('Payment request sent! A staff member will assist you shortly.');
    } catch (error) {
      console.error('Error requesting payment:', error);
      toast.error('Failed to send payment request. Please try again.');
      throw error;
    }
  };

  // Filter orders - include both PENDING and PREPARING in active orders
  const inProgressOrders = orderHistory.filter(
    (order) => order.status === "PREPARING" || order.status === "PENDING"
  );
  const completedOrders = orderHistory.filter(
    (order) => order.status === "SERVED" || order.status === "CANCELLED"
  );

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a]">My Orders</h1>
            <p className="text-sm text-[#ff7a3c]">
              Welcome back! Hungry for more momos?
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3c]" />
              <span className="ml-2 text-[#6b7280]">Loading your orders...</span>
            </div>
          ) : (
            /* Tabs */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="mb-8 inline-flex h-auto gap-6 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="relative rounded-2xl border-b-2 border-transparent bg-transparent px-4 pb-2 text-sm font-semibold text-[#6b7280] data-[state=active]:border-[#ff7a3c] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-none"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="relative rounded-2xl border-b-2 border-transparent bg-transparent px-4 pb-2 text-sm font-semibold text-[#6b7280] data-[state=active]:border-[#ff7a3c] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-none"
                >
                  Active ({inProgressOrders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="relative rounded-2xl border-b-2 border-transparent bg-transparent px-4 pb-2 text-sm font-semibold text-[#6b7280] data-[state=active]:border-[#ff7a3c] data-[state=active]:text-[#1a1a1a] data-[state=active]:shadow-none"
                >
                  Past
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {orderHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-lg text-[#6b7280]">No orders yet</p>
                    <p className="mt-2 text-sm text-[#9ca3af]">
                      Start ordering some delicious momos!
                    </p>
                  </div>
                ) : (
                  <AllOrdersContent
                    inProgressOrders={inProgressOrders}
                    completedOrders={completedOrders}
                    onViewBill={handleViewBill}
                  />
                )}
              </TabsContent>

              <TabsContent value="active">
                {inProgressOrders.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-lg text-[#6b7280]">No active orders</p>
                  </div>
                ) : (
                  <ActiveOrdersContent
                    orders={inProgressOrders}
                    onViewBill={handleViewBill}
                  />
                )}
              </TabsContent>

              <TabsContent value="past">
                {isLoadingHistory ? (
                  <div className="py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#ff7a3c] mx-auto" />
                    <p className="mt-2 text-sm text-[#6b7280]">Loading order history...</p>
                  </div>
                ) : (
                  <PastOrdersContent
                    orders={completedOrders}
                    historicalOrders={historicalOrders}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Bill Modal */}
      {showBill && selectedOrder && (
        <Bill
          orderData={selectedOrder}
          onClose={() => setShowBill(false)}
          onPayBill={handlePayBill}
          billingStatus={billingStatus}
        />
      )}
    </>
  );
};

// All Orders Content
const AllOrdersContent = ({ inProgressOrders, completedOrders, onViewBill }) => {
  console.log("AllOrders images:", inProgressOrders.map((o) => o.image));
  return (
    <div className="space-y-8 ">
      {/* In Progress Section */}
      {inProgressOrders.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#ff7a3c]" />
            <h2 className="text-xl font-bold text-[#1a1a1a]">In Progress</h2>
          </div>

          <div className="space-y-4">
            {inProgressOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden rounded-3xl border-none p-0 shadow-lg"
              >
                <CardContent className="relative p-0">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                    <img
                      src={order.image || placeholderImg}
                      alt={`Order ${order.orderNumber}`}
                      className="h-full w-full object-cover opacity-80"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = placeholderImg;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                      <div className="flex items-start justify-between">
                        <Badge className="rounded-full bg-[#ff7a3c] px-3 py-1 text-xs font-bold uppercase text-white hover:bg-[#ff7a3c]">
                          🍳 {order.status}
                        </Badge>
                        <span className="text-sm font-medium text-white">
                          {order.date}
                        </span>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                          ORDER #{order.orderNumber}
                        </p>
                        <h3 className="mb-2 text-xl font-bold leading-tight text-white">
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join(", ")}
                        </h3>
                        <p className="mb-4 text-sm font-semibold text-white">
                          Total: ₹{order.total.toFixed(2)}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="rounded-full bg-[#ff7a3c] px-6 text-sm font-bold hover:bg-[#ff6825]"
                          >
                            Track Order Status
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full border-white bg-transparent text-sm font-bold text-white hover:bg-white/10 hover:text-white"
                            onClick={() => onViewBill(order)}
                          >
                            View Bill
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent History Section */}
      {completedOrders.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <RotateCw className="h-5 w-5 text-[#6b7280]" />
            <h2 className="text-xl font-bold text-[#1a1a1a]">Recent History</h2>
          </div>

          <div className="space-y-4">
            {completedOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                      <img
                        src={order.image}
                        alt={order.orderNumber}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Badge className="rounded-full border-green-600 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 hover:bg-green-50">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {order.status}
                          </Badge>
                          <span className="text-xs text-[#9ca3af]">
                            {order.date}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#1a1a1a]">
                          {order.items[0]?.name} Combo
                        </h3>
                        <p className="text-xs text-[#6b7280]">
                          Order #{order.orderNumber} • {order.itemCount} items
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <span className="text-lg font-bold text-[#1a1a1a]">
                        ₹{order.total.toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full border-[#e0e0e0] px-4 text-xs font-semibold hover:border-[#ff7a3c] hover:text-[#ff7a3c]"
                          onClick={() => onViewBill(order)}
                        >
                          View Bill
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 rounded-full bg-[#ff7a3c] px-4 text-xs font-bold hover:bg-[#ff6825]"
                        >
                          <RotateCw className="mr-1 h-3 w-3" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Aggregate Total Button */}
      {(inProgressOrders.length > 0 || completedOrders.length > 0) && (
        <div className="mt-6 flex justify-center">
          <Button
            size="sm"
            className="rounded-full bg-[#ff7a3c] px-7 py-7 text-sm font-bold hover:bg-[#ff6825]"
            onClick={() => {
              const allOrders = [...inProgressOrders, ...completedOrders];
              const subtotal = allOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
              const tax = allOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
              const total = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
              const items = allOrders.flatMap((o) => o.items || []);
              const aggOrder = {
                orderNumber: "ALL",
                fullDate: new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "2-digit",
                }),
                time: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }),
                items,
                subtotal,
                tax,
                total,
                barcode: `ALL-${Date.now()}`,
              };

              onViewBill(aggOrder);
            }}
          >
            View Total Bill : ₹{(
              (inProgressOrders.concat(completedOrders).reduce((s, o) => s + (o.total || 0), 0))
            ).toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
};

// Active Orders Content
const ActiveOrdersContent = ({ orders, onViewBill }) => {
  console.log("ActiveOrders images:", orders.map((o) => o.image));
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#ff7a3c]" />
        <h2 className="text-xl font-bold text-[#1a1a1a]">In Progress</h2>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden rounded-3xl border-none p-0 shadow-lg"
          >
            <CardContent className="relative p-0">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                <img
                  src={order.image || placeholderImg}
                  alt={`Order ${order.orderNumber}`}
                  className="h-full w-full object-cover opacity-80"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholderImg;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <Badge className="rounded-full bg-[#ff7a3c] px-3 py-1 text-xs font-bold uppercase text-white hover:bg-[#ff7a3c]">
                      🍳 {order.status}
                    </Badge>
                    <span className="text-sm font-medium text-white">
                      {order.date}
                    </span>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                      ORDER #{order.orderNumber}
                    </p>
                    <h3 className="mb-2 text-xl font-bold leading-tight text-white">
                      {order.items
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ")}
                    </h3>
                    <p className="mb-4 text-sm font-semibold text-white">
                      Total: ₹{order.total.toFixed(2)}
                    </p>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="rounded-full bg-[#ff7a3c] px-6 text-sm font-bold hover:bg-[#ff6825]"
                      >
                        Track Order Status
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-white bg-transparent text-sm font-bold text-white hover:bg-white/10 hover:text-white"
                        onClick={() => onViewBill(order)}
                      >
                        View Bill
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Past Orders Content - Shows order details directly without View Bill button
const PastOrdersContent = ({ orders, historicalOrders = [] }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Combine current session completed orders with historical orders
  // Remove duplicates based on order ID
  const allPastOrders = [...orders];

  // Add historical orders that aren't already in the current session
  historicalOrders.forEach(histOrder => {
    if (!allPastOrders.find(o => o.id === histOrder._id)) {
      // Transform historical order to match the format of current session orders
      allPastOrders.push({
        id: histOrder._id,
        orderNumber: histOrder.orderNumber,
        status: histOrder.status.toUpperCase(),
        date: new Date(histOrder.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        fullDate: new Date(histOrder.createdAt).toLocaleDateString(),
        time: new Date(histOrder.createdAt).toLocaleTimeString(),
        items: histOrder.items,
        itemCount: histOrder.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: histOrder.subtotal,
        tax: histOrder.tax,
        total: histOrder.total,
        image: histOrder.items[0]?.imageLink || placeholderImg,
        barcode: histOrder.orderNumber
      });
    }
  });

  // Sort by date (newest first)
  allPastOrders.sort((a, b) => {
    const dateA = new Date(a.fullDate || a.date);
    const dateB = new Date(b.fullDate || b.date);
    return dateB - dateA;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'served') {
      return (
        <Badge className="rounded-full border-green-600 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 hover:bg-green-50">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    }
    if (statusLower === 'cancelled') {
      return (
        <Badge className="rounded-full border-red-600 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50">
          <XCircle className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full border-gray-600 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {allPastOrders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-[#6b7280]">No past orders yet</p>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Your completed orders will appear here
          </p>
        </div>
      ) : (
        allPastOrders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                  <img
                    src={order.image || placeholderImg}
                    alt={order.orderNumber}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholderImg;
                    }}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-[#9ca3af]">{order.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#1a1a1a]">
                      {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                    </h3>
                    <p className="text-xs text-[#6b7280]">
                      Order #{order.orderNumber} • {order.itemCount} items
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className="text-lg font-bold text-[#1a1a1a]">
                    ₹{order.total.toFixed(2)}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-5 w-5 text-[#ff7a3c]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#ff7a3c]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder === order.id && (
              <>
                <Separator />
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    {/* Price Breakdown */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#ff7a3c] mt-2 pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Reorder Button */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        className="w-full rounded-full bg-[#ff7a3c] px-4 text-sm font-bold hover:bg-[#ff6825]"
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Reorder These Items
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default MyOrder;
