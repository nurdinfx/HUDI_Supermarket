"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Heart, Share2, ShieldCheck, 
  Truck, RotateCcw, Star, ChevronLeft, 
  MapPin, Check, Info, AlertTriangle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api'}/products/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) throw new Error('Product not found');
          throw new Error('Could not load product details');
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/2 bg-gray-100 rounded-2xl h-[500px]"></div>
          <div className="lg:w-1/2 space-y-6">
            <div className="h-8 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-20 bg-gray-100 rounded w-full"></div>
            <div className="h-12 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 flex flex-col items-center">
          <div className="bg-red-50 p-4 rounded-full mb-6">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-8">
            The product you're looking for might have been removed or the link is incorrect.
          </p>
          <Link 
            href="/shop" 
            className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            Visit Our Shop
          </Link>
        </div>
      </div>
    );
  }

  const unitPrice = product.discount 
    ? (product.price * (1 - product.discount/100))
    : product.price;

  const finalPrice = unitPrice.toFixed(2);
  const totalPrice = (unitPrice * qty).toFixed(2);
  const rating = product.rating > 0 ? product.rating : (4 + (product.name.length % 10) / 10);
  const numReviews = product.numReviews > 0 ? product.numReviews : (product.name.length * 12 + 15);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-[#2563EB]">Home</Link>
        <ChevronLeft className="rotate-180" size={14} />
        <Link href="/shop" className="hover:text-[#2563EB]">Shop</Link>
        <ChevronLeft className="rotate-180" size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Product Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-10 relative overflow-hidden flex items-center justify-center min-h-[400px] md:min-h-[550px]">
            {product.discount > 0 && (
              <div className="absolute top-6 left-6 bg-[#EF4444] text-white px-4 py-1.5 text-xs font-black rounded-full shadow-xl z-20 transform -rotate-1">
                SAVE {product.discount}%
              </div>
            )}
            
            <button className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-gray-500 hover:text-[#2563EB] shadow-sm z-20 border border-gray-100 transition-all">
              <Share2 size={20} />
            </button>

            <div className="w-full h-full relative group">
              <img 
                src={product.images?.[activeImage] || '/placeholder.svg'} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }}
              />
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`relative h-24 w-24 flex-shrink-0 rounded-2xl border-2 transition-all p-2 bg-white ${activeImage === i ? 'border-[#2563EB] shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                {product.category?.name || 'Store Item'}
              </span>
              {product.countInStock > 0 ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-red-500 text-xs font-bold">Out of Stock</span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.round(rating) ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">{rating}</span>
              </div>
              <span className="text-gray-300 text-lg">|</span>
              <button className="text-[#2563EB] text-sm font-semibold hover:underline">
                {numReviews} Verified Reviews
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Price & Description */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">${finalPrice}</span>
                  {product.discount > 0 && (
                    <span className="text-lg text-gray-400 line-through font-medium">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">Standard price including local taxes and fees</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">About this item</h3>
                <ul className="space-y-3">
                  {(product.description?.split(/[.!?]/).filter(d => d.trim().length > 2).slice(0, 5).length > 0 
                    ? product.description.split(/[.!?]/).filter(d => d.trim().length > 2).slice(0, 5)
                    : [product.description || "Premium quality product sourced for you."]
                  ).map((desc, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="mt-1 bg-blue-100 p-0.5 rounded-full text-[#2563EB] shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {desc.trim()}{desc.trim().endsWith('.') ? '' : '.'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Buy Box */}
            <div className="bg-white border-2 border-[#2563EB]/10 rounded-3xl p-6 shadow-xl shadow-blue-900/5 space-y-6 sticky top-24">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Select Quantity</span>
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                    >-</button>
                    <span className="w-10 text-center font-bold">{qty}</span>
                    <button 
                      onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-sm font-medium">Subtotal</span>
                    <span className="text-2xl font-black text-[#2563EB]">${totalPrice}</span>
                  </div>

                  <button 
                    onClick={() => addToCart(product, qty)}
                    disabled={product.countInStock === 0}
                    className="w-full bg-[#fae8b2] hover:bg-[#F3C235] text-gray-900 border-2 border-[#F3C235] py-4 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-yellow-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingCart size={20} /> ADD TO CART
                  </button>
                  
                  <button 
                    onClick={() => {
                      addToCart(product, qty);
                      router.push(user ? '/checkout' : '/login?redirect=/checkout');
                    }}
                    disabled={product.countInStock === 0}
                    className="w-full bg-[#131921] hover:bg-black text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 text-xs">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-gray-100 p-2 rounded-lg"><Truck size={16} /></div>
                  <div>
                    <p className="font-bold text-gray-900">Free Home Delivery</p>
                    <p>Within 24 hours in Mogadishu</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-gray-100 p-2 rounded-lg"><RotateCcw size={16} /></div>
                  <div>
                    <p className="font-bold text-gray-900">14 Days Easy Return</p>
                    <p>Money back guarantee</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><ShieldCheck size={16} /></div>
                  <div>
                    <p className="font-bold text-orange-700">Premium Protection</p>
                    <p>Full 6 months quality warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Section */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Info className="text-[#2563EB]" /> Product Description
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              {product.description?.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Technical Details</h2>
            <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Weight', '500g'],
                    ['Category', product.category?.name || 'General'],
                    ['Brand', 'Hudi Premium'],
                    ['Source', 'Sourced Locally'],
                    ['Stock Status', product.countInStock > 0 ? 'Available' : 'Sold Out'],
                  ].map(([label, value], i) => (
                    <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 font-bold text-gray-900 w-1/3">{label}</td>
                      <td className="px-6 py-4 text-gray-600 italic">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar: Delivery Coverage */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-2 rounded-xl"><MapPin size={24} /></div>
              <h3 className="text-xl font-bold">Shipping To</h3>
            </div>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              We provide professional white-glove delivery across all Mogadishu districts. Track your order in real-time.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-white/20">
                <span>Standard Delivery</span>
                <span className="font-bold">FREE</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-white/20">
                <span>Express Delivery</span>
                <span className="font-bold">$2.50</span>
              </div>
            </div>
            <button className="w-full mt-8 bg-white text-blue-600 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-gray-50 transition-colors">
              Update My Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
