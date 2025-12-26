// MyCart.jsx
import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Minus, Trash2, ArrowRight, Tag, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import CustomerAuthContext from "@/context/CustomerAuthContext";
import OrderConfirmation from "@/components/client/OrderConfirmation";
import CustomerLoginModal from "@/components/client/CustomerLoginModal";
import { toast } from "sonner";

const MyCart = () => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    calculateTotals,
    getTotalItems,
    placeOrder,
  } = useCart();

  const { isAuthenticated } = useContext(CustomerAuthContext);

  const [promoCode, setPromoCode] = useState("");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { subtotal, tax, total } = calculateTotals();
  const totalItems = getTotalItems();

  const handleApplyPromo = () => {
    console.log("Applying promo code:", promoCode);
    toast.success("Promo code applied!");
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Check if customer is authenticated
    if (!isAuthenticated) {
      toast.info("Please log in to place an order");
      setShowLoginModal(true);
      return;
    }

    setShowOrderDialog(true);
  };

  const handleOrderPlaced = async (orderData) => {
    // Call placeOrder which makes the API call to save the order
    await placeOrder(orderData);

    // Close dialog
    setShowOrderDialog(false);

    // Optional: Show success toast
    toast.success("Order placed successfully!");
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast.success("Login successful! You can now place your order");
  };

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-6 text-sm text-[#6b7280] hover:text-[#ff7a3c]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </Link>

          {/* Page Title */}
          <h1 className="mb-8 text-3xl font-bold text-[#1a1a1a]">
            My Cart ({totalItems} items)
          </h1>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-xl text-[#6b7280]">Your cart is empty</p>
              <Link to="/">
                <Button className="rounded-full bg-[#ff7a3c] hover:bg-[#ff6825]">
                  Browse Menu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items Section */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden border-none shadow-sm"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-base font-bold text-[#1a1a1a]">
                                  {item.name}
                                </h3>
                                <p className="mt-1 text-xs text-[#6b7280]">
                                  {item.description}
                                </p>
                              </div>
                              <span className="text-base font-bold text-[#ff7a3c]">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Quantity Controls and Remove */}
                            <div className="mt-3 flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs font-semibold text-red-600 hover:bg-transparent hover:text-red-700"
                                onClick={() => deleteFromCart(item.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Remove
                              </Button>

                              <div className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-2 py-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-full hover:bg-[#ff7a3c] hover:text-white"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="min-w-[20px] text-center text-sm font-semibold text-[#1a1a1a]">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-full bg-[#ff7a3c] text-white hover:bg-[#ff6825] hover:text-white"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-none shadow-md">
                  <CardContent className="p-6">
                    <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">
                      Order Summary
                    </h2>

                    {/* Authentication Status */}
                    {!isAuthenticated && (
                      <div className="mb-6 rounded-lg bg-amber-50 p-3 border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">Note:</span> You need to log in to place an order
                        </p>
                      </div>
                    )}

                    {/* Promo Code */}
                    <div className="mb-6 flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                        <Input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="h-10 rounded-lg border-[#e0e0e0] pl-10 text-sm"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="h-10 rounded-lg border-[#e0e0e0] px-6 text-sm font-semibold hover:border-[#ff7a3c] hover:text-[#ff7a3c]"
                        onClick={handleApplyPromo}
                      >
                        Apply
                      </Button>
                    </div>

                    <Separator className="mb-4" />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">Subtotal</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">Tax (8%)</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          ₹{tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">Delivery Fee</span>
                        <span className="font-semibold text-green-600">
                          Free
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Total */}
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#1a1a1a]">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-[#ff7a3c]">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      size="lg"
                      className="w-full rounded-full bg-[#ff7a3c] text-base font-bold hover:bg-[#ff6825]"
                      onClick={handlePlaceOrder}
                    >
                      {isAuthenticated ? (
                        <>
                          Place Order
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" />
                          Login to Order
                        </>
                      )}
                    </Button>

                    {/* Terms */}
                    <p className="mt-4 text-center text-xs text-[#9ca3af]">
                      By placing an order, you agree to our{" "}
                      <Link
                        to="/terms"
                        className="text-[#ff7a3c] hover:underline"
                      >
                        Terms of Service
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <OrderConfirmation
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default MyCart;
