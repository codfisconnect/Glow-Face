import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types";

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: string[];
  isInWishlist: (productIdOrSlug: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productIdOrSlug: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("glow_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("glow_wishlist", JSON.stringify(wishlist));
    } catch (err) {
      console.warn("Could not save wishlist to localStorage", err);
    }
  }, [wishlist]);

  const wishlistIds = wishlist.map(p => p.id);

  const isInWishlist = (idOrSlug: string) => {
    return wishlist.some(p => p.id === idOrSlug || p.slug === idOrSlug);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id || p.slug === product.slug);
      if (exists) {
        return prev.filter(p => p.id !== product.id && p.slug !== product.slug);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (idOrSlug: string) => {
    setWishlist(prev => prev.filter(p => p.id !== idOrSlug && p.slug !== idOrSlug));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};