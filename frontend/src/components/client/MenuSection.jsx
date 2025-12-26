/**
 * Menu Section Component - Customer-facing menu display.
 * Fetches available menu items from the database and displays them by category.
 */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Cookie,
  Snowflake,
  Sandwich,
  Box,
  Wine,
  Grid3x3,
  Star,
  Plus,
  Minus,
  ArrowRight,
  Leaf,
  Drumstick,
  IceCreamCone,
  Soup,
  Loader2,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Beef,
  Pizza
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import menuService from "@/services/menuService";
import CustomizationModal from "@/components/client/CustomizationModal";

// Icon mapping for categories
const categoryIconMap = {
  "Momos": Cookie,
  "Tandoori Momos": Flame,
  "Special Momos": Star,
  "Noodles": Box,
  "Rice": Box,
  "Soups": Soup,
  "Sizzlers": Beef,
  "Chinese Starters": Drumstick,
  "Moburg": Sandwich,
  "Pasta": Pizza,
  "Maggi": Box,
  "Special Dishes": Star,
  "Beverages": Wine,
  "Desserts": IceCreamCone,
};


// Default placeholder image for items without images
const DEFAULT_IMAGE = "/images/special_dishes.png";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // Customization modal state
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState(null);

  // Use global cart context
  const { addToCart, removeFromCart, getItemQuantity } = useCart();

  // Fetch available menu items from database on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Only fetch available items for customer view
        const items = await menuService.fetchAvailableMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError("Unable to load menu. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Fetch available categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const availableCategories = await menuService.fetchAvailableCategories();

        // Build categories array with special filters first
        const dynamicCategories = [
          { name: "All", icon: Grid3x3, filter: "all" },
          { name: "Veg", icon: Leaf, filter: "veg" },
          { name: "Non-Veg", icon: Drumstick, filter: "nonveg" },
        ];

        // Add database categories with icons
        availableCategories.forEach(categoryName => {
          dynamicCategories.push({
            name: categoryName,
            icon: categoryIconMap[categoryName] || UtensilsCrossed,
            filter: "category"
          });
        });

        setCategories(dynamicCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to just filter buttons
        setCategories([
          { name: "All", icon: Grid3x3, filter: "all" },
          { name: "Veg", icon: Leaf, filter: "veg" },
          { name: "Non-Veg", icon: Drumstick, filter: "nonveg" },
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Transform database item to cart-compatible format
  const toCartItem = (item) => ({
    id: item._id,
    name: item.productName,
    description: item.description,
    price: item.amount,
    rating: item.rating,
    image: item.imageLink || DEFAULT_IMAGE,
    isVeg: item.isVeg,
    category: item.category,
    customizationOptions: item.customizationOptions || [],
    isRecommended: item.isRecommended || false
  });

  // Handle add to cart - opens modal if item has customizations
  const handleAddToCart = (item, cartItem) => {
    const hasCustomizations = item.customizationOptions && item.customizationOptions.length > 0;

    if (hasCustomizations) {
      setSelectedItemForCustomization(cartItem);
      setIsCustomizationOpen(true);
    } else {
      addToCart(cartItem);
    }
  };

  // Handle add from customization modal
  const handleAddFromModal = (itemWithCustomizations) => {
    addToCart(itemWithCustomizations);
  };

  // Filter items based on selected category
  const getFilteredItems = () => {
    if (selectedCategory === "All") {
      return menuItems;
    } else if (selectedCategory === "Veg") {
      return menuItems.filter((item) => item.isVeg);
    } else if (selectedCategory === "Non-Veg") {
      return menuItems.filter((item) => !item.isVeg);
    } else {
      return menuItems.filter((item) => item.category === selectedCategory);
    }
  };

  const currentItems = getFilteredItems();

  // Safety check to ensure currentItems is always an array
  const safeCurrentItems = Array.isArray(currentItems) ? currentItems : [];

  // Loading state
  if (isLoading) {
    return (
      <section className="w-full bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3c]" />
          <span className="ml-3 text-gray-600">Loading menu...</span>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 text-center">{error}</p>
          <Button
            className="mt-4 bg-[#ff7a3c] hover:bg-[#ff6825]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
            Explore Categories
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="mb-12 flex flex-wrap gap-3">
          {isLoadingCategories ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories available</p>
          ) : (
            categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.name;

              return (
                <Button
                  key={category.name}
                  variant={isActive ? "default" : "outline"}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${isActive
                    ? "bg-[#ff7a3c] text-white hover:bg-[#ff6825]"
                    : "border-[#e0e0e0] text-[#6b7280] hover:border-[#ff7a3c] hover:text-[#ff7a3c]"
                    }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              );
            })
          )}
        </div>

        {/* Popular Now Section */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-bold text-[#1a1a1a]">Popular Now</h3>
            <p className="text-sm text-[#9ca3af]">
              {selectedCategory === "All"
                ? "All dishes from our kitchen"
                : selectedCategory === "Veg"
                  ? "Delicious vegetarian options"
                  : selectedCategory === "Non-Veg"
                    ? "Non-vegetarian favorites"
                    : `${selectedCategory} dishes from our kitchen`}
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-semibold text-[#ff7a3c] hover:text-[#ff6825]"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Empty State */}
        {safeCurrentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {safeCurrentItems.map((item) => {
            // Get quantity from cart context using item's _id
            const quantity = getItemQuantity(item._id);
            const cartItem = toCartItem(item);

            return (
              <Card
                key={item._id}
                className="group overflow-hidden rounded-3xl border-none shadow-md transition-all hover:shadow-xl"
              >
                <CardContent className="p-3.5">
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                    <img
                      src={item.imageLink || DEFAULT_IMAGE}
                      alt={item.productName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        {item.isVeg ? (
                          <Badge className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-green-600">
                            VEG
                          </Badge>
                        ) : (
                          <Badge className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-red-600">
                            NON-VEG
                          </Badge>
                        )}
                      </div>
                      {/* Recommended Badge */}
                      {item.isRecommended && (
                        <Badge className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Recommended
                        </Badge>
                      )}
                    </div>

                    {/* Rating Badge */}
                    {item.rating > 0 && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-md">
                        <Star className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />
                        <span className="text-xs font-semibold text-[#1a1a1a]">
                          {item.rating?.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="mb-1 text-base font-bold text-[#1a1a1a]">
                      {item.productName}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed text-[#6b7280] line-clamp-2">
                      {item.description}
                    </p>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#1a1a1a]">
                        ₹{item.amount?.toFixed(2)}
                      </span>

                      {quantity === 0 ? (
                        <Button
                          size="icon"
                          className="h-9 w-9 rounded-full bg-[#ff7a3c] hover:bg-[#ff6825]"
                          onClick={() => handleAddToCart(item, cartItem)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full bg-[#ff7a3c] px-2 py-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-white hover:bg-[#ff6825] hover:text-white"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-[20px] text-center text-sm font-semibold text-white">
                            {quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-white hover:bg-[#ff6825] hover:text-white"
                            onClick={() => addToCart(cartItem)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        item={selectedItemForCustomization}
        onAddToCart={handleAddFromModal}
      />
    </section>
  );
};

export default Menu;
