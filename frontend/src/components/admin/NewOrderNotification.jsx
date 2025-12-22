// src/components/admin/NewOrderNotification.jsx
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { X, Bell } from "lucide-react";

export default function NewOrderNotification({ order, onAccept, onView, onClose, isOpen }) {
  const [timeElapsed, setTimeElapsed] = useState("Just Now");

  useEffect(() => {
    if (!isOpen || !order) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed < 60) {
        setTimeElapsed("Just Now");
      } else if (elapsed < 3600) {
        setTimeElapsed(`${Math.floor(elapsed / 60)}m ago`);
      } else {
        setTimeElapsed(`${Math.floor(elapsed / 3600)}h ago`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  return (
    <>
      {/* Backdrop - Semi-transparent */}
      <div
        className="fixed inset-0 bg-black/30 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Notification Card */}
      <div className="fixed top-4 right-4 z-[101] w-96 animate-in slide-in-from-top-5 duration-300">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Orange Header Bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>

          {/* Content */}
          <div className="p-5">
            {/* Header with Avatar and Close */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-12 w-12 border-2 border-orange-500">
                  <AvatarImage src={order.customer?.avatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-lg">
                    {order.customer?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Order Info */}
                <div>
                  <h3 className="text-white font-bold text-lg">
                    New Order #{order.id}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {order.customer?.name} • {timeElapsed}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-sm">
                {order.items?.map((item, index) => (
                  <span key={index}>
                    {item.quantity}x {item.name}
                    {item.size && ` (${item.size})`}
                    {index < order.items.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Bell Icon Button */}
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 transition-colors"
                onClick={() => {
                  // Play notification sound or additional action
                  console.log("Notification acknowledged");
                }}
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* Accept Order Button */}
              <Button
                onClick={() => onAccept(order)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-105"
              >
                Accept Order
              </Button>

              {/* View Button */}
              <Button
                onClick={() => onView(order)}
                variant="outline"
                className="px-6 py-2.5 bg-transparent border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 rounded-xl font-medium"
              >
                View
              </Button>
            </div>

            {/* Order Details Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs uppercase">Total</p>
                <p className="text-white font-bold">${order.total?.toFixed(2)}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs uppercase">Status</p>
                <p className="text-orange-400 font-semibold">{order.status}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs uppercase">Time</p>
                <p className="text-white font-bold">{order.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
