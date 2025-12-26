// components/OrderConfirmation.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, UtensilsCrossed, CheckCircle2, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";

const OrderConfirmation = ({ isOpen, onClose, onOrderPlaced }) => {
  const [step, setStep] = useState(1); // 1: Table Selection, 2: Success
  const [tableNumber, setTableNumber] = useState("");
  const [orderData, setOrderData] = useState(null);
  const { calculateTotals } = useCart();

  const { total } = calculateTotals();

  const generateOrderNumber = () => {
    return `MMC-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!tableNumber) {
      alert("Please enter a table number");
      return;
    }

    const order = {
      orderNumber: generateOrderNumber(),
      tableNumber: tableNumber,
      total: total,
      estimatedTime: "15-20 mins",
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);

    try {
      // Call parent callback to place order via API
      if (onOrderPlaced) {
        await onOrderPlaced(order);
      }
      setOrderData(order);
      setStep(2);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTableNumber("");
    setOrderData(null);
    onClose();
  };

  const handleTrackOrder = () => {
    handleClose();
    window.location.href = "/myorder";
  };

  const handleBackToMenu = () => {
    handleClose();
    window.location.href = "/";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none">
        {step === 1 ? (
          // Step 1: Table Number Selection
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero Image */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
              <img
                src="/api/placeholder/400/200"
                alt="Momos"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6">
                <h2 className="text-2xl font-bold text-white">Almost there!</h2>
                <p className="text-sm text-white/80">
                  We're just one step away.
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-bold text-[#1a1a1a]">
                  Where are you sitting?
                </h3>
                <p className="text-sm text-[#6b7280]">
                  Please enter your table number so we can bring your fresh
                  momos directly to you.
                </p>
              </div>

              {/* Table Number Input */}
              <div className="mb-6">
                <Label
                  htmlFor="tableNumber"
                  className="mb-2 block text-sm font-semibold text-[#1a1a1a]"
                >
                  Table Number
                </Label>
                <div className="relative">
                  <UtensilsCrossed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ff7a3c]" />
                  <Select value={tableNumber} onValueChange={setTableNumber}>
                    <SelectTrigger className="h-12 rounded-xl border-[#e0e0e0] pl-11 text-base">
                      <SelectValue placeholder="Ex: 12" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Table {num}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                size="lg"
                className="mb-3 w-full rounded-xl bg-[#ff7a3c] text-base font-bold hover:bg-[#ff6825]"
                onClick={handleConfirmOrder}
                disabled={isLoading}
              >
                {isLoading ? "Placing Order..." : `Confirm Order • ₹${total.toFixed(2)}`}
              </Button>

              {/* Cancel Button */}
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-xl text-sm font-semibold text-[#6b7280] hover:bg-transparent hover:text-[#ff7a3c]"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Order Success
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Close Button - Added for manual close */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-lg transition-colors hover:bg-[#f0f0f0]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Success Header */}
            <div className="bg-gradient-to-br from-[#fff4ed] to-[#ffe7cc] px-6 py-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                  <CheckCircle2 className="h-12 w-12 text-[#ff7a3c]" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                Order Placed Successfully!
              </h2>
              <p className="text-sm text-[#6b7280]">
                Thank you for ordering at Momo Magic Cafe. Your delicious momos
                are being{" "}
                <span className="font-semibold text-[#ff7a3c]">
                  steamed right now.
                </span>
              </p>
            </div>

            {/* Order Details */}
            <div className="space-y-4 px-6 py-6">
              {/* Order ID */}
              <div className="flex items-center justify-between rounded-xl bg-[#fafafa] p-4">
                <span className="text-sm font-medium text-[#6b7280]">
                  Order ID
                </span>
                <span className="text-base font-bold text-[#ff7a3c]">
                  #{orderData?.orderNumber}
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center justify-between rounded-xl bg-[#fafafa] p-4">
                <span className="text-sm font-medium text-[#6b7280]">
                  Estimated Time
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#1a1a1a]" />
                  <span className="text-base font-bold text-[#1a1a1a]">
                    {orderData?.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Table Number */}
              <div className="flex items-center justify-between rounded-xl bg-[#fafafa] p-4">
                <span className="text-sm font-medium text-[#6b7280]">
                  Table Number
                </span>
                <span className="text-base font-bold text-[#1a1a1a]">
                  Table {orderData?.tableNumber}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 px-6 pb-6">
              <Button
                size="lg"
                className="w-full rounded-xl bg-[#ff7a3c] text-base font-bold hover:bg-[#ff6825]"
                onClick={handleTrackOrder}
              >
                Track My Order
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-[#e0e0e0] text-sm font-semibold text-[#6b7280] hover:border-[#ff7a3c] hover:text-[#ff7a3c]"
                onClick={handleBackToMenu}
              >
                Back to Menu
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmation;
