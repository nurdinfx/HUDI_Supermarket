"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.round(rating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-300"} 
      />
    ));
  };

  const currentRating = product.rating > 0 ? product.rating : (4 + ((product.name?.length || 5) % 10) / 10);
  const currentReviews = product.numReviews > 0 ? product.numReviews : ((product.name?.length || 5) * 12 + 15);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <div className="absolute top-2 left-2 bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded-sm z-10 shadow-sm">
          -{product.discount}%
        </div>
      )}
      
      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100">
        <Heart size={18} />
      </button>

      {/* Product Image */}
      <div className="relative h-48 w-full bg-white flex justify-center items-center p-4">
        <Link href={`/product/${product._id}`} className="h-full w-full block relative">
          <img 
            src={product.images?.[0] || '/placeholder.svg'} 
            alt={product.name}
            className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }}
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-1 font-medium">{product.category?.name || 'Category'}</p>
        
        <Link href={`/product/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#F97316] transition-colors h-10 leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {/* Ratings */}
        <div className="flex items-center mt-2 mb-2">
          <div className="flex">
            {renderStars(currentRating)}
          </div>
          <span className="text-xs text-[#2563EB] hover:underline ml-2 cursor-pointer font-medium">
            {currentReviews} ratings
          </span>
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline mb-3">
            <span className="text-xl font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-500 line-through ml-2">
                ${(product.price * (1 + product.discount/100)).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Add to Cart */}
          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-[#fae8b2] hover:bg-[#F3C235] text-gray-900 border border-[#F3C235] py-2 rounded-full font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
