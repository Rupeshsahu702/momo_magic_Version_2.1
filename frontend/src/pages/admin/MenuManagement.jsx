// src/pages/MenuManagement.jsx
/**
 * Menu Management Page - Admin interface for managing menu items.
 * Connects to the database to fetch, update, and delete menu items.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
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
  Plus,
  Grid3x3,
  List,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  Leaf,
  FileDown,
  Upload
} from "lucide-react";
import DeleteMenuItemModal from "@/components/admin/DeleteMenuItemModal";
import AdminSidebar from "@/components/admin/Sidebar";
import menuService from "@/services/menuService";
import { toast } from "sonner";

// Default placeholder image for items without images
const DEFAULT_IMAGE = "/images/special_dishes.png";

export default function MenuManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Database-connected state
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Fetch menu items from database on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await menuService.fetchAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle availability change - updates database
  const handleAvailabilityChange = async (itemId, newAvailability) => {
    const isAvailable = newAvailability === "In Stock";

    // Optimistic update
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, availability: isAvailable } : item
      )
    );

    try {
      await menuService.updateAvailability(itemId, isAvailable);
      console.log(`Updated item ${itemId} availability to: ${isAvailable}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      // Revert on error
      fetchMenuItems();
    }
  };

  // Get select trigger style based on availability
  const getAvailabilityClass = (availability) => {
    return availability
      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
      : "border-red-500 bg-red-50 text-red-700 hover:bg-red-100";
  };

  const toggleRowMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleHideItem = async (item) => {
    // Toggle availability to hide/show item
    await handleAvailabilityChange(item._id, item.availability ? "Out of Stock" : "In Stock");
    setActiveMenuId(null);
  };

  const handleEditItem = (item) => {
    navigate(`/admin/menu/edit/${item._id}`, { state: { item } });
    setActiveMenuId(null);
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    try {
      await menuService.deleteMenuItem(itemToDelete._id);
      setMenuItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      console.log("Deleted item:", itemToDelete);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Handle CSV Export
  const handleExport = async () => {
    try {
      const blob = await menuService.exportMenuCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `menu_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting menu:", error);
      toast.error("Failed to export menu");
    }
  };

  // Handle CSV Import
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await menuService.importMenuCSV(file);
      toast.success(result.message);
      fetchMenuItems(); // Refresh list
    } catch (error) {
      console.error("Error importing menu:", error);
      toast.error("Failed to import menu");
    }
    // Reset input
    event.target.value = null;
  };

  // Get category badge with styling
  const getCategoryBadge = (category) => {
    const categoryColors = {
      Steamed: "bg-blue-100 text-blue-700",
      Fried: "bg-orange-100 text-orange-700",
      Chili: "bg-red-100 text-red-700",
      Burgers: "bg-yellow-100 text-yellow-700",
      Shakes: "bg-pink-100 text-pink-700",
      Beverages: "bg-cyan-100 text-cyan-700",
      Combos: "bg-purple-100 text-purple-700",
      Sides: "bg-amber-100 text-amber-700",
      Desserts: "bg-rose-100 text-rose-700",
    };

    return (
      <Badge
        variant="secondary"
        className={`${categoryColors[category] || "bg-gray-100 text-gray-700"} hover:${categoryColors[category] || "bg-gray-100"}`}
      >
        {category}
      </Badge>
    );
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(menuItems.map((item) => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual item selection
  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter menu items based on search and filters
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesAvailability = availabilityFilter === "all" ||
      (availabilityFilter === "in-stock" && item.availability) ||
      (availabilityFilter === "out-of-stock" && !item.availability);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <>
      <AdminSidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-sm text-gray-500">
                  Manage your restaurant's food and beverage listings
                </p>
              </div>
            </div>

            {/* Import/Export Buttons */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Add New Item Button */}
            <Link to="/admin/menu/add">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Filters and Search Bar */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by item name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="steamed">Steamed</SelectItem>
                    <SelectItem value="fried">Fried</SelectItem>
                    <SelectItem value="chili">Chili</SelectItem>
                    <SelectItem value="burgers">Burgers</SelectItem>
                    <SelectItem value="shakes">Shakes</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="combos">Combos</SelectItem>
                    <SelectItem value="sides">Sides</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>

                {/* Availability Filter */}
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Availability</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg border p-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading menu items...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchMenuItems} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <p className="text-gray-500 mb-4">No menu items found.</p>
              <Link to="/admin/menu/add">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </Link>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="bg-white rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      ITEM DETAILS
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">CATEGORY</TableHead>
                    <TableHead className="font-semibold text-gray-600">PRICE</TableHead>
                    <TableHead className="font-semibold text-gray-600">TYPE</TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      AVAILABILITY
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      LAST UPDATED
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item._id)}
                          onCheckedChange={(checked) => handleSelectItem(item._id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageLink || DEFAULT_IMAGE}
                            alt={item.productName}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        ₹{item.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={item.isVeg
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }
                        >
                          <Leaf className="h-3 w-3 mr-1" />
                          {item.isVeg ? "Veg" : "Non-Veg"}
                        </Badge>
                      </TableCell>

                      {/* Availability - Dropdown */}
                      <TableCell>
                        <Select
                          value={item.availability ? "In Stock" : "Out of Stock"}
                          onValueChange={(value) => handleAvailabilityChange(item._id, value)}
                        >
                          <SelectTrigger className={`w-40 ${getAvailabilityClass(item.availability)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Stock">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                In Stock
                              </span>
                            </SelectItem>
                            <SelectItem value="Out of Stock">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                Out of Stock
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-gray-600">{formatDate(item.updatedAt)}</TableCell>
                      <TableCell className="text-right relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRowMenu(item._id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {activeMenuId === item._id && (
                          <>
                            {/* Backdrop overlay */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />

                            {/* Popup menu */}
                            <div className="absolute right-0 top-10 w-44 rounded-lg bg-gray-900 shadow-2xl border border-gray-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {/* Hide */}
                              <button
                                type="button"
                                onClick={() => handleHideItem(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 transition-colors"
                              >
                                {item.availability ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span>{item.availability ? "Hide" : "Show"}</span>
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleEditItem(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 transition-colors border-t border-gray-800"
                              >
                                <Pencil className="h-4 w-4" />
                                <span>Edit</span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors border-t border-gray-800"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
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

          {/* Pagination */}
          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredItems.length}</span> of{" "}
                <span className="font-medium">{menuItems.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
                    1
                  </Button>
                </div>

                <Button variant="outline" size="sm" disabled>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Menu Item Modal */}
      <DeleteMenuItemModal
        item={itemToDelete}
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
