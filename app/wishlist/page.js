"use client";

import React from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center">
          <div className="bg-pink-50 p-6 rounded-full mb-8">
            <Heart size={64} className="text-pink-500 fill-pink-500/10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            Save items you love to your wishlist and they'll show up here. Ready to find something special?
          </p>
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <ShoppingBag size={20} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <Link href="/shop" className="text-sm font-bold text-[#2563EB] flex items-center gap-2 mb-2 hover:underline">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <h1 className="text-4xl font-black text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 font-medium">{wishlistItems.length} items saved for later</p>
        </div>
        <button 
          onClick={clearWishlist}
          className="text-red-500 font-bold text-sm flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
        >
          <Trash2 size={18} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlistItems.map((item) => (
          <div key={item._id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="relative aspect-square p-6 bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
              <img 
                src={item.images?.[0] || '/placeholder.svg'} 
                alt={item.name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
              />
              <button 
                onClick={() => removeFromWishlist(item._id)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-gray-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <Link href={`/product/${item._id}`} className="flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-[#2563EB] transition-colors mb-2">
                  {item.name}
                </h3>
              </Link>
              
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">
                    ${(item.discount ? item.price * (1 - item.discount / 100) : item.price).toFixed(2)}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">${item.price.toFixed(2)}</span>
                  )}
                </div>

                <button 
                  onClick={() => addToCart(item, 1)}
                  disabled={item.countInStock === 0}
                  className="w-full bg-[#fae8b2] hover:bg-[#F3C235] text-gray-900 border-2 border-[#F3C235] py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
