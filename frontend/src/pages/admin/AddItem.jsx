// src/pages/AddItem.jsx
/**
 * Add Item Page - Admin interface for creating new menu items.
 * Submits new items to the database via menuService.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  ChevronRight,
  Upload,
  Info,
  Check,
  FileText,
  Sliders,
  Image,
  CheckCircle,
  Loader2,
  Leaf,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import menuService from "@/services/menuService";
import uploadService from "@/services/uploadService";
import { toast } from "sonner";

export default function AddItem() {
  const navigate = useNavigate();

  // Form state
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("0");
  const [isVeg, setIsVeg] = useState(true);
  const [availability, setAvailability] = useState(true);
  const [imageLink, setImageLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload - uploads to R2 and gets public URL
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Set preview immediately for UX
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
    setError(null);

    try {
      setIsUploadingImage(true);

      // Upload to R2 and get public URL
      const uploadedImageUrl = await uploadService.uploadImage(file);

      // Set the image URL in the form
      setImageLink(uploadedImageUrl);

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
      toast.error(error.message || 'Failed to upload image');

      // Clear preview on error
      setImagePreview(null);
      setImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!productName.trim()) {
      setError("Please enter a product name");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid price");
      return false;
    }
    if (!category) {
      setError("Please select a category");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    // Check if image is still uploading
    if (isUploadingImage) {
      setError('Please wait for the image to finish uploading');
      return;
    }

    setIsSubmitting(true);

    try {
      const menuItemData = {
        productName: productName.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        rating: parseFloat(rating) || 0,
        isVeg,
        imageLink: imageLink.trim(), // Already contains R2 URL if image was uploaded
        availability
      };

      await menuService.createMenuItem(menuItemData);

      // Success - navigate back to menu management
      toast.success('Menu item created successfully!');
      navigate("/admin/menu");
    } catch (error) {
      console.error("Error creating menu item:", error);
      setError(error.response?.data?.message || "Failed to create menu item. Please try again.");
      toast.error("Failed to create menu item");
    } finally {
      setIsSubmitting(false);
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
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span
                    className="hover:text-orange-500 cursor-pointer"
                    onClick={() => navigate("/admin/menu")}
                  >
                    Menu Management
                  </span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-orange-500">Add New Item</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Menu Item</h1>
                <p className="text-sm text-gray-500">
                  Create a new offering for the Momo Magic menu. Fill in the details below.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/menu")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Publish Item
                  </>
                )}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {/* Price and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Price (₹) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    </div>

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
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the taste, ingredients, and what makes this item special..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 min-h-[120px] resize-none"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {description.length}/300 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Item Attributes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sliders className="h-5 w-5 text-orange-500" />
                    Item Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Veg/Non-Veg Toggle */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Food Type <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup value={isVeg ? "veg" : "nonveg"} onValueChange={(val) => setIsVeg(val === "veg")}>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${isVeg ? "bg-green-50 border-green-300" : "bg-white border-gray-200 hover:border-gray-300"
                          }`}>
                          <RadioGroupItem value="veg" id="veg" />
                          <Label
                            htmlFor="veg"
                            className="font-normal cursor-pointer flex items-center gap-2"
                          >
                            <Leaf className="h-4 w-4 text-green-600" />
                            <span className={isVeg ? "text-green-700 font-medium" : ""}>Vegetarian</span>
                          </Label>
                        </div>

                        <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${!isVeg ? "bg-red-50 border-red-300" : "bg-white border-gray-200 hover:border-gray-300"
                          }`}>
                          <RadioGroupItem value="nonveg" id="nonveg" />
                          <Label
                            htmlFor="nonveg"
                            className="font-normal cursor-pointer flex items-center gap-2"
                          >
                            <span className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="h-2 w-2 rounded-full bg-white"></span>
                            </span>
                            <span className={!isVeg ? "text-red-700 font-medium" : ""}>Non-Vegetarian</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label htmlFor="rating" className="text-sm font-medium">
                      Initial Rating (0-5)
                    </Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="0"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="mt-1 w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image and Availability */}
            <div className="space-y-6">
              {/* Item Image Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="h-5 w-5 text-orange-500" />
                    Item Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image URL Input */}
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

                  {/* Preview or Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    {imagePreview || imageLink ? (
                      <div className="relative">
                        <img
                          src={imagePreview || imageLink}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/images/special_dishes.png";
                          }}
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Uploading...</p>
                            </div>
                          </div>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById("imageUpload").click()}
                          className="mt-3 w-full"
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? 'Uploading...' : 'Change Image'}
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto text-orange-400 mb-3" />
                        <p className="font-medium text-gray-700">Click to upload</p>
                        <p className="text-sm text-gray-500">or enter URL above</p>
                        <p className="text-xs text-gray-400 mt-2">
                          JPG, PNG, GIF, WebP (MAX. 5MB)
                        </p>
                      </label>
                    )}
                  </div>

                  <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      High-quality images increase sales! Use a clear photo with good
                      lighting.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* In Stock Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">In Stock</p>
                      <p className="text-sm text-gray-500">
                        Item is visible to customers
                      </p>
                    </div>
                    <Switch checked={availability} onCheckedChange={setAvailability} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
