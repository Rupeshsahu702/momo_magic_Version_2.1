import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

const FloatingCartButton = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useCart();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Derive visibility from isMobile and totalItems instead of using setState in effect
  const isVisible = useMemo(() => {
    return isMobile && totalItems > 0;
  }, [isMobile, totalItems]);

  const handleClick = () => {
    navigate("/mycart");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:hidden">
      <button
        onClick={handleClick}
        className="flex w-full max-w-md items-center gap-3 rounded-full bg-gradient-to-r from-[#ff7a3c] to-[#ff6825] px-3 py-2 shadow-xl"
      >
        {/* thumbnails */}
        <div className="flex -space-x-3">
          {cartItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* text */}
        <div className="flex flex-1 flex-col text-left">
          <span className="text-sm font-semibold text-white">View cart</span>
          <span className="text-xs text-white/80">
            {totalItems} {totalItems === 1 ? "item" : "items"} • ₹
            {totalPrice.toFixed(2)}
          </span>
        </div>

        {/* arrow */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
          <ArrowRight className="h-5 w-5 text-[#ff7a3c]" />
        </div>
      </button>
    </div>
  );
};

export default FloatingCartButton;
