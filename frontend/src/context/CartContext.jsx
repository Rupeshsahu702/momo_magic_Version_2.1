/**
 * Cart Context - Manages shopping cart state and order placement.
 * Handles cart items, order creation via API, and order history persistence.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createOrder as createOrderAPI, getSessionOrders } from "@/services/orderService";
import menuService from "@/services/menuService";
import CustomerAuthContext from "./CustomerAuthContext";

const CartContext = createContext();

// Water Bottle product name for auto-add feature
const WATER_BOTTLE_PRODUCT_NAME = "Water Bottle";
// SessionStorage key to track if Water Bottle was manually removed
const WATER_BOTTLE_REMOVED_KEY = "momoMagicWaterBottleRemoved";

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Get authenticated customer from auth context
  const { customer } = useContext(CustomerAuthContext) || {};

  // Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("momoMagicCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // Load order history from localStorage (serves as cache/offline backup)
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      const savedOrders = localStorage.getItem("momoMagicOrders");
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
      console.error("Error loading orders:", error);
      return [];
    }
  });

  // Session ID for grouping orders within a customer's visit (4 hour expiry)
  const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000;
  const [sessionId, setSessionId] = useState(() => {
    try {
      const savedSession = localStorage.getItem("momoMagicSessionId");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Check if session is still valid (within 4 hours)
        if (Date.now() - parsed.timestamp < SESSION_EXPIRY_MS) {
          return parsed.id;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading session:", error);
      return null;
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("momoMagicCart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cartItems]);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("momoMagicOrders", JSON.stringify(orderHistory));
    } catch (error) {
      console.error("Error saving orders:", error);
    }
  }, [orderHistory]);

  // Track if Water Bottle auto-add has been attempted this session
  const waterBottleInitRef = useRef(false);

  // Auto-add Water Bottle on cart initialization (only for fresh carts)
  useEffect(() => {
    const initializeWaterBottle = async () => {
      // Only run once per component mount
      if (waterBottleInitRef.current) return;
      waterBottleInitRef.current = true;

      // Check if Water Bottle was manually removed this session
      const wasRemoved = sessionStorage.getItem(WATER_BOTTLE_REMOVED_KEY) === 'true';
      if (wasRemoved) {
        console.log('🚰 Water Bottle was previously removed, skipping auto-add');
        return;
      }

      // Check if cart already has Water Bottle
      const savedCart = localStorage.getItem("momoMagicCart");
      const currentCart = savedCart ? JSON.parse(savedCart) : [];
      const hasWaterBottle = currentCart.some(item => item.name === WATER_BOTTLE_PRODUCT_NAME);

      if (hasWaterBottle) {
        console.log('🚰 Water Bottle already in cart');
        return;
      }

      // Cart is empty or doesn't have Water Bottle - fetch and add it
      try {
        const waterBottle = await menuService.fetchMenuItemByName(WATER_BOTTLE_PRODUCT_NAME);
        if (waterBottle && waterBottle.availability) {
          console.log('🚰 Auto-adding Water Bottle to cart:', waterBottle._id);
          setCartItems(prev => {
            // Double-check it's not already there
            if (prev.some(item => item.name === WATER_BOTTLE_PRODUCT_NAME)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: waterBottle._id,
                name: waterBottle.productName,
                description: waterBottle.description,
                price: waterBottle.amount,
                quantity: 1,
                image: waterBottle.imageLink || '/images/special_dishes.png',
                isVeg: waterBottle.isVeg,
                isAutoAdded: true  // Flag to identify auto-added items
              }
            ];
          });
        } else {
          console.log('🚰 Water Bottle not available or not found');
        }
      } catch (error) {
        console.error('Error auto-adding Water Bottle:', error);
      }
    };

    initializeWaterBottle();
  }, []); // Run once on mount

  // Get total items in cart
  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const TAX_RATE = 0.08;
    const tax = subtotal * TAX_RATE;
    const deliveryFee = 0;
    const total = subtotal + tax + deliveryFee;

    return { subtotal, tax, deliveryFee, total };
  };

  // Add item to cart (supports items with customizations from modal)
  const addToCart = (item) => {
    setCartItems((prev) => {
      // For items with customizations, we need to check if the exact same customizations exist
      const hasCustomizations = item.customizations && item.customizations.length > 0;

      // Create a unique key for items with customizations
      const getItemKey = (cartItem) => {
        if (cartItem.customizations && cartItem.customizations.length > 0) {
          const customizationKey = cartItem.customizations
            .map(c => c.name)
            .sort()
            .join(',');
          return `${cartItem.id}-${customizationKey}`;
        }
        return cartItem.id;
      };

      const itemKey = getItemKey(item);
      const existingItemIndex = prev.findIndex((i) => getItemKey(i) === itemKey);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prev];
        // If item came with quantity (from modal), add that; otherwise add 1
        const quantityToAdd = item.quantity || 1;
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantityToAdd,
        };
        return updatedItems;
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            isVeg: item.isVeg,
            customizations: item.customizations || [],  // Store selected customizations
          },
        ];
      }
    });
  };

  // Remove item from cart (decrease quantity by 1)
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex((i) => i.id === itemId);

      if (existingItemIndex !== -1) {
        const item = prev[existingItemIndex];
        const updatedItems = [...prev];

        if (updatedItems[existingItemIndex].quantity > 1) {
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity - 1,
          };
          return updatedItems;
        } else {
          // Item is being removed completely - track if it's Water Bottle
          if (item.name === WATER_BOTTLE_PRODUCT_NAME) {
            sessionStorage.setItem(WATER_BOTTLE_REMOVED_KEY, 'true');
            console.log('🚰 Water Bottle removed by user, will not auto-add again this session');
          }
          return updatedItems.filter((i) => i.id !== itemId);
        }
      }
      return prev;
    });
  };

  // Delete item completely from cart
  const deleteFromCart = (itemId) => {
    setCartItems((prev) => {
      // Check if the item being deleted is Water Bottle
      const itemToDelete = prev.find(item => item.id === itemId);
      if (itemToDelete && itemToDelete.name === WATER_BOTTLE_PRODUCT_NAME) {
        sessionStorage.setItem(WATER_BOTTLE_REMOVED_KEY, 'true');
        console.log('🚰 Water Bottle deleted by user, will not auto-add again this session');
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  // Get item quantity
  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("momoMagicCart");
  };

  /**
   * Place order - Creates order in database via API and updates local state.
   * @param {Object} orderDetails - Order details from OrderConfirmation
   * @returns {Promise<Object>} The created order with database ID
   */
  const placeOrder = async (orderDetails) => {
    const now = new Date();
    const { subtotal, tax, total } = calculateTotals();

    // Generate or retrieve session ID for billing purposes
    // Ensure we always have a valid session ID before proceeding
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.log('🔄 No session ID found, creating new session for table:', orderDetails.tableNumber);
      currentSessionId = startNewSession(orderDetails.tableNumber);
    }

    console.log('📋 Using session ID:', currentSessionId);
    console.log('👤 Customer from context:', customer);

    // Prepare order data for API with authenticated customer details
    const orderData = {
      sessionId: currentSessionId,
      orderNumber: orderDetails.orderNumber,
      tableNumber: parseInt(orderDetails.tableNumber),
      // Use authenticated customer name if available, otherwise fall back to provided name or Guest
      customerName: customer?.name || orderDetails.customerName || 'Guest',
      customerPhone: customer?.phone || '',
      customerEmail: customer?.email || '',
      // Map authenticated customer ID to userId for backend schema compatibility
      userId: customer?._id || customer?.id || null,
      // Also send customerId for middleware to attach customer to req.customer
      customerId: customer?._id || customer?.id || null,
      items: cartItems.map((item) => ({
        menuItemId: item.id,  // Store menu item reference
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        description: item.description || '',
        imageLink: item.image || ''  // Store image URL for display
      })),
      subtotal,
      tax,
      total,
      estimatedTime: orderDetails.estimatedTime || '15-20 mins',
    };

    console.log('📦 Placing order with data:', orderData);
    console.log('👤 Authenticated customer:', customer);
    console.log('🔍 userId being sent:', orderData.userId);
    console.log('🔍 customerId being sent:', orderData.customerId);

    // Validate that sessionId is present before making API call
    if (!orderData.sessionId) {
      console.error('❌ Session ID is missing! Cannot create order.');
      throw new Error('Session ID is required to place an order');
    }

    try {
      // Call API to create order in database
      console.log('🚀 Calling createOrderAPI...');
      const response = await createOrderAPI(orderData);
      console.log('✅ Order created successfully:', response);
      const savedOrder = response.data;

      // Create local order object for UI display
      const localOrder = {
        id: savedOrder._id,
        _id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        tableNumber: savedOrder.tableNumber,
        status: savedOrder.status.toUpperCase(),
        items: cartItems.map((item) => ({
          quantity: item.quantity,
          name: item.name.toUpperCase(),
          description: item.description,
          price: item.price,
        })),
        itemCount: cartItems.length,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        tax: savedOrder.tax,
        date: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        fullDate: now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        estimatedTime: savedOrder.estimatedTime,
        image: cartItems[0]?.image || '/images/special_dishes.png',
        timestamp: savedOrder.createdAt,
        barcode: `0192847${Math.floor(10000 + Math.random() * 90000)}`,
      };

      // Add to local order history
      setOrderHistory((prev) => [localOrder, ...prev]);

      // Clear cart after successful order
      clearCart();

      return localOrder;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  };

  /**
   * Update order status in local state (called when receiving WebSocket events).
   * @param {string} orderId - The order ID
   * @param {string} newStatus - The new status
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrderHistory((prev) =>
      prev.map((order) =>
        order._id === orderId || order.id === orderId
          ? { ...order, status: newStatus.toUpperCase() }
          : order
      )
    );
  };

  // Get today's orders
  const getTodaysOrders = () => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });

    return orderHistory.filter((order) => order.fullDate === today);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  /**
   * Start a new billing session for a table.
   * @param {number} tableNumber - The table number
   * @returns {string} The new session ID
   */
  const startNewSession = (tableNumber) => {
    const newSessionId = `session_${tableNumber}_${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem('momoMagicSessionId', JSON.stringify({
      id: newSessionId,
      timestamp: Date.now(),
      tableNumber
    }));
    return newSessionId;
  };

  /**
   * End the current billing session (after payment is complete).
   */
  const endSession = () => {
    setSessionId(null);
    setOrderHistory([]);
    localStorage.removeItem('momoMagicSessionId');
    localStorage.removeItem('momoMagicOrders');
  };

  /**
   * Fetch orders from the server for the current session.
   * Syncs local state with actual database orders.
   * @returns {Promise<Array>} The fetched orders, or empty array on error
   */
  const fetchSessionOrders = useCallback(async () => {
    if (!sessionId) {
      console.log('No session ID available for fetching orders');
      return [];
    }

    try {
      const response = await getSessionOrders(sessionId);
      const serverOrders = response.data || [];

      // Transform server orders to match local format
      const transformedOrders = serverOrders.map((order) => ({
        id: order._id,
        _id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        status: order.status.toUpperCase(),
        items: order.items.map((item) => ({
          quantity: item.quantity,
          name: item.name.toUpperCase(),
          description: item.description,
          price: item.price,
          imageLink: item.imageLink || ''  // Preserve image link from order item
        })),
        itemCount: order.items.length,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        fullDate: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
        time: new Date(order.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        estimatedTime: order.estimatedTime,
        billingStatus: order.billingStatus || 'unpaid',
        image: order.items[0]?.imageLink || '/images/special_dishes.png',
        timestamp: order.createdAt,
        barcode: `0192847${Math.floor(10000 + Math.random() * 90000)}`,
      }));

      // Update local state with server data
      setOrderHistory(transformedOrders);
      return transformedOrders;

    } catch (error) {
      console.error('Error fetching session orders:', error);
      // Return empty array on error - cached orders remain in state
      return [];
    }
  }, [sessionId]); // Only depend on sessionId to prevent infinite loops

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orderHistory,
        sessionId,
        addToCart,
        removeFromCart,
        deleteFromCart,
        getItemQuantity,
        getTotalItems,
        calculateTotals,
        clearCart,
        placeOrder,
        updateOrderStatus,
        getTodaysOrders,
        getTotalPrice,
        startNewSession,
        endSession,
        fetchSessionOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

