"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('hudi_wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist:", e);
      }
    }
  }, []);

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem('hudi_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const existItem = prev.find(x => x._id === product._id);
      if (existItem) return prev; // Already in wishlist
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(prev => prev.filter(x => x._id !== id));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(x => x._id === id);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
