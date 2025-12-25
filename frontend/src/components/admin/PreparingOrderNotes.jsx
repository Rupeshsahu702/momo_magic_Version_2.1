/**
 * PreparingOrderNotes - Displays orders being prepared as animated kitchen cards.
 * Shows below pending orders with "Mark as Served" action buttons.
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Clock, CheckCircle, Eye, Flame } from "lucide-react";


// Time constants for calculating elapsed cooking time
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;

// Animation duration for card fade-out (ms)
const EXIT_ANIMATION_DURATION_MS = 300;


/**
 * Formats elapsed time since order was accepted (cooking timer).
 * Shows how long the kitchen has been working on this order.
 */
const formatCookingTime = (dateInput) => {
    const acceptedDate = new Date(dateInput);
    const now = new Date();
    const differenceInSeconds = Math.floor((now - acceptedDate) / 1000);

    if (differenceInSeconds < SECONDS_IN_MINUTE) {
        return `${differenceInSeconds}s`;
    }

    if (differenceInSeconds < SECONDS_IN_HOUR) {
        const minutes = Math.floor(differenceInSeconds / SECONDS_IN_MINUTE);
        const seconds = differenceInSeconds % SECONDS_IN_MINUTE;
        return `${minutes}m ${seconds}s`;
    }

    const hours = Math.floor(differenceInSeconds / SECONDS_IN_HOUR);
    const minutes = Math.floor((differenceInSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
    return `${hours}h ${minutes}m`;
};


export default function PreparingOrderNotes({ orders, onMarkServed, onView }) {
    // Tracks which order cards are currently animating out
    const [animatingOutOrders, setAnimatingOutOrders] = useState({});

    // Don't render if there are no preparing orders
    if (!orders || orders.length === 0) {
        return null;
    }

    const handleMarkAsServed = (order) => {
        // Start exit animation before calling parent handler
        setAnimatingOutOrders((previousState) => ({
            ...previousState,
            [order._id]: true
        }));

        setTimeout(() => {
            onMarkServed(order);

            // Clean up animation state
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
                    <Flame className="h-6 w-6 text-blue-500" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                        {orders.length}
                    </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Orders Being Prepared</h2>
                <Badge variant="outline" className="ml-2 border-blue-300 text-blue-600 bg-blue-50">
                    In Kitchen
                </Badge>
            </div>

            {/* Preparing Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map((order) => {
                    const isAnimatingOut = animatingOutOrders[order._id];

                    return (
                        <div
                            key={order._id}
                            className={`
                                relative overflow-hidden rounded-2xl shadow-lg
                                bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
                                border-2 border-blue-200
                                transform transition-all duration-300 ease-in-out
                                hover:shadow-xl hover:-translate-y-1 hover:border-blue-400
                                ${isAnimatingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                            `}
                        >
                            {/* Blue accent bar at top with animated gradient */}
                            <div className="h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-pulse" />

                            {/* Content */}
                            <div className="p-4">
                                {/* Header Row */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-10 w-10 border-2 border-blue-300 shadow-sm">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
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

                                    {/* Cooking Timer Badge */}
                                    <Badge className="bg-blue-500 text-white border-0 text-xs animate-pulse">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatCookingTime(order.updatedAt || order.createdAt)}
                                    </Badge>
                                </div>

                                {/* Order Items */}
                                <div className="bg-white/60 rounded-lg p-2 mb-3 border border-blue-100">
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">
                                                    <span className="font-semibold text-blue-600">{item.quantity}×</span>{" "}
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
                                        ${order.total?.toFixed(2)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleMarkAsServed(order)}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Mark as Served
                                    </Button>
                                    <Button
                                        onClick={() => onView(order)}
                                        variant="outline"
                                        className="px-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Cooking indicator - animated flame icon */}
                            <div className="absolute top-3 right-3">
                                <Flame className="h-5 w-5 text-orange-400 animate-bounce" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
