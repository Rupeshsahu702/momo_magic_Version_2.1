// src/pages/MenuManagement.jsx
import { useState } from "react";
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
} from "lucide-react";
import DeleteMenuItemModal from "@/components/admin/DeleteMenuItemModal";

import AdminSidebar from "@/components/admin/Sidebar";
import steam1 from "@/assets/steam-1.webp";
import steam2 from "@/assets/steam-2.webp";
import mangoLassi from "@/assets/mangolassi.jpg";
import steam3 from "@/assets/steam-3.webp";
import cocaCola from "@/assets/cocacola.webp";

export default function MenuManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Menu items data with state
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Steamed Chicken Momo",
      sku: "MO-CK-001",
      category: "Momos",
      price: "$5.99",
      availability: "In Stock",
      lastUpdated: "Today, 10:30 AM",
      image: steam1,
    },
    {
      id: 2,
      name: "Spicy Dipping Sauce",
      sku: "SC-SP-002",
      category: "Sides",
      price: "$1.50",
      availability: "In Stock",
      lastUpdated: "Yesterday",
      image: steam2,
    },
    {
      id: 3,
      name: "Mango Lassi",
      sku: "DR-MG-005",
      category: "Drinks",
      price: "$3.50",
      availability: "Out of Stock",
      lastUpdated: "2 days ago",
      image: mangoLassi,
    },
    {
      id: 4,
      name: "Fried Veg Momo",
      sku: "MO-VE-003",
      category: "Momos",
      price: "$4.99",
      availability: "In Stock",
      lastUpdated: "3 days ago",
      image: steam3,
    },
    {
      id: 5,
      name: "Classic Coke",
      sku: "DR-CO-008",
      category: "Drinks",
      price: "$1.99",
      availability: "In Stock",
      lastUpdated: "1 week ago",
      image: cocaCola,
    },
  ]);

  // Handle availability change
  const handleAvailabilityChange = (itemId, newAvailability) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, availability: newAvailability } : item
      )
    );

    console.log(`Updated item ${itemId} availability to: ${newAvailability}`);
    // TODO: Call API to update availability
  };

  // Get select trigger style based on availability
  const getAvailabilityClass = (availability) => {
    return availability === "In Stock"
      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
      : "border-red-500 bg-red-50 text-red-700 hover:bg-red-100";
  };

  const toggleRowMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleHideItem = (item) => {
    console.log("Hide item", item);
    setActiveMenuId(null);
  };

  const handleEditItem = (item) => {
    navigate(`/admin/menu/edit/${item.id}`, { state: { item } });
    setActiveMenuId(null);
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    console.log("Delete item:", itemToDelete);
    setMenuItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    const categoryColors = {
      Momos: "bg-orange-100 text-orange-700",
      Sides: "bg-yellow-100 text-yellow-700",
      Drinks: "bg-blue-100 text-blue-700",
    };

    return (
      <Badge
        variant="secondary"
        className={`${categoryColors[category]} hover:${categoryColors[category]}`}
      >
        {category}
      </Badge>
    );
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(menuItems.map((item) => item.id));
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
                  placeholder="Search by item name, SKU, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="momos">Momos</SelectItem>
                    <SelectItem value="sides">Sides</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                  </SelectContent>
                </Select>

                {/* Availability Filter */}
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Availability</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Price Range Filter */}
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Price Range</SelectItem>
                    <SelectItem value="0-5">$0 - $5</SelectItem>
                    <SelectItem value="5-10">$5 - $10</SelectItem>
                    <SelectItem value="10+">$10+</SelectItem>
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

          {/* Table */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === menuItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    ITEM DETAILS
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">CATEGORY</TableHead>
                  <TableHead className="font-semibold text-gray-600">PRICE</TableHead>
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
                {menuItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {item.price}
                    </TableCell>
                    
                    {/* Availability - Dropdown */}
                    <TableCell>
                      <Select
                        value={item.availability}
                        onValueChange={(value) => handleAvailabilityChange(item.id, value)}
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

                    <TableCell className="text-gray-600">{item.lastUpdated}</TableCell>
                    <TableCell className="text-right relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowMenu(item.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeMenuId === item.id && (
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
                              <EyeOff className="h-4 w-4" />
                              <span>Hide</span>
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">5</span> of{" "}
              <span className="font-medium">24</span> results
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
              </div>

              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
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
