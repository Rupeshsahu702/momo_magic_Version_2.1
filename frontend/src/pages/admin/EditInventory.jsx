// src/pages/EditInventory.jsx
/**
 * Edit Inventory Page - Form to update existing inventory items.
 * Connected to MongoDB via inventoryService API calls.
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
    ChevronRight,
    AlertCircle,
    Save,
    Info,
    AlertTriangle,
    Building,
    Tag,
    Loader2,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import inventoryService from "@/services/inventoryService";

export default function EditInventory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [initialQuantity, setInitialQuantity] = useState("");
    const [currentQuantity, setCurrentQuantity] = useState("");
    const [unitOfMeasure, setUnitOfMeasure] = useState("");
    const [alertThreshold, setAlertThreshold] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch existing inventory item data
    useEffect(() => {
        const fetchInventoryItem = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const item = await inventoryService.fetchInventoryItemById(id);
                setItemName(item.name || "");
                setCategory(item.category || "");
                setInitialQuantity(item.initialQuantity?.toString() || "");
                setCurrentQuantity(item.currentQuantity?.toString() || "");
                setUnitOfMeasure(item.unitOfMeasure || "");
                setAlertThreshold(item.threshold?.toString() || "");
                setSupplierName(item.supplierName || "");
                setSku(item.sku || "");
                setDescription(item.description || "");
                setImageUrl(item.imageUrl || "");
            } catch (error) {
                console.error('Error fetching inventory item:', error);
                setError('Failed to load inventory item. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchInventoryItem();
        }
    }, [id]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields
        if (!itemName.trim()) {
            setError("Item name is required");
            return;
        }
        if (!category) {
            setError("Category is required");
            return;
        }
        if (!initialQuantity || parseInt(initialQuantity) < 0) {
            setError("Initial quantity must be a positive number");
            return;
        }
        if (!currentQuantity || parseInt(currentQuantity) < 0) {
            setError("Current quantity must be a positive number");
            return;
        }
        if (!unitOfMeasure) {
            setError("Unit of measure is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const inventoryData = {
                name: itemName.trim(),
                category,
                initialQuantity: parseInt(initialQuantity),
                currentQuantity: parseInt(currentQuantity),
                unitOfMeasure,
                threshold: alertThreshold ? parseInt(alertThreshold) : 10,
                supplierName: supplierName.trim(),
                sku: sku.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim()
            };

            await inventoryService.updateInventoryItem(id, inventoryData);
            navigate('/admin/inventory');
        } catch (error) {
            console.error('Error updating inventory item:', error);
            setError(error.response?.data?.message || 'Failed to update inventory item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <>
                <AdminSidebar />
                <div className="flex-1 bg-orange-50/30 min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <span className="ml-2 text-gray-600">Loading inventory item...</span>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 bg-orange-50/30 min-h-screen">
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
                                        onClick={() => navigate('/admin/inventory')}
                                    >
                                        Inventory
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-orange-500">Edit Item</span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Edit Inventory Item
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Update the details of this inventory item.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Info Alert */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <div className="bg-orange-500 rounded-full p-1 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-orange-900 mb-1">ITEM DETAILS</p>
                            <p className="text-sm text-orange-700">
                                Field marked with an asterisk (*) are required
                            </p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Form Card */}
                    <form onSubmit={handleSubmit}>
                        <Card className="bg-white">
                            <CardContent className="p-6 space-y-6">
                                {/* Item Name & Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="itemName" className="text-sm font-medium">
                                            Item Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="itemName"
                                            placeholder="e.g. Frozen Chicken Momos"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="category" className="text-sm font-medium">
                                            Category <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={category} onValueChange={setCategory} required>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Meat">Meat</SelectItem>
                                                <SelectItem value="Produce">Produce</SelectItem>
                                                <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                                                <SelectItem value="Sauce & Spices">Sauce & Spices</SelectItem>
                                                <SelectItem value="Packaging">Packaging</SelectItem>
                                                <SelectItem value="Beverages">Beverages</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Initial Quantity, Current Quantity, Unit */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="initialQuantity" className="text-sm font-medium">
                                            Initial Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="initialQuantity"
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={initialQuantity}
                                            onChange={(e) => setInitialQuantity(e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="currentQuantity" className="text-sm font-medium">
                                            Current Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="currentQuantity"
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={currentQuantity}
                                            onChange={(e) => setCurrentQuantity(e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="unitOfMeasure" className="text-sm font-medium">
                                            Unit of Measure <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={unitOfMeasure} onValueChange={setUnitOfMeasure} required>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                                <SelectItem value="g">Grams (g)</SelectItem>
                                                <SelectItem value="L">Liters (L)</SelectItem>
                                                <SelectItem value="mL">Milliliters (mL)</SelectItem>
                                                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                                <SelectItem value="pks">Packages (pks)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Alert Threshold */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="alertThreshold" className="text-sm font-medium flex items-center gap-2">
                                            Alert Threshold
                                            <div className="relative group">
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10">
                                                    Get notified when stock falls below this level
                                                </div>
                                            </div>
                                        </Label>
                                        <div className="relative mt-1">
                                            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
                                            <Input
                                                id="alertThreshold"
                                                type="number"
                                                placeholder="e.g. 10"
                                                min="0"
                                                value={alertThreshold}
                                                onChange={(e) => setAlertThreshold(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Supplier Name & SKU */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="supplierName" className="text-sm font-medium">
                                            Supplier Name (Optional)
                                        </Label>
                                        <div className="relative mt-1">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
                                            <Input
                                                id="supplierName"
                                                placeholder="e.g. Fresh Farms Ltd."
                                                value={supplierName}
                                                onChange={(e) => setSupplierName(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="sku" className="text-sm font-medium">
                                            SKU / Barcode (Optional)
                                        </Label>
                                        <div className="relative mt-1">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
                                            <Input
                                                id="sku"
                                                placeholder="Scan or enter code"
                                                value={sku}
                                                onChange={(e) => setSku(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <Label htmlFor="imageUrl" className="text-sm font-medium">
                                        Image URL (Optional)
                                    </Label>
                                    <Input
                                        id="imageUrl"
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter a URL to an image of this item
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description / Notes
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Add any specific details about this item, storage instructions, or brand preferences..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 min-h-[100px] resize-none"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6"
                                        onClick={() => navigate('/admin/inventory')}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}
