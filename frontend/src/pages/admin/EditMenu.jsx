// src/pages/EditMenu.jsx
/**
 * Edit Menu Item Page - Admin interface for editing existing menu items.
 * Loads item data from database and saves updates via menuService.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
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
import { Trash2, ChevronRight, Upload, ArrowLeft, Loader2, Leaf, Plus, Star } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import menuService from "@/services/menuService";
import uploadService from "@/services/uploadService";
import { toast } from "sonner";

export default function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("0");
  const [isVeg, setIsVeg] = useState(true);
  const [availability, setAvailability] = useState(true);
  const [imageLink, setImageLink] = useState("");
  // Add-on customization options (e.g., "Extra Cheese" - ₹50)
  const [customizationOptions, setCustomizationOptions] = useState([]);
  // Mark as recommended/popular item
  const [isRecommended, setIsRecommended] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  // Loading/error state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  // Load item data from database on mount
  useEffect(() => {
    const loadItem = async () => {
      try {
        setIsLoading(true);
        const item = await menuService.fetchMenuItemById(id);

        setProductName(item.productName || "");
        setCategory(item.category || "");
        setAmount(item.amount?.toString() || "");
        setDescription(item.description || "");
        setRating(item.rating?.toString() || "0");
        setIsVeg(item.isVeg ?? true);
        setAvailability(item.availability ?? true);
        setImageLink(item.imageLink || "");
        setCustomizationOptions(item.customizationOptions || []);
        setIsRecommended(item.isRecommended ?? false);
      } catch (error) {
        console.error("Error loading menu item:", error);
        setError("Failed to load menu item. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set preview immediately for UX
    setImagePreview(URL.createObjectURL(file));
    setError(null);

    try {
      setIsUploadingImage(true);

      // Upload to R2 and get public URL
      const uploadedImageUrl = await uploadService.uploadImage(file);

      // Update the image URL
      setImageLink(uploadedImageUrl);

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
      toast.error(error.message || 'Failed to upload image');

      // Clear preview on error
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    // Validate
    if (!productName.trim()) {
      setError("Please enter a product name");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }

    // Check if image is still uploading
    if (isUploadingImage) {
      setError('Please wait for the image to finish uploading');
      return;
    }

    setIsSaving(true);

    try {
      await menuService.updateMenuItem(id, {
        productName: productName.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        rating: parseFloat(rating) || 0,
        isVeg,
        imageLink: imageLink.trim(),
        availability,
        customizationOptions: customizationOptions.filter(opt => opt.name.trim()),
        isRecommended
      });

      toast.success('Menu item updated successfully!');
      navigate('/admin/menu');
    } catch (error) {
      console.error("Error saving menu item:", error);
      setError(error.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await menuService.deleteMenuItem(id);
        navigate('/admin/menu');
      } catch (error) {
        console.error("Error deleting menu item:", error);
        setError("Failed to delete item. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/menu');
  };

  // Add a new empty customization option
  const addCustomizationOption = () => {
    setCustomizationOptions(prev => [...prev, { name: '', price: 0 }]);
  };

  // Update a customization option at a specific index
  const updateCustomizationOption = (index, field, value) => {
    setCustomizationOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove a customization option by index
  const removeCustomizationOption = (index) => {
    setCustomizationOptions(prev => prev.filter((_, i) => i !== index));
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <AdminSidebar />
        <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-600">Loading item...</span>
        </div>
      </>
    );
  }

  // Error state (item not found)
  if (error && !productName) {
    return (
      <>
        <AdminSidebar />
        <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/menu')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </>
    );
  }

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
                  <Link to="/admin" className="hover:text-orange-500 cursor-pointer">
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
              <Button variant="outline" onClick={handleCancel}>
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

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

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
                      {imagePreview || imageLink ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview || imageLink}
                            alt="Current item"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/images/special_dishes.png";
                            }}
                          />
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image URL or Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="imageLink" className="text-sm font-medium">
                        Image URL
                      </Label>
                      <Input
                        id="imageLink"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageLink}
                        onChange={(e) => setImageLink(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <label
                      htmlFor="imageUpload"
                      className={`block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 ${isUploadingImage ? 'opacity-50 cursor-wait' : ''
                        }`}
                    >
                      <Upload className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-800">
                        {isUploadingImage ? 'Uploading...' : 'Click to upload new image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, GIF, WebP (MAX. 5MB)
                      </p>
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Item Details */}
              <section className="space-y-5">
                {/* Item Name */}
                <div>
                  <Label htmlFor="productName" className="text-sm font-medium">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productName"
                    placeholder="e.g. Schezwan Chicken Momos"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Momos">Momos</SelectItem>
                        <SelectItem value="Tandoori Momos">Tandoori Momos</SelectItem>
                        <SelectItem value="Special Momos">Special Momos</SelectItem>
                        <SelectItem value="Noodles">Noodles</SelectItem>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Soups">Soups</SelectItem>
                        <SelectItem value="Sizzlers">Sizzlers</SelectItem>
                        <SelectItem value="Chinese Starters">Chinese Starters</SelectItem>
                        <SelectItem value="Moburg">Moburg</SelectItem>
                        <SelectItem value="Pasta">Pasta</SelectItem>
                        <SelectItem value="Maggi">Maggi</SelectItem>
                        <SelectItem value="Special Dishes">Special Dishes</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Desserts">Desserts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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

                {/* Veg/Non-Veg & Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Food Type
                    </Label>
                    <RadioGroup value={isVeg ? "veg" : "nonveg"} onValueChange={(val) => setIsVeg(val === "veg")}>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${isVeg ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
                          }`}>
                          <RadioGroupItem value="veg" id="veg" />
                          <Label htmlFor="veg" className="cursor-pointer flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-600" />
                            Veg
                          </Label>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${!isVeg ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
                          }`}>
                          <RadioGroupItem value="nonveg" id="nonveg" />
                          <Label htmlFor="nonveg" className="cursor-pointer flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="h-2 w-2 rounded-full bg-white"></span>
                            </span>
                            Non-Veg
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="rating" className="text-sm font-medium">
                      Rating (0-5)
                    </Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="mt-1 w-32"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Add-on Customizations Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Add-on Customizations
                    </h3>
                    <p className="text-sm text-gray-500">
                      Optional extras customers can add to this item (e.g., Extra Cheese)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomizationOption}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                {customizationOptions.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                    No customizations added. Click "Add Option" to create one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customizationOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Option name (e.g., Extra Cheese)"
                            value={option.name}
                            onChange={(e) =>
                              updateCustomizationOption(index, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div className="w-28">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              ₹
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={option.price}
                              onChange={(e) =>
                                updateCustomizationOption(index, 'price', parseFloat(e.target.value) || 0)
                              }
                              className="pl-7"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomizationOption(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-gray-200" />

              {/* Recommended/Popular Toggle */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Featured Item
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-500" />
                      Mark as Recommended
                      {isRecommended && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Display a "Recommended" badge on this item in the customer menu.
                    </p>
                  </div>
                  <Switch
                    checked={isRecommended}
                    onCheckedChange={setIsRecommended}
                    className="data-[state=checked]:bg-orange-500"
                  />
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
                      <span className={`h-2 w-2 rounded-full ${availability ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </p>
                    <p className="text-sm text-gray-500">
                      When disabled, this item will be hidden from the menu.
                    </p>
                  </div>
                  <Switch
                    checked={availability}
                    onCheckedChange={setAvailability}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </section>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
