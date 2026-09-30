import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  shipping: number;
  freeShippingThreshold: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING_FEE = 49;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("glow_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("glow_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.warn("Could not save cart to localStorage", err);
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : STANDARD_SHIPPING_FEE;

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id || item.slug === product.slug);
      const maxStock = product.stock !== undefined ? product.stock : 999;

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map(item =>
          item.productId === existing.productId
            ? { ...item, quantity: newQty }
            : item
        );
      }

      const initialQty = Math.min(quantity, maxStock);
      if (initialQty < 1) return prev; // out of stock guard

      return [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity: initialQty,
          image: product.image,
          maxStock
        }
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId && item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId || item.id === productId) {
          const max = item.maxStock || 999;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        shipping,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};