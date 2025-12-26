import React, { useState, useContext } from "react";
import { ShoppingCart, User, Menu, X, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import CustomerAuthContext from "@/context/CustomerAuthContext";

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { customer, isAuthenticated } = useContext(CustomerAuthContext);
  const totalItems = getTotalItems();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#eef0f4] bg-[#ffffff] shadow-sm">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-5 sm:px-24">
        {/* Left: Hamburger on mobile, Logo + Brand on desktop */}
        <div className="flex items-center gap-3">
          {/* Hamburger - visible on mobile only */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5f7] text-[#111827] transition-colors hover:bg-[#ff7a3c] hover:text-white"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo + Brand - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe7cc]">
              <span className="text-xl">🍽️</span>
            </div>
            <span className="text-[15px] font-semibold text-[#111827]">
              Momo Magic Cafe
            </span>
          </div>
        </div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/">
            <button className="font-semibold text-[#111827] transition-colors hover:text-[#ff7a3c]">
              Home
            </button>
          </Link>
          <Link to="/menu">
            <button className="font-semibold text-[#111827] transition-colors hover:text-[#ff7a3c]">
              Menu
            </button>
          </Link>
          <Link to="/myorder">
            <button className="font-semibold text-[#111827] transition-colors hover:text-[#ff7a3c]">
              Orders
            </button>
          </Link>
          <Link to="/mybill">
            <button className="font-semibold text-[#111827] transition-colors hover:text-[#ff7a3c]">
              Bill
            </button>
          </Link>
          <Link to="/contact">
            <button className="font-semibold text-[#111827] transition-colors hover:text-[#ff7a3c]">
              Contact
            </button>
          </Link>
        </nav>

        {/* Right: Cart + User Icons */}
        <div className="flex items-center gap-6">
          {/* Desktop icons (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/mycart">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f5f7] text-[#111827] transition-colors hover:bg-[#ff7a3c] hover:text-white">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7a3c] text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            <Link to="/profile">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f5f7] text-[#111827] transition-colors hover:bg-[#ff7a3c] hover:text-white">
                {isAuthenticated && customer?.name ? (
                  <span className="text-sm font-bold">{customer.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={18} />
                )}
              </button>
            </Link>
          </div>

          {/* Mobile: only profile icon visible on right */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/mycart">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5f7] text-[#111827] transition-colors hover:bg-[#ff7a3c] hover:text-white" aria-label="Open cart">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7a3c] text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>

            <Link to="/profile">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5f7] text-[#111827] transition-colors hover:bg-[#ff7a3c] hover:text-white" aria-label="Open profile">
                {isAuthenticated && customer?.name ? (
                  <span className="text-base font-bold">{customer.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={20} />
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 top-16 w-full border-b bg-white shadow-md z-40">
          <div className="flex flex-col gap-3 px-4 py-4">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <button className="w-full text-left py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">Home</button>
            </Link>
            <Link to="/menu" onClick={() => setMenuOpen(false)}>
              <button className="w-full text-left py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">Menu</button>
            </Link>
            <Link to="/myorder" onClick={() => setMenuOpen(false)}>
              <button className="w-full text-left py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">Orders</button>
            </Link>
            <Link to="/mybill" onClick={() => setMenuOpen(false)}>
              <button className="w-full flex items-center gap-3 py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">
                <Receipt size={20} />
                <span>Bill</span>
              </button>
            </Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              <button className="w-full text-left py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">Contact</button>
            </Link>
            <Link to="/mycart" onClick={() => setMenuOpen(false)}>
              <button className="w-full flex items-center gap-3 py-3 text-lg font-semibold text-[#111827] hover:text-[#ff7a3c]">
                <ShoppingCart size={20} />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff7a3c] text-[11px] font-bold text-white">{totalItems}</span>
                )}
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
