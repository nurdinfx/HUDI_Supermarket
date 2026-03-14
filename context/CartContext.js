"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCategories } from '@/utils/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hudi_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('hudi_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1, size = '', color = '') => {
    const s = size || '';
    const c = color || '';
    setCartItems(prev => {
      const existItem = prev.find(x => x._id === product._id && (x.size || '') === s && (x.color || '') === c);
      if (existItem) {
        return prev.map(x => (x._id === product._id && (x.size || '') === s && (x.color || '') === c) ? { ...x, qty: x.qty + qty } : x);
      } else {
        return [...prev, { ...product, qty, size: s, color: c }];
      }
    });
  };

  const removeFromCart = (id, size = '', color = '') => {
    const s = size || '';
    const c = color || '';
    setCartItems(prev => prev.filter(x => !(x._id === id && (x.size || '') === s && (x.color || '') === c)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, clearCart, itemsPrice, totalItems,
      discount, setDiscount, appliedCoupon, setAppliedCoupon 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
