// src/pages/OrderManagement.jsx
import { useState } from "react";
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
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
} from "lucide-react";
import NewOrderNotification from "@/components/admin/NewOrderNotification";
import AdminSidebar from "@/components/admin/Sidebar";
import defaultAvatar from "@/assets/default-avatar.svg";

export default function OrderManagement() {
  const [showNotification, setShowNotification] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersData, setOrdersData] = useState([
    {
    id: "#2049",
    tableNumber: 12, // Add table number
    customer: {
      name: "Alex Chen",
      avatar: null,
    },
    // Replace 'items' string with 'menuItems' array
    menuItems: [
      { quantity: 2, name: "Steamed Chicken Momo", size: null },
      { quantity: 1, name: "Coke", size: "Large" },
      { quantity: 1, name: "Mango Lassi", size: null },
    ],
    items: "2x Steamed Momos, 1x Coke (Large)", // Keep as fallback
    total: "$24.50",
    status: "preparing",
    date: new Date(),
    time: "5m ago",
  },
  {
    id: "#2048",
    tableNumber: 8,
    customer: {
      name: "Sarah Johnson",
      avatar: null,
    },
    menuItems: [
      { quantity: 3, name: "Fried Veg Momo", size: null },
      { quantity: 2, name: "Spring Rolls", size: null },
    ],
    items: "3x Fried Veg Momo, 2x Spring Rolls",
    total: "$18.99",
    status: "pending",
    date: new Date(),
    time: "12m ago",
  },
  {
    id: "#2049",
    tableNumber: 12, // Add table number
    customer: {
      name: "Alex Chen",
      avatar: null,
    },
    // Replace 'items' string with 'menuItems' array
    menuItems: [
      { quantity: 2, name: "Steamed Chicken Momo", size: null },
      { quantity: 1, name: "Coke", size: "Large" },
      { quantity: 1, name: "Mango Lassi", size: null },
    ],
    items: "2x Steamed Momos, 1x Coke (Large)", // Keep as fallback
    total: "$24.50",
    status: "preparing",
    date: new Date(),
    time: "5m ago",
  },
  {
    id: "#2048",
    tableNumber: 8,
    customer: {
      name: "Sarah Johnson",
      avatar: null,
    },
    menuItems: [
      { quantity: 3, name: "Fried Veg Momo", size: null },
      { quantity: 2, name: "Spring Rolls", size: null },
    ],
    items: "3x Fried Veg Momo, 2x Spring Rolls",
    total: "$18.99",
    status: "pending",
    date: new Date(),
    time: "12m ago",
  },
  {
    id: "#2049",
    tableNumber: 12, // Add table number
    customer: {
      name: "Alex Chen",
      avatar: null,
    },
    // Replace 'items' string with 'menuItems' array
    menuItems: [
      { quantity: 2, name: "Steamed Chicken Momo", size: null },
      { quantity: 1, name: "Coke", size: "Large" },
      { quantity: 1, name: "Mango Lassi", size: null },
    ],
    items: "2x Steamed Momos, 1x Coke (Large)", // Keep as fallback
    total: "$24.50",
    status: "preparing",
    date: new Date(),
    time: "5m ago",
  },
  {
    id: "#2048",
    tableNumber: 8,
    customer: {
      name: "Sarah Johnson",
      avatar: null,
    },
    menuItems: [
      { quantity: 3, name: "Fried Veg Momo", size: null },
      { quantity: 2, name: "Spring Rolls", size: null },
    ],
    items: "3x Fried Veg Momo, 2x Spring Rolls",
    total: "$18.99",
    status: "pending",
    date: new Date(),
    time: "12m ago",
  },
  ]);

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setOrdersData(ordersData.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Filter counts
  const filterCounts = {
    all: ordersData.length,
    pending: ordersData.filter(o => o.status === "pending").length,
    preparing: ordersData.filter(o => o.status === "preparing").length,
    served: ordersData.filter(o => o.status === "served").length,
    cancelled: ordersData.filter(o => o.status === "cancelled").length,
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

    const config = statusConfig[status];
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

  // Filter and search orders
  const filteredOrders = ordersData.filter((order) => {
    const matchesFilter = activeFilter === "all" || order.status === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const simulateNewOrder = () => {
    const newOrder = {
      id: "2049",
      customer: {
        name: "Alex M.",
        avatar: null,
      },
      items: [
        { quantity: 2, name: "Steamed Momos" },
        { quantity: 1, name: "Coke", size: "Large" },
      ],
      total: 12.99,
      status: "Pending",
      time: "2:30 PM",
    };

    setCurrentOrder(newOrder);
    setShowNotification(true);
  };

  const handleAcceptOrder = (order) => {
    console.log("Accepted order:", order);
    // Update order status to accepted
    setShowNotification(false);
  };

  const handleViewOrder = (order) => {
    console.log("View order:", order);
    // Navigate to order details page
    setShowNotification(false);
  };

  const handleClose = () => {
    setShowNotification(false);
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
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-500">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-500">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
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

              {/* New Order Button */}
              <Button onClick={simulateNewOrder} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <NewOrderNotification
                order={currentOrder}
                isOpen={showNotification}
                onAccept={handleAcceptOrder}
                onView={handleViewOrder}
                onClose={handleClose}
              />
            </div>
          </div>

          {/* Orders Table */}
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
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-gray-200 hover:bg-orange-100/50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium text-orange-600">
                      {order.id}
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
                          <AvatarImage src={order.customer.avatar || defaultAvatar} />
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                            {order.customer.name
                              .split(" ")
                              .map((n) => n.charAt(0))
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-900 font-medium">
                          {order.customer.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Menu Items - Show All Items */}
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        {order.menuItems && order.menuItems.length > 0 ? (
                          order.menuItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                                {item.quantity}x
                              </Badge>
                              <span className="text-gray-700">{item.name}</span>
                              {item.size && (
                                <span className="text-gray-500 text-xs">({item.size})</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">{order.items}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-900 font-semibold">
                      {order.total}
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
                            onClick={() => handleStatusChange(order.id, "pending")}
                            className={order.status === "pending" ? "bg-yellow-50" : ""}
                          >
                            <Clock className="h-4 w-4 mr-2 text-yellow-700" />
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(order.id, "preparing")}
                            className={order.status === "preparing" ? "bg-orange-50" : ""}
                          >
                            <Flame className="h-4 w-4 mr-2 text-orange-700" />
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Preparing</Badge>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(order.id, "served")}
                            className={order.status === "served" ? "bg-green-50" : ""}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-700" />
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Served</Badge>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(order.id, "cancelled")}
                            className={order.status === "cancelled" ? "bg-red-50" : ""}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-700" />
                            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="text-gray-700 text-sm">
                      {order.date.toLocaleDateString()} {order.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>

                    <TableCell className="text-gray-600 text-right">
                      {order.time}
                    </TableCell>
                  </TableRow>
                ))}
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
        </div>

      </div>

    </>
  );
}
