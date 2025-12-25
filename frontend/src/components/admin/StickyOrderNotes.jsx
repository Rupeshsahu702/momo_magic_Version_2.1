/**
 * StickyOrderNotes - Displays pending orders as animated sticky note cards.
 * Shows at the top of OrderManagement page with Accept/View actions.
 */

import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Clock, Check, Eye, ChefHat, XCircle } from "lucide-react";


// Time constants for calculating relative timestamps
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;

// How long the card fade-out animation takes (ms)
const EXIT_ANIMATION_DURATION_MS = 300;

// Max rotation angle (degrees) for the random sticky note tilt effect
const MAX_STICKY_NOTE_ROTATION_DEGREES = 2;


/**
 * Formats a date object or ISO string into relative time (e.g., "2m ago").
 * Makes order timestamps scannable at a glance.
 */
const formatRelativeTime = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const differenceInSeconds = Math.floor((now - date) / 1000);

    if (differenceInSeconds < SECONDS_IN_MINUTE) {
        return "Just now";
    }

    if (differenceInSeconds < SECONDS_IN_HOUR) {
        const minutes = Math.floor(differenceInSeconds / SECONDS_IN_MINUTE);
        return `${minutes}m ago`;
    }

    if (differenceInSeconds < SECONDS_IN_DAY) {
        const hours = Math.floor(differenceInSeconds / SECONDS_IN_HOUR);
        return `${hours}h ago`;
    }

    const days = Math.floor(differenceInSeconds / SECONDS_IN_DAY);
    return `${days}d ago`;
};

/**
 * Generates a deterministic pseudo-random rotation based on a seed string.
 * This produces consistent results for the same seed across re-renders.
 */
const getSeedBasedRotation = (seed) => {
    // Simple hash function to get a number from a string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Normalize to range [-1, 1] then scale by max rotation
    const normalized = (hash % 100) / 100;
    return (normalized - 0.5) * MAX_STICKY_NOTE_ROTATION_DEGREES;
};


export default function StickyOrderNotes({ orders, onAccept, onCancel, onView }) {
    // Tracks which order cards are currently animating out (before removal)
    const [animatingOutOrders, setAnimatingOutOrders] = useState({});

    // Generate stable rotations for each order using their IDs as seeds
    const orderRotations = useMemo(() => {
        const rotations = {};
        orders?.forEach((order) => {
            rotations[order._id] = getSeedBasedRotation(order._id);
        });
        return rotations;
    }, [orders]);

    // Don't render the section header if there are no pending orders
    if (!orders || orders.length === 0) {
        return null;
    }

    const handleAcceptOrder = (order) => {
        // Start the exit animation, then call the parent's accept handler after it finishes
        setAnimatingOutOrders((previousState) => ({
            ...previousState,
            [order._id]: true
        }));

        setTimeout(() => {
            onAccept(order);

            // Clean up the animation state for this order
            setAnimatingOutOrders((previousState) => {
                const updatedState = { ...previousState };
                delete updatedState[order._id];
                return updatedState;
            });
        }, EXIT_ANIMATION_DURATION_MS);
    };

    const handleCancelOrder = (order) => {
        // Start the exit animation, then call the parent's cancel handler after it finishes
        setAnimatingOutOrders((previousState) => ({
            ...previousState,
            [order._id]: true
        }));

        setTimeout(() => {
            onCancel(order);

            // Clean up the animation state for this order
            setAnimatingOutOrders((previousState) => {
                const updatedState = { ...previousState };
                delete updatedState[order._id];
                return updatedState;
            });
        }, EXIT_ANIMATION_DURATION_MS);
    };

    return (
        <div className="mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                    <ChefHat className="h-6 w-6 text-orange-500" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {orders.length}
                    </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">New Orders Awaiting</h2>
                <Badge variant="outline" className="ml-2 border-orange-300 text-orange-600 bg-orange-50">
                    Pending Acceptance
                </Badge>
            </div>

            {/* Sticky Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map((order) => {
                    const isAnimatingOut = animatingOutOrders[order._id];
                    const rotation = orderRotations[order._id] || 0;

                    return (
                        <div
                            key={order._id}
                            className={`
                                relative overflow-hidden rounded-2xl shadow-lg
                                bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50
                                border-2 border-orange-200
                                transform transition-all duration-300 ease-in-out
                                hover:shadow-xl hover:-translate-y-1 hover:border-orange-400
                                ${isAnimatingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                            `}
                            style={{
                                transform: `rotate(${rotation}deg)`,
                            }}
                        >
                            {/* Orange accent bar at top */}
                            <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

                            {/* Content */}
                            <div className="p-4">
                                {/* Header Row */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-10 w-10 border-2 border-orange-300 shadow-sm">
                                            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                                                {order.customerName?.charAt(0) || "G"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                Order #{order.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Table {order.tableNumber} • {order.customerName || "Guest"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time Badge */}
                                    <Badge className="bg-white/70 text-gray-600 border border-gray-200 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatRelativeTime(order.createdAt)}
                                    </Badge>
                                </div>

                                {/* Order Items */}
                                <div className="bg-white/60 rounded-lg p-2 mb-3 border border-orange-100">
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">
                                                    <span className="font-semibold text-orange-600">{item.quantity}×</span>{" "}
                                                    {item.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-600">Total</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        ₹{order.total?.toFixed(2)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAcceptOrder(order)}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={() => handleCancelOrder(order)}
                                        className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-semibold rounded-xl transition-all"
                                    >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => onView(order)}
                                        variant="outline"
                                        className="px-3 border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded-xl"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative pin/tape effect (mimics a physical sticky note) */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-b from-amber-300 to-amber-400 rounded-b-full shadow-sm" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
