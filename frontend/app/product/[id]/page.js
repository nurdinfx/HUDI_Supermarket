"use client";
import React, { useState } from 'react';
import { ShoppingCart, Heart, Share2, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading product...</div>;

  if (!product) {
    return <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Product Not Found or has been removed.</div>;
  }

  const unitPrice = product.discount 
    ? (product.price * (1 - product.discount/100))
    : product.price;

  const finalPrice = unitPrice.toFixed(2);
  const totalPrice = (unitPrice * qty).toFixed(2);
  
  // Create a realistic default rating if none exists
  const rating = product.rating > 0 ? product.rating : (4 + (product.name.length % 10) / 10);
  const numReviews = product.numReviews > 0 ? product.numReviews : (product.name.length * 12 + 15);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
      
      {/* Product Image Gallery (Left - 5 columns) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-5 flex flex-col gap-4">
        <div className="bg-gray-50 rounded-xl flex items-center justify-center p-8 relative border border-gray-200">
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md z-10">
              {product.discount}% OFF Deal
            </div>
          )}
          {/* Share Button Placeholder */}
          <button className="absolute top-4 right-4 bg-white p-2 rounded-full text-gray-500 hover:text-[#2563EB] shadow-sm z-10 border border-gray-200">
            <Share2 size={20} />
          </button>
          
          <div className="w-full h-[400px] relative">
            <img 
              src={product.images?.[0] || '/placeholder.svg'} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply cursor-zoom-in"
              onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }}
            />
          </div>
        </div>
        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 justify-center">
            {product.images.slice(0, 4).map((img, i) => (
              <button key={i} className={`h-20 w-20 rounded-md border-2 p-1 bg-white cursor-pointer ${i===0 ? 'border-[#F97316]' : 'border-gray-200'}`}>
                <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details (Mid - 4 columns) */}
      <div className="col-span-1 md:col-span-7 lg:col-span-4 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 pb-8 lg:pb-0 pr-0 lg:pr-8">
        <a href={`/shop?category=${product.category?.name}`} className="text-[#2563EB] hover:underline text-sm font-medium mb-2 inline-block">
          Brand/Category: {product.category?.name || 'Category'}
        </a>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 leading-snug">{product.name}</h1>
        
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} size={18} className={i < Math.round(rating) ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"} />
              ))}
            </div>
            <a href="#reviews" className="text-[#2563EB] text-sm ml-2 hover:underline">
              {numReviews} ratings
            </a>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          {product.discount > 0 && (
            <div className="text-red-600 text-sm font-bold mb-1">Flash Deal</div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-sm font-bold text-gray-900 mt-1">$</span>
            <span className="text-4xl font-medium text-gray-900">{finalPrice.split('.')[0]}</span>
            <span className="text-sm font-bold text-gray-900 mt-1">{finalPrice.split('.')[1]}</span>
          </div>
          {product.discount > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              List Price: <span className="line-through">${product.price.toFixed(2)}</span>
            </div>
          )}
          <div className="text-sm text-gray-600 mt-2">Inclusive of all taxes</div>
        </div>

        {/* Short Description */}
        <div className="text-gray-700 text-sm leading-relaxed mb-6">
          <h3 className="font-bold mb-2">About this item</h3>
          <ul className="list-disc pl-5 space-y-1">
            {product.description?.split('.').filter(d => d.trim().length > 0).slice(0,4).map((desc, i) => (
              <li key={i}>{desc.trim()}.</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Buy Box (Right - 3 columns) */}
      <div className="col-span-1 md:col-span-5 lg:col-span-3">
         <div className="border border-gray-200 rounded-xl p-5 shadow-sm sticky top-24">
            <div className="text-3xl font-medium text-gray-900 mb-4">${finalPrice}</div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Truck size={20} className="text-gray-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-[#2563EB]">Free Delivery</span> tomorrow
                  <span className="text-gray-500 block leading-tight mt-1">Order within 5 hrs 30 mins</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-gray-600 shrink-0" />
                <span className="text-sm text-gray-700">6 Months warranty included</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={20} className="text-gray-600 shrink-0" />
                <span className="text-sm text-[#2563EB] font-medium hover:underline cursor-pointer">14 days Returnable</span>
              </div>
            </div>

            <div className="mb-6">
              <span className={`text-lg font-medium ${product.countInStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Qty & Add to Cart */}
            {product.countInStock > 0 && (
              <div className="space-y-3">
                <div className="flex items-center border border-gray-300 rounded-md w-fit bg-gray-50 shadow-sm">
                  <span className="px-3 text-sm text-gray-600 bg-gray-100 border-r border-gray-300 h-full flex items-center rounded-l-md font-medium">Qty:</span>
                  <select 
                    className="bg-transparent py-1.5 px-3 text-base outline-none cursor-pointer pr-8 appearance-none"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {[...Array(Math.min(product.countInStock, 10)).keys()].map(x => (
                      <option key={x+1} value={x+1}>{x+1}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center py-2 px-1">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="text-xl font-bold text-[#b12704]">${totalPrice}</span>
                </div>
                
                <button 
                  onClick={() => addToCart(product, qty)}
                  className="w-full bg-[#fae8b2] hover:bg-[#F3C235] text-gray-900 border border-[#F3C235] py-3 rounded-full font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button 
                  onClick={() => {
                    addToCart(product, qty);
                    if (user) {
                      router.push('/checkout');
                    } else {
                      router.push('/login?redirect=/checkout');
                    }
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-bold transition-colors shadow-sm"
                >
                  Buy Now
                </button>
              </div>
            )}

            {/* Wishlist Add */}
            <div className="mt-4 pt-4 border-t border-gray-200">
               <button className="w-full flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 text-gray-600 text-sm font-medium border border-gray-300 shadow-sm transition">
                <Heart size={16} /> Add to List
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
