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

// Menu data organized by category
const menuData = {
  Steamed: [
    {
      id: 1,
      name: "Chicken Cheese Momo",
      description: "Juicy chicken filling topped with melted mozzarella.",
      price: 5.99,
      rating: 4.8,
      image: steam1,
      isVeg: false,
    },
    {
      id: 2,
      name: "Spicy Veg Momo",
      description: "Garden fresh vegetables with our signature spicy sauce.",
      price: 4.99,
      rating: 4.6,
      image: steam2,
      isVeg: true,
    },
    {
      id: 3,
      name: "Fried Chicken Momo",
      description: "Crispy on the outside, juicy on the inside.",
      price: 6.49,
      rating: 4.7,
      image: steam3,
      isVeg: false,
    },
    {
      id: 4,
      name: "Paneer Chili Momo",
      description: "Cottage cheese momos wok-tossed in chili garlic sauce.",
      price: 5.49,
      rating: 4.6,
      image: steam4,
      isVeg: true,
    },
  ],
  Fried: [
    {
      id: 5,
      name: "Crispy Chicken Momo",
      description: "Golden fried chicken momos with spicy dipping sauce.",
      price: 6.99,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 6,
      name: "Fried Paneer Momo",
      description: "Crispy fried paneer momos with mint chutney.",
      price: 5.99,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 7,
      name: "Spicy Fried Veg",
      description: "Crispy vegetable momos tossed in schezwan sauce.",
      price: 5.49,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 8,
      name: "Fried Buff Momo",
      description: "Traditional buff momos deep fried to perfection.",
      price: 7.49,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
  ],
  Chili: [
    {
      id: 9,
      name: "Chicken Chili Momo",
      description: "Steamed momos wok-tossed in spicy chili sauce.",
      price: 7.99,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 10,
      name: "Veg Chili Momo",
      description: "Vegetable momos in Indo-Chinese chili gravy.",
      price: 6.49,
      rating: 4.6,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 11,
      name: "Paneer Chili Garlic",
      description: "Paneer momos in spicy garlic chili sauce.",
      price: 6.99,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 12,
      name: "Schezwan Chicken Momo",
      description: "Fiery schezwan sauce with tender chicken momos.",
      price: 8.49,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
  ],
  Burgers: [
    {
      id: 13,
      name: "Momo Burger",
      description: "Fried momo patty with special sauce in sesame bun.",
      price: 8.99,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 14,
      name: "Spicy Chicken Burger",
      description: "Grilled chicken with jalapenos and cheese.",
      price: 9.49,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 15,
      name: "Veg Momo Burger",
      description: "Crispy veg momo patty with tangy sauces.",
      price: 7.99,
      rating: 4.6,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 16,
      name: "Paneer Tikka Burger",
      description: "Grilled paneer tikka with mint mayo.",
      price: 8.49,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
  ],
  Shakes: [
    {
      id: 17,
      name: "Mango Shake",
      description: "Fresh mango blended with creamy milk.",
      price: 4.99,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 18,
      name: "Chocolate Oreo Shake",
      description: "Rich chocolate shake with crushed oreos.",
      price: 5.49,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 19,
      name: "Strawberry Shake",
      description: "Fresh strawberries with vanilla ice cream.",
      price: 5.29,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 20,
      name: "Cold Coffee",
      description: "Chilled coffee with ice cream and chocolate syrup.",
      price: 4.79,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
  ],
  Beverages: [
    {
      id: 21,
      name: "Fresh Lime Soda",
      description: "Refreshing lime with soda and mint.",
      price: 2.99,
      rating: 4.6,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 22,
      name: "Masala Chai",
      description: "Traditional Indian spiced tea.",
      price: 2.49,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 23,
      name: "Iced Tea",
      description: "Chilled tea with lemon and mint.",
      price: 3.49,
      rating: 4.5,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 24,
      name: "Buttermilk",
      description: "Spiced yogurt drink with curry leaves.",
      price: 2.99,
      rating: 4.6,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
  ],
  Combos: [
    {
      id: 25,
      name: "Momo Meal Deal",
      description: "8 steamed momos + fries + soft drink.",
      price: 12.99,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 26,
      name: "Family Combo",
      description: "16 momos (mixed) + 2 shakes + chili sauce.",
      price: 24.99,
      rating: 4.8,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
    {
      id: 27,
      name: "Veg Special Combo",
      description: "12 veg momos + spring rolls + beverage.",
      price: 15.99,
      rating: 4.7,
      image: "/images/special_dishes.png",
      isVeg: true,
    },
    {
      id: 28,
      name: "Date Night Combo",
      description: "10 momos + 2 burgers + 2 shakes.",
      price: 22.99,
      rating: 4.9,
      image: "/images/special_dishes.png",
      isVeg: false,
    },
  ],
};

// Note: Categories are now fetched dynamically from the backend
// The static categories array has been removed

const ExploreCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState("Steamed");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
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

        // Set first category as selected if available
        if (categoriesWithIcons.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesWithIcons[0].name);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to empty array on error
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []); // Empty dependency array - fetch once on mount

  const getFilteredItems = () => {
    if (selectedCategory === "All") {
      return Object.values(menuData).flat();
    } else if (selectedCategory === "Veg") {
      return Object.values(menuData)
        .flat()
        .filter((item) => item.isVeg);
    } else if (selectedCategory === "Non-Veg") {
      return Object.values(menuData)
        .flat()
        .filter((item) => !item.isVeg);
    } else {
      return menuData[selectedCategory] || [];
    }
  };

  const currentItems = getFilteredItems();

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
                    : "Top rated dishes from our kitchen"}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {currentItems.map((item) => {
            const quantity = getItemQuantity(item.id); // Get quantity from cart

            return (
              <Card
                key={item.id}
                className="group overflow-hidden rounded-3xl border-none shadow-md transition-all hover:shadow-xl"
              >
                <CardContent className="p-3.5">
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                        {item.rating}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="mb-1 text-base font-bold text-[#1a1a1a]">
                      {item.name}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed text-[#6b7280]">
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
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategories;
