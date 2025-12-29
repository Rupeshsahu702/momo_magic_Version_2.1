import React, { useState, useEffect } from "react";
import steam1 from "@/assets/steam-1.png";
import steam2 from "@/assets/steam-2.png";
import steam3 from "@/assets/steam-3.png";
import steam4 from "@/assets/steam-4.png";
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
  Soup,
  Beef,
  Pizza,
  IceCream,
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import menuService from "@/services/menuService";
import useMenuImage from "@/hooks/useMenuImage";

// Icon mapping for categories
const categoryIconMap = {
  "Momos": Flame,
  "Tandoori Momos": Cookie,
  "Special Momos": ChefHat,
  "Noodles": UtensilsCrossed,
  "Rice": Box,
  "Soups": Soup,
  "Sizzlers": Beef,
  "Chinese Starters": Snowflake,
  "Moburg": Sandwich,
  "Pasta": Pizza,
  "Maggi": Flame,
  "Special Dishes": ChefHat,
  "Beverages": Wine,
  "Desserts": IceCream,
  // Legacy/old categories
  "Steamed": Flame,
  "Fried": Cookie,
  "Chili": Snowflake,
  "Burgers": Sandwich,
  "Shakes": Box,
  "Combos": Grid3x3,
};

// Menu data removed in favor of dynamic fetching


const ExploreCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState("Steamed");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();

  // Fetch available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const availableCategories = await menuService.fetchAvailableCategories();

        // Map categories to include icons
        const categoriesWithIcons = availableCategories.map(cat => ({
          name: cat,
          icon: categoryIconMap[cat] || UtensilsCrossed // Fallback icon
        }));

        setCategories(categoriesWithIcons);

        // Set first category as selected if available and none selected
        if (categoriesWithIcons.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesWithIcons[0].name);
        } else if (categoriesWithIcons.length > 0 && !categoriesWithIcons.find(c => c.name === selectedCategory)) {
          // If selected category is not in the list, select the first one
          setSelectedCategory(categoriesWithIcons[0].name);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch items when selected category changes
  useEffect(() => {
    const loadItems = async () => {
      if (!selectedCategory) return;

      try {
        setIsLoadingItems(true);
        // Fetch items for the selected category
        const filters = selectedCategory === "All" ? {} : { category: selectedCategory };

        const fetchedItems = await menuService.fetchAllMenuItems(filters);

        // Map database items to component structure
        const mappedItems = fetchedItems.map(item => ({
          id: item._id, // IMPORTANT: Use _id from DB
          name: item.productName,
          description: item.description,
          price: item.amount,
          rating: item.rating || 0,
          // IMPORTANT: Keep original imageLink for useMenuImage hook
          // DO NOT default to fallback here - let the hook handle it
          imageLink: item.imageLink,
          isVeg: item.isVeg,
          // Preserve original item data if needed
          originalItem: item
        }));

        setItems(mappedItems);
      } catch (error) {
        console.error('Error loading items:', error);
        setItems([]);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadItems();
  }, [selectedCategory]);


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

        {/* Menu Items Grid */}
        {isLoadingItems ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3c]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              return <CategoryItem key={item.id} item={item} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Individual Category Item Card Component
 * Separated to properly use the useMenuImage hook
 */
const CategoryItem = ({ item }) => {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();

  // ROBUST IMAGE LOADING: Use custom hook for intelligent image loading
  // This hook handles:
  // - Automatic retry on failure (up to 2 attempts)
  // - Fallback to default image after retries exhausted
  // - localStorage caching of failed URLs to prevent repeated attempts
  // See hooks/useMenuImage.js for detailed implementation
  const { imageSrc } = useMenuImage(item.imageLink, '/images/special_dishes.png');

  const quantity = getItemQuantity(item.id);

  return (
    <Card className="group overflow-hidden rounded-3xl border-none shadow-md transition-all hover:shadow-xl">
      <CardContent className="p-3.5">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
          {/* 
            CRITICAL: Image loading with robust error handling
            - imageSrc comes from useMenuImage hook which handles retries and fallbacks
            - onError provides final safety net if hook fails
            - DO NOT remove onError handler - it's the last line of defense
          */}
          <img
            src={imageSrc}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              // Final fallback: If even the hook-managed image fails, use default
              // This should rarely trigger if the hook is working correctly
              if (e.target.src !== '/images/special_dishes.png') {
                e.target.src = '/images/special_dishes.png';
              }
            }}
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
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

          {/* Rating Badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-md">
            <Star className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />
            <span className="text-xs font-semibold text-[#1a1a1a]">
              {item.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="mb-1 text-base font-bold text-[#1a1a1a]">
            {item.name}
          </h4>
          <p className="mb-4 text-xs leading-relaxed text-[#6b7280] line-clamp-2">
            {item.description}
          </p>

          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#1a1a1a]">
              ₹{item.price}
            </span>

            {/* Conditional Rendering: Plus button or Minus-Count-Plus */}
            {quantity === 0 ? (
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-[#ff7a3c] hover:bg-[#ff6825]"
                onClick={() => addToCart(item)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-[#ff7a3c] px-2 py-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-white hover:bg-[#ff6825] hover:text-white"
                  onClick={() => removeFromCart(item.id)}
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
                  onClick={() => addToCart(item)}
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
};

export default ExploreCategories;
