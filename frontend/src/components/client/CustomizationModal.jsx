/**
 * Customization Modal - Displays add-on options for menu items.
 * Opens when customer clicks "Add" on an item with customization options.
 */

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";

/**
 * CustomizationModal component for selecting add-on options.
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.item - The menu item with customization options
 * @param {Function} props.onAddToCart - Callback when item is added to cart with customizations
 */
const CustomizationModal = ({ isOpen, onClose, item, onAddToCart }) => {
    // Track selected customizations by their index
    const [selectedOptions, setSelectedOptions] = useState([]);
    // Track quantity to add
    const [quantity, setQuantity] = useState(1);

    // Calculate total price including selected add-ons
    const calculateTotalPrice = () => {
        const basePrice = item?.price || 0;
        const addOnTotal = selectedOptions.reduce((sum, optionIndex) => {
            const option = item?.customizationOptions?.[optionIndex];
            return sum + (option?.price || 0);
        }, 0);
        return (basePrice + addOnTotal) * quantity;
    };

    // Toggle a customization option
    const toggleOption = (index) => {
        setSelectedOptions((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Handle adding to cart with selected customizations
    const handleAddToCart = () => {
        const selectedCustomizations = selectedOptions.map(
            (index) => item.customizationOptions[index]
        );

        // Calculate total price for this item including add-ons
        const priceWithAddons =
            item.price +
            selectedCustomizations.reduce((sum, opt) => sum + opt.price, 0);

        // Create cart item with customization details
        const cartItem = {
            ...item,
            price: priceWithAddons,
            customizations: selectedCustomizations,
            quantity: quantity,
        };

        onAddToCart(cartItem);
        handleClose();
    };

    // Reset state and close modal
    const handleClose = () => {
        setSelectedOptions([]);
        setQuantity(1);
        onClose();
    };

    if (!item) return null;

    const hasCustomizations =
        item.customizationOptions && item.customizationOptions.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {item.name}
                        {item.isVeg ? (
                            <Badge className="bg-green-600 text-white text-xs">VEG</Badge>
                        ) : (
                            <Badge className="bg-red-600 text-white text-xs">NON-VEG</Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Item Image & Description */}
                    <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={item.image || "/images/special_dishes.png"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "/images/special_dishes.png";
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="mt-2 text-lg font-bold text-[#ff7a3c]">
                                ₹{item.price?.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Customization Options */}
                    {hasCustomizations && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Add Extras</h4>
                            <div className="space-y-2">
                                {item.customizationOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedOptions.includes(index)
                                                ? "bg-orange-50 border-orange-300"
                                                : "bg-white border-gray-200 hover:border-orange-200"
                                            }`}
                                        onClick={() => toggleOption(index)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={selectedOptions.includes(index)}
                                                onCheckedChange={() => toggleOption(index)}
                                                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                            />
                                            <Label className="cursor-pointer font-medium text-gray-700">
                                                {option.name}
                                            </Label>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600">
                                            +₹{option.price?.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Quantity</span>
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full hover:bg-gray-200"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[24px] text-center font-semibold">
                                {quantity}
                            </span>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full hover:bg-gray-200"
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex w-full items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                            Total: <span className="text-[#ff7a3c]">₹{calculateTotalPrice().toFixed(2)}</span>
                        </div>
                        <Button
                            className="bg-[#ff7a3c] hover:bg-[#ff6825] text-white px-6"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomizationModal;
