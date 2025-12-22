// src/pages/EditMenu.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { Trash2, ChevronRight, Upload, ArrowLeft } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function EditMenu() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get item data from navigation state or set defaults
  const itemData = location.state?.item || {};

  const [itemName, setItemName] = useState(itemData.name || "");
  const [category, setCategory] = useState(itemData.category?.toLowerCase().replace(' ', '-') || "");
  const [price, setPrice] = useState(itemData.price?.replace('$', '') || "");
  const [description, setDescription] = useState(
    itemData.description || "Juicy chicken filling mixed with fresh herbs and our secret spice blend, wrapped in soft, handcrafted dough and steamed to perfection. Served with spicy tomato achar."
  );
  const [availableOnline, setAvailableOnline] = useState(itemData.availability === "In Stock");
  const [itemImage, setItemImage] = useState(itemData.image || "");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemImage(URL.createObjectURL(file));
  };

  const handleSave = () => {
    console.log("Saving menu item...", {
      id,
      itemName,
      category,
      price,
      description,
      availableOnline,
    });
    navigate('/admin/menu');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      console.log("Deleting menu item...", id);
      navigate('/admin/menu');
    }
  };

  const handleCancel = () => {
    navigate('/admin/menu');
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
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Link to="/" className="hover:text-orange-500 cursor-pointer">
                    Dashboard
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <Link to="/admin/menu" className="hover:text-orange-500 cursor-pointer">
                    Menu
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-orange-500">Edit Item</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Menu Item</h1>
                <p className="text-sm text-gray-500">
                  Make changes to your product catalog
                </p>
              </div>
            </div>

            {/* Top-right actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card className="bg-white">
            <CardContent className="p-6 space-y-8">
              {/* Item Image Section */}
              <section className="space-y-4">
                <h2 className="font-semibold text-gray-900">Item Image</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Current Image */}
                  <div className="flex justify-center md:justify-start">
                    <div className="w-48 h-36 rounded-lg overflow-hidden border bg-gray-100">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt="Current item"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload New Image */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="imageUpload"
                      className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors bg-gray-50"
                    >
                      <Upload className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-800">
                        Click to upload new image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SVG, PNG, JPG or GIF (max. 2MB)
                      </p>
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Item Details */}
              <section className="space-y-5">
                {/* Item Name */}
                <div>
                  <Label htmlFor="itemName" className="text-sm font-medium">
                    Item Name
                  </Label>
                  <Input
                    id="itemName"
                    placeholder="e.g. Schezwan Chicken Momos"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momos">Momos</SelectItem>
                        <SelectItem value="sides">Sides</SelectItem>
                        <SelectItem value="drinks">Drinks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-[120px] resize-none"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {description.length}/300 characters
                  </p>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Availability Status */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Availability Status
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      Available Online
                      <span className={`h-2 w-2 rounded-full ${availableOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </p>
                    <p className="text-sm text-gray-500">
                      When disabled, this item will be hidden from the menu.
                    </p>
                  </div>
                  <Switch
                    checked={availableOnline}
                    onCheckedChange={setAvailableOnline}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </section>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
