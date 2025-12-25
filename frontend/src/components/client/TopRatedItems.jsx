/**
 * TopRatedItems Component - Displays top 5 rated items per category on home page.
 * Features premium design with gradients, animations, and responsive layout.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Minus, Loader2, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import menuService from '@/services/menuService';

const TopRatedItems = () => {
    const [categorizedItems, setCategorizedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart, removeFromCart, getItemQuantity } = useCart();
    const navigate = useNavigate();

    // Fetch top rated items on component mount
    useEffect(() => {
        const fetchTopRatedItems = async () => {
            try {
                setIsLoading(true);
                const data = await menuService.fetchTopRatedByCategory(5);
                setCategorizedItems(data);
            } catch (error) {
                console.error('Error fetching top rated items:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopRatedItems();
    }, []);

    // Render star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            );
        }
        if (hasHalfStar) {
            stars.push(
                <Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-50" />
            );
        }
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
            );
        }
        return stars;
    };

    if (isLoading) {
        return (
            <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                        <span className="mt-4 text-gray-600">Loading top rated items...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (categorizedItems.length === 0) {
        return null; // Don't render section if no items
    }

    return (
        <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 py-16">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="mb-3 text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                        Top Rated Favorites
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Discover our most loved dishes across all categories
                    </p>
                </div>

                {/* Categories */}
                <div className="space-y-16">
                    {categorizedItems.map((categoryData, catIndex) => (
                        <div key={categoryData.category} className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {categoryData.category}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {categoryData.items.length} top rated items
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 group"
                                    onClick={() => navigate('/menu')}
                                >
                                    View all
                                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {categoryData.items.map((item, itemIndex) => {
                                    const quantity = getItemQuantity(item._id);

                                    return (
                                        <Card
                                            key={item._id}
                                            className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
                                            style={{
                                                animation: `fadeInUp 0.5s ease-out ${itemIndex * 0.1}s both`
                                            }}
                                        >
                                            <CardContent className="p-3">
                                                {/* Image Container */}
                                                <div className="relative h-36 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
                                                    {item.imageLink ? (
                                                        <img
                                                            src={item.imageLink}
                                                            alt={item.productName}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                            <span className="text-xs">No image</span>
                                                        </div>
                                                    )}

                                                    {/* Veg/Non-Veg Badge */}
                                                    <div className="absolute left-2 top-2">
                                                        {item.isVeg ? (
                                                            <Badge className="rounded-full bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white hover:bg-green-600">
                                                                VEG
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white hover:bg-red-600">
                                                                NON-VEG
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Rating Badge */}
                                                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-md backdrop-blur-sm">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-xs font-bold text-gray-900">
                                                            {item.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Item Details */}
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                                        {item.productName}
                                                    </h4>

                                                    {/* Stars */}
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(item.rating)}
                                                    </div>

                                                    {/* Description */}
                                                    {item.description && (
                                                        <p className="text-xs text-gray-600 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    {/* Price and Add Button */}
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-lg font-bold text-gray-900">
                                                            ₹{item.amount}
                                                        </span>

                                                        {/* Add to Cart Button */}
                                                        {quantity === 0 ? (
                                                            <Button
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
                                                                onClick={() => addToCart(item)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 shadow-md">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 rounded-full text-white hover:bg-orange-700 hover:text-white"
                                                                    onClick={() => removeFromCart(item._id)}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="min-w-[16px] text-center text-sm font-semibold text-white">
                                                                    {quantity}
                                                                </span>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 rounded-full text-white hover:bg-orange-700 hover:text-white"
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
                    ))}
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
};

export default TopRatedItems;
