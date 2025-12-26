// src/pages/InventoryManagement.jsx
/**
 * Inventory Management Page - Displays all inventory items with CRUD operations.
 * Connected to MongoDB via inventoryService API calls.
 */
import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
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
    Search,
    Bell,
    Settings,
    Plus,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    AlertTriangle,
    Clock,
    XCircle,
    Pencil,
    Trash2,
    Loader2,
    FileDown,
    Upload
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { Label } from "../../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import inventoryService from "@/services/inventoryService";
import { toast } from "sonner";

// Default placeholder image for items without an image
const DEFAULT_IMAGE = "https://via.placeholder.com/100x100?text=No+Image";

export default function InventoryManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [stockStatus, setStockStatus] = useState("all");
    const [inventoryItems, setInventoryItems] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch inventory items and stats on component mount
    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [items, statsData] = await Promise.all([
                inventoryService.fetchAllInventoryItems(),
                inventoryService.fetchInventoryStats()
            ]);
            setInventoryItems(items);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            setError('Failed to load inventory data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete inventory item
    const handleDelete = async (id, itemName) => {
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
            return;
        }

        try {
            await inventoryService.deleteInventoryItem(id);
            // Refresh the data after deletion
            fetchInventoryData();
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    // Handle CSV Export
    const handleExport = async () => {
        try {
            const blob = await inventoryService.exportInventoryCSV();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error exporting inventory:", error);
            toast.error("Failed to export inventory");
        }
    };

    // Handle CSV Import
    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await inventoryService.importInventoryCSV(file);
            toast.success(result.message);
            fetchInventoryData(); // Refresh list
        } catch (error) {
            console.error("Error importing inventory:", error);
            toast.error("Failed to import inventory");
        }
        // Reset input
        event.target.value = null;
    };

    // Stats cards configuration
    const statsCards = [
        {
            icon: TrendingUp,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            label: "Total Items",
            value: stats.totalItems,
            badge: "All",
            badgeColor: "text-blue-600",
            subtext: "Across all categories",
        },
        {
            icon: AlertTriangle,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            label: "Low Stock Alerts",
            value: stats.lowStockCount,
            badge: stats.lowStockCount > 0 ? "Urgent" : "OK",
            badgeColor: stats.lowStockCount > 0 ? "text-orange-600" : "text-green-600",
            subtext: "Below threshold",
        },
        {
            icon: Clock,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            label: "In Stock",
            value: stats.inStockCount,
            badge: "Good",
            badgeColor: "text-green-600",
            subtext: "Above threshold",
        },
        {
            icon: XCircle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            label: "Out of Stock",
            value: stats.outOfStockCount,
            badge: stats.outOfStockCount > 0 ? "Critical" : "OK",
            badgeColor: stats.outOfStockCount > 0 ? "text-red-600" : "text-green-600",
            subtext: "Restock needed",
        },
    ];

    // Get status badge component
    const getStatusBadge = (status) => {
        const statusConfig = {
            "in-stock": {
                label: "In Stock",
                className: "bg-green-100 text-green-700 hover:bg-green-100",
                icon: "●",
            },
            "low-stock": {
                label: "Low Stock",
                className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
                icon: "●",
            },
            "out-of-stock": {
                label: "Out of Stock",
                className: "bg-red-100 text-red-700 hover:bg-red-100",
                icon: "●",
            },
        };

        const config = statusConfig[status] || statusConfig["in-stock"];
        return (
            <Badge variant="secondary" className={config.className}>
                <span className="mr-1">{config.icon}</span>
                {config.label}
            </Badge>
        );
    };

    // Get category badge color
    const getCategoryColor = (categoryName) => {
        const categoryColors = {
            "Meat": "bg-blue-100 text-blue-700",
            "Produce": "bg-green-100 text-green-700",
            "Dry Goods": "bg-purple-100 text-purple-700",
            "Sauce & Spices": "bg-yellow-100 text-yellow-700",
            "Packaging": "bg-gray-100 text-gray-700",
            "Beverages": "bg-pink-100 text-pink-700",
        };
        return categoryColors[categoryName] || "bg-gray-100 text-gray-700";
    };

    // Calculate stock percentage
    const getStockPercentage = (current, initial) => {
        if (initial === 0) return 0;
        return Math.min((current / initial) * 100, 100);
    };

    // Get progress bar color based on percentage
    const getProgressColor = (percentage) => {
        if (percentage === 0) return "bg-red-500";
        if (percentage < 30) return "bg-orange-500";
        return "bg-green-500";
    };

    // Filter items based on search, category and stock status
    const filteredItems = inventoryItems.filter((item) => {
        const searchLower = searchQuery.trim().toLowerCase();
        const matchesSearch =
            searchLower === "" ||
            `${item.name} ${item.sku} ${item.supplierName}`.toLowerCase().includes(searchLower);

        const matchesCategory = category === "all" || item.category === category;
        const matchesStock = stockStatus === "all" || item.stockStatus === stockStatus;

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 bg-gray-50 min-h-screen">
                {/* Header */}
                <header className="bg-white border-b px-6 py-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventory Management</h1>
                        </div>

                        <div className="flex items-center gap-4 mt-3 md:mt-0">
                            {/* Notification */}
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5 text-gray-600" />
                            </Button>

                            {/* Settings */}
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={index} className="bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                                                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg md:text-base font-medium text-gray-700">{stat.label}</p>
                                                <div className="flex items-baseline gap-3">
                                                    <p className="text-4xl md:text-5xl font-extrabold text-gray-900">{stat.value}</p>
                                                    <span className={`text-sm font-medium ${stat.badgeColor}`}>
                                                        {stat.badge}
                                                    </span>
                                                </div>
                                                <p className="text-sm md:text-base text-gray-500">{stat.subtext}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg border p-4 mb-6">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search Items */}
                            <div className="flex-1">
                                <Label className="text-sm text-gray-600 mb-2 block">Search Items</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name, SKU..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="w-48">
                                <Label className="text-sm text-gray-600 mb-2 block">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="all">All Categories</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Meat">Meat</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Produce">Produce</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Dry Goods">Dry Goods</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Sauce & Spices">Sauce & Spices</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Packaging">Packaging</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Beverages">Beverages</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Stock Status Filter */}
                            <div className="w-48">
                                <Label className="text-sm text-gray-600 mb-2 block">Stock Status</Label>
                                <Select value={stockStatus} onValueChange={setStockStatus}>
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="all">All Statuses</SelectItem>
                                        <SelectItem className="cursor-pointer" value="in-stock">In Stock</SelectItem>
                                        <SelectItem className="cursor-pointer" value="low-stock">Low Stock</SelectItem>
                                        <SelectItem className="cursor-pointer" value="out-of-stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Add New Item Button */}
                            <div className="pt-6 flex gap-2">
                                <Button variant="outline" className="gap-2" onClick={handleExport}>
                                    <FileDown className="h-4 w-4" />
                                    Export CSV
                                </Button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleImport}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Import CSV
                                    </Button>
                                </div>
                                <Link to="/admin/inventory/add">
                                    <Button className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Item
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            <span className="ml-2 text-gray-600">Loading inventory...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchInventoryData}
                                className="mt-2"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Inventory Table */}
                    {!isLoading && !error && (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">ITEM NAME</TableHead>
                                        <TableHead className="font-semibold text-gray-700">SKU</TableHead>
                                        <TableHead className="font-semibold text-gray-700">CATEGORY</TableHead>
                                        <TableHead className="font-semibold text-gray-700">STOCK LEVEL</TableHead>
                                        <TableHead className="font-semibold text-gray-700">STATUS</TableHead>
                                        <TableHead className="font-semibold text-gray-700">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {inventoryItems.length === 0
                                                    ? "No inventory items yet. Click 'Add New Item' to get started."
                                                    : "No items match your search criteria."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const percentage = getStockPercentage(item.currentQuantity, item.initialQuantity);
                                            const progressColor = getProgressColor(percentage);

                                            return (
                                                <TableRow key={item._id} className="hover:bg-gray-50">
                                                    {/* Item Name */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={item.imageUrl || DEFAULT_IMAGE}
                                                                alt={item.name}
                                                                className="w-12 h-12 rounded-lg object-cover border"
                                                                onError={(e) => {
                                                                    e.target.src = DEFAULT_IMAGE;
                                                                }}
                                                            />
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    Supplier: {item.supplierName || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* SKU */}
                                                    <TableCell className="text-gray-600">{item.sku || 'N/A'}</TableCell>

                                                    {/* Category */}
                                                    <TableCell>
                                                        <Badge className={`${getCategoryColor(item.category)} border-0`}>
                                                            {item.category}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Stock Level */}
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-medium text-gray-900">
                                                                    {item.currentQuantity} {item.unitOfMeasure}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    of {item.initialQuantity} {item.unitOfMeasure}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${progressColor}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell>{getStatusBadge(item.stockStatus)}</TableCell>

                                                    {/* Actions */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="cursor-pointer"
                                                                onClick={() => navigate(`/admin/inventory/edit/${item._id}`)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="cursor-pointer text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(item._id, item.name)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                            {item.stockStatus === "out-of-stock" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                                                >
                                                                    Restock
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && !error && filteredItems.length > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium">{filteredItems.length}</span> of{" "}
                                <span className="font-medium">{inventoryItems.length}</span> results
                            </p>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="cursor-pointer">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                                >
                                    1
                                </Button>

                                <Button variant="outline" size="icon" className="cursor-pointer">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
