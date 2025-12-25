/**
 * OrderManagement Page - Admin panel for managing customer orders.
 * Features real-time WebSocket updates, sticky notes for pending orders, and order status management.
 */
import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
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
  Settings,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import NewOrderNotification from "@/components/admin/NewOrderNotification";
import PaymentRequestNotification from "@/components/admin/PaymentRequestNotification";
import StickyOrderNotes from "@/components/admin/StickyOrderNotes";
import PreparingOrderNotes from "@/components/admin/PreparingOrderNotes";
import AdminSidebar from "@/components/admin/Sidebar";
import { useSocket } from "@/context/SocketContext";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import defaultAvatar from "@/assets/default-avatar.svg";
import { toast } from "sonner";

export default function OrderManagement() {
  const [showNotification, setShowNotification] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // Payment request notification state
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [showPaymentNotification, setShowPaymentNotification] = useState(false);

  // Fetch orders from API on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Join admin room and listen for WebSocket events
  useEffect(() => {
    if (!socket) return;

    // Join admin room to receive new order notifications
    socket.emit('admin:join');

    // Listen for new orders
    const handleNewOrder = (newOrder) => {
      console.log('New order received:', newOrder);
      setOrdersData((prev) => [newOrder, ...prev]);

      // Show notification popup for new orders
      setCurrentOrder(newOrder);
      setShowNotification(true);

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
      } catch {
        // Audio playback not critical - browser may block auto-play
      }
    };

    // Listen for status updates
    const handleStatusUpdate = (updatedOrder) => {
      console.log('Order status updated:', updatedOrder);
      setOrdersData((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    // Listen for order deletions
    const handleOrderDeleted = ({ id }) => {
      setOrdersData((prev) => prev.filter((order) => order._id !== id));
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:statusUpdate', handleStatusUpdate);
    socket.on('order:deleted', handleOrderDeleted);

    // Listen for payment requests from customers
    const handlePaymentRequest = (data) => {
      console.log('Payment request received:', data);
      setPaymentRequest(data);
      setShowPaymentNotification(true);

      // Play notification sound for payment requests
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => { });
      } catch {
        // Audio playback not critical
      }

      // Also show a toast for visibility
      toast.info(
        `Table ${data.tableNumber} is ready to pay - ₹${data.total?.toFixed(2)}`,
        { duration: 10000 }
      );
    };

    socket.on('payment:request', handlePaymentRequest);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:statusUpdate', handleStatusUpdate);
      socket.off('order:deleted', handleOrderDeleted);
      socket.off('payment:request', handlePaymentRequest);
    };
  }, [socket]);

  // Fetch all orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrders();
      setOrdersData(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change via API
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // The WebSocket event will update the UI automatically
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Accept order from sticky note (changes status to preparing)
  const handleAcceptOrder = async (order) => {
    await handleStatusChange(order._id, 'preparing');
    setShowNotification(false);
  };

  // Cancel order from sticky note
  const handleCancelOrder = async (order) => {
    await handleStatusChange(order._id, 'cancelled');
    setShowNotification(false);
  };

  // View order details
  const handleViewOrder = (order) => {
    console.log("View order:", order);
    setShowNotification(false);
  };

  const handleClose = () => {
    setShowNotification(false);
  };

  // Handle payment request acknowledgment
  const handlePaymentAcknowledge = (request) => {
    console.log('Payment acknowledged for table:', request.tableNumber);
    toast.success(`Payment acknowledged for Table ${request.tableNumber}`);
    setShowPaymentNotification(false);
  };

  const handlePaymentNotificationClose = () => {
    setShowPaymentNotification(false);
  };

  // Get pending orders for sticky notes
  const pendingOrders = ordersData.filter((order) => order.status === 'pending');

  // Get preparing orders for kitchen sticky notes
  const preparingOrders = ordersData.filter((order) => order.status === 'preparing');

  // Mark order as served (called from PreparingOrderNotes)
  const handleMarkAsServed = async (order) => {
    await handleStatusChange(order._id, 'served');
  };

  // Filter counts
  const filterCounts = {
    all: ordersData.length,
    pending: ordersData.filter((o) => o.status === "pending").length,
    preparing: ordersData.filter((o) => o.status === "preparing").length,
    served: ordersData.filter((o) => o.status === "served").length,
    cancelled: ordersData.filter((o) => o.status === "cancelled").length,
  };

  // Status badge styling with lucide icons
  const getStatusBadge = (status) => {
    const statusConfig = {
      preparing: {
        label: "Preparing",
        className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: Flame,
      },
      served: {
        label: "Served",
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: XCircle,
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: Clock,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={config.className}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  // Filter buttons
  const filters = [
    { key: "all", label: "All Orders", icon: null, count: filterCounts.all },
    { key: "pending", label: "Pending", icon: Clock, count: filterCounts.pending },
    { key: "preparing", label: "Preparing", icon: Flame, count: filterCounts.preparing },
    { key: "served", label: "Served", icon: CheckCircle, count: filterCounts.served },
    { key: "cancelled", label: "Cancelled", icon: XCircle, count: filterCounts.cancelled },
  ];

  // Filter and search orders (exclude pending for table view, they're in sticky notes)
  const filteredOrders = ordersData.filter((order) => {
    const matchesFilter = activeFilter === "all" || order.status === activeFilter;
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Format time ago
  const getTimeAgo = (dateInput) => {
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
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
              <p className="text-sm text-gray-600">
                Manage and track customer orders in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-orange-500"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by Order ID or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-500 relative">
              <Bell className="h-5 w-5" />
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingOrders.length}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-500">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Sticky Notes for Pending Orders */}
          <StickyOrderNotes
            orders={pendingOrders}
            onAccept={handleAcceptOrder}
            onCancel={handleCancelOrder}
            onView={handleViewOrder}
          />

          {/* Sticky Notes for Preparing Orders (Kitchen View) */}
          <PreparingOrderNotes
            orders={preparingOrders}
            onMarkServed={handleMarkAsServed}
            onView={handleViewOrder}
          />

          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {filters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "ghost"}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`${activeFilter === filter.key
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                    }`}
                >
                  {filter.icon && <filter.icon className="h-4 w-4 mr-2" />}
                  {filter.label}
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-orange-100 text-orange-700"
                  >
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Filters Button */}
              <Button variant="outline" className="border-orange-300 text-gray-700 hover:bg-orange-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-orange-50/50 bg-orange-50">
                      <TableHead className="text-gray-700 font-semibold">ORDER ID</TableHead>
                      <TableHead className="text-gray-700 font-semibold">TABLE NO.</TableHead>
                      <TableHead className="text-gray-700 font-semibold">CUSTOMER</TableHead>
                      <TableHead className="text-gray-700 font-semibold">MENU ITEMS</TableHead>
                      <TableHead className="text-gray-700 font-semibold">TOTAL</TableHead>
                      <TableHead className="text-gray-700 font-semibold">STATUS</TableHead>
                      <TableHead className="text-gray-700 font-semibold">DATE & TIME</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">
                        TIME AGO
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="border-gray-200 hover:bg-orange-100/50 cursor-pointer transition-colors"
                        >
                          <TableCell className="font-medium text-orange-600">
                            #{order.orderNumber}
                          </TableCell>

                          {/* Table Number */}
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                                Table {order.tableNumber || "N/A"}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={defaultAvatar} />
                                <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                                  {(order.customerName || "Guest")
                                    .split(" ")
                                    .map((n) => n.charAt(0))
                                    .slice(0, 2)
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-900 font-medium">
                                {order.customerName || "Guest"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Menu Items */}
                          <TableCell>
                            <div className="space-y-1 max-w-xs">
                              {order.items && order.items.length > 0 ? (
                                order.items.slice(0, 3).map((item, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                                      {item.quantity}x
                                    </Badge>
                                    <span className="text-gray-700">{item.name}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No items</span>
                              )}
                              {order.items && order.items.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{order.items.length - 3} more items
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-900 font-semibold">
                            ₹{order.total?.toFixed(2)}
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="border-0 cursor-pointer">
                                  {getStatusBadge(order.status)}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order._id, "pending")}
                                  className={order.status === "pending" ? "bg-yellow-50" : ""}
                                >
                                  <Clock className="h-4 w-4 mr-2 text-yellow-700" />
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order._id, "preparing")}
                                  className={order.status === "preparing" ? "bg-orange-50" : ""}
                                >
                                  <Flame className="h-4 w-4 mr-2 text-orange-700" />
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Preparing</Badge>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order._id, "served")}
                                  className={order.status === "served" ? "bg-green-50" : ""}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-700" />
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Served</Badge>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order._id, "cancelled")}
                                  className={order.status === "cancelled" ? "bg-red-50" : ""}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-700" />
                                  <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          <TableCell className="text-gray-700 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}{" "}
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>

                          <TableCell className="text-gray-600 text-right">
                            {getTimeAgo(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">1-{filteredOrders.length}</span> of{" "}
                  <span className="font-medium text-gray-900">{filteredOrders.length}</span> orders
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-orange-300 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-orange-300 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* New Order Notification Popup */}
        <NewOrderNotification
          order={currentOrder}
          isOpen={showNotification}
          onAccept={handleAcceptOrder}
          onView={handleViewOrder}
          onClose={handleClose}
        />

        {/* Payment Request Notification Popup */}
        <PaymentRequestNotification
          paymentRequest={paymentRequest}
          isOpen={showPaymentNotification}
          onAcknowledge={handlePaymentAcknowledge}
          onClose={handlePaymentNotificationClose}
        />
      </div>
    </>
  );
}
