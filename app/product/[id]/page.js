"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Heart, Share2, ShieldCheck, 
  Truck, RotateCcw, Star, ChevronLeft, 
  MapPin, Check, Info, AlertTriangle, MessageSquare,
  Minus, Plus, ChevronRight, Bookmark, Globe
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const getColorInEnglish = (somaliColor) => {
  const map = {
    'cadaan': '#FFFFFF',
    'madow': '#000000',
    'casaan': '#FF0000',
    'buluug': '#0000FF',
    'cagaar': '#008000',
    'buni': '#8B4513',
    'buluug-maari': '#000080',
    'huruud': '#FFFF00',
    'liimi': '#FFA500',
    'casuus': '#FFC0CB'
  };
  return map[somaliColor.toLowerCase()] || '#CCCCCC';
};

export default function ProductPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  
  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';
      const res = await fetch(`${apiUrl}/products/${id}`);
      
      if (!res.ok) {
        if (res.status === 404) throw new Error('Product not found');
        throw new Error('Could not load product details');
      }
      
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    try {
      setReviewLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${apiUrl}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        setReviewSuccess(true);
        setComment('');
        setRating(5);
        fetchProduct(); // Refresh product to show new review
        setTimeout(() => setReviewSuccess(false), 5000);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error submitting review');
      }
    } catch (err) {
      alert('Network error submitting review');
    } finally {
      setReviewLoading(false);
    }
  };

  const hasVariants = product?.variants && product.variants.length > 0;
  const availableSizes = hasVariants ? [...new Set(product.variants.map(v => v.sizeLabel.trim()))] : [];
  const availableColors = hasVariants 
    ? [...new Set(product.variants.filter(v => !selectedSize || v.sizeLabel.trim() === selectedSize.trim()).map(v => v.color.trim()))] 
    : [];

  const selectedVariant = hasVariants && selectedSize && selectedColor 
    ? product.variants.find(v => v.sizeLabel.trim() === selectedSize.trim() && v.color.trim() === selectedColor.trim()) 
    : null;
    
  useEffect(() => {
    if (hasVariants) {
      if (!selectedSize && availableSizes.length === 1) setSelectedSize(availableSizes[0]);
      if (selectedSize && !selectedColor && availableColors.length === 1) setSelectedColor(availableColors[0]);
    }
  }, [hasVariants, availableSizes, availableColors, selectedSize, selectedColor]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 bg-[#f9f9f9] animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3 h-[600px] bg-white rounded-lg"></div>
          <div className="lg:w-1/3 space-y-8">
            <div className="h-10 bg-white rounded w-full"></div>
            <div className="h-6 bg-white rounded w-1/2"></div>
            <div className="h-24 bg-white rounded w-full"></div>
            <div className="h-40 bg-white rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-black uppercase mb-4">Product Not Found</h2>
        <Link href="/shop" className="text-blue-600 font-bold hover:underline font-serif italic text-lg">Return to Supermarket</Link>
      </div>
    );
  }

  const currentStock = hasVariants ? (selectedVariant ? selectedVariant.stock : 0) : product.countInStock;
  const unitPrice = product.discount ? (product.price * (1 - product.discount/100)) : product.price;
  const finalPrice = unitPrice.toFixed(2);
  const marketPrice = (unitPrice * 1.25).toFixed(2); // Mock for RRP

  const handleAddToCart = (redirectCheckout = false) => {
    if (hasVariants && (!selectedSize || !selectedColor)) {
      alert("Please select size and color.");
      return;
    }
    addToCart(product, qty, selectedSize, selectedColor);
    if (redirectCheckout) {
      router.push(user ? '/checkout' : '/login?redirect=/checkout');
    } else {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  // Review Distribution calculation
  const reviewStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (product.reviews && product.reviews.length > 0) {
    product.reviews.forEach(r => {
      reviewStats[r.rating] = (reviewStats[r.rating] || 0) + 1;
    });
  }
  const totalReviews = product.reviews?.length || 0;

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 text-[11px] text-gray-500 flex items-center gap-2 uppercase tracking-tight">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight size={10} />
        <Link href="/shop" className="hover:text-black">Supermarket</Link>
        <ChevronRight size={10} />
        <span className="text-gray-400 font-bold">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        
        {/* Left: Professional Image Gallery */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4">
          {/* Thumbnails Sidebar */}
          <div className="hidden md:flex flex-col gap-3 w-20 sticky top-[120px] h-fit">
            {(product.images && product.images.length > 0 ? product.images : [product.image || '/placeholder.svg']).map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-16 h-20 rounded-sm overflow-hidden border transition-all ${activeImage === i ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-400'}`}
              >
                <img src={img.replace('http://', 'https://')} alt="" className="w-full h-full object-cover mix-blend-multiply" />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 bg-white border border-gray-100 relative group overflow-hidden">
            <div className="aspect-[3/4] flex items-center justify-center p-4">
               <img 
                 src={(product.images?.[activeImage] || product.image || '/placeholder.svg').replace('http://', 'https://')} 
                 alt={product.name}
                 className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
               />
            </div>
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                -{product.discount}% OFF
              </div>
            )}
            
            {/* Action Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="bg-white/90 p-3 rounded-full shadow-lg border border-gray-100 hover:bg-black hover:text-white transition-all"><Share2 size={18}/></button>
               <button onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)} className={`bg-white/90 p-3 rounded-full shadow-lg border border-gray-100 transition-all ${isInWishlist(product._id) ? 'text-red-500' : 'hover:text-red-500'}`}>
                 <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
               </button>
            </div>
          </div>
        </div>

        {/* Right: Premium Product Info */}
        <div className="lg:col-span-4 space-y-8 sticky top-[100px] h-fit bg-white p-6 md:p-8 border border-gray-100 shadow-sm rounded-sm">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>SKU: {product._id.substring(0, 10)}</span>
                <span className="h-3 w-[1px] bg-gray-200"></span>
                <div className="flex items-center gap-1 text-yellow-500">
                   {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'} className={i < Math.round(product.ratings) ? '' : 'text-gray-200'} />)}
                   <span className="text-black ml-1">({product.numReviews}+ Reviews)</span>
                </div>
             </div>
             <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">
                {product.name}
             </h1>
          </div>

          <div className="py-4 border-y border-gray-100 space-y-2">
             <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-red-600">${finalPrice}</span>
                <span className="text-sm text-gray-400 line-through font-medium">${marketPrice}</span>
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-sm">-{product.discount}%</span>
             </div>
             <p className="text-[11px] font-bold text-green-600 uppercase tracking-tight">Special Free Shipping Deal Available</p>
          </div>

          {/* Color Selection */}
          {hasVariants && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[12px]">
                 <span className="font-black text-black uppercase tracking-widest">Color: <span className="text-gray-400 font-bold capitalize ml-1">{selectedColor || 'Select'}</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {availableColors.map(c => (
                   <button 
                     key={c}
                     onClick={() => setSelectedColor(c)}
                     className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all ${selectedColor === c ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
                   >
                     <span className="block w-full h-full rounded-full" style={{ backgroundColor: getColorInEnglish(c) }}></span>
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {hasVariants && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[12px]">
                 <span className="font-black text-black uppercase tracking-widest">Size: <span className="text-gray-400 font-bold ml-1">{selectedSize || 'Select'}</span></span>
                 <button className="flex items-center gap-1 text-gray-400 hover:text-black font-bold uppercase transition-colors"><Bookmark size={12}/> Size Guide</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {availableSizes.map(s => (
                   <button 
                     key={s}
                     onClick={() => setSelectedSize(s)}
                     className={`py-2 text-[12px] font-black uppercase tracking-tighter transition-all border ${selectedSize === s ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-4">
               <div className="flex items-center border border-gray-200 h-11 px-2 gap-4">
                 <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-400 hover:text-black transition-colors"><Minus size={16}/></button>
                 <span className="text-[15px] font-black w-6 text-center">{qty}</span>
                 <button onClick={() => setQty(Math.min(currentStock || 1, qty + 1))} className="text-gray-400 hover:text-black transition-colors"><Plus size={16}/></button>
               </div>
               <button 
                onClick={() => handleAddToCart(false)}
                className="flex-1 bg-black text-white h-11 text-[13px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98]"
               >
                 Add To Cart
               </button>
            </div>
            
            <button 
              onClick={() => handleAddToCart(true)}
              className="w-full bg-[#fae8b2] hover:bg-[#ebc351] text-gray-900 h-11 text-[13px] font-black uppercase tracking-widest transition-all border border-[#ebc351]"
            >
              Buy It Now
            </button>

            {addedToCart && (
              <div className="bg-black text-white text-center py-2 text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                 Item Added Successfully!
              </div>
            )}
          </div>

          {/* Trust Sections */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
             <div className="flex flex-col items-center text-center p-3 bg-gray-50/50 rounded-sm">
                <Truck size={18} className="mb-2 text-black"/>
                <span>Free Worldwide<br/>Shipping</span>
             </div>
             <div className="flex flex-col items-center text-center p-3 bg-gray-50/50 rounded-sm">
                <RotateCcw size={18} className="mb-2 text-black"/>
                <span>30 Days<br/>Easy Return</span>
             </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Description, Reviews) */}
      <div className="max-w-[1400px] mx-auto px-4 mt-20">
         <div className="flex border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
            {['description', 'reviews', 'shipping'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-8 py-4 text-[13px] font-black uppercase tracking-widest transition-all border-b-2 hover:text-black ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
              >
                {tab === 'shipping' ? 'Shipping & Returns' : tab === 'description' ? 'Product Description' : `Customer Reviews (${totalReviews})`}
              </button>
            ))}
         </div>

         {/* Tab Content */}
         <div className="min-h-[400px] bg-white p-6 md:p-10 border border-gray-100 rounded-sm overflow-hidden">
            {activeTab === 'description' && (
              <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
                 <div className="space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-tighter">About The {product.name}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{product.description}</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                       <h3 className="font-black uppercase text-xs tracking-widest text-[#2563EB]">Technical Specs</h3>
                       <div className="divide-y divide-gray-100 border-t border-gray-100">
                          <div className="py-3 flex justify-between"><span className="text-gray-400 font-bold uppercase text-[10px]">Composition</span><span className="font-black uppercase text-[11px]">80% Cotton, 20% Polyester</span></div>
                          <div className="py-3 flex justify-between"><span className="text-gray-400 font-bold uppercase text-[10px]">Weight</span><span className="font-black uppercase text-[11px]">450g Premium Grade</span></div>
                          <div className="py-3 flex justify-between"><span className="text-gray-400 font-bold uppercase text-[10px]">SKU Number</span><span className="font-black uppercase text-[11px]">{product._id.substring(0,8)}</span></div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="font-black uppercase text-xs tracking-widest text-[#2563EB]">Care Instructions</h3>
                       <p className="text-[11px] font-bold text-gray-500 uppercase leading-loose">
                         Machine wash cold (30°C) with similar colors.<br/>
                         Do not bleach. Tumble dry low.<br/>
                         Warm iron if needed. Do not dry clean.
                       </p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-12 gap-12">
                 {/* Rating Summary Sidebar */}
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-gray-50 p-8 rounded-sm text-center border border-gray-100">
                       <h2 className="text-sm font-black uppercase tracking-widest mb-4">Overall Rating</h2>
                       <div className="text-6xl font-black mb-2">{product.ratings.toFixed(2)}</div>
                       <div className="flex justify-center gap-1 text-yellow-500 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'} className={i < Math.round(product.ratings) ? '' : 'text-gray-200'} />)}
                       </div>
                       <p className="text-[11px] font-bold text-gray-500 uppercase">Based on {totalReviews} Reviews</p>
                    </div>

                    <div className="space-y-3">
                       {[5, 4, 3, 2, 1].map(lvl => {
                         const percent = totalReviews > 0 ? (reviewStats[lvl] / totalReviews) * 100 : 0;
                         return (
                           <div key={lvl} className="flex items-center gap-4 group">
                              <span className="w-10 text-[11px] font-black text-gray-500">{lvl} Star</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                 <div className="absolute top-0 left-0 h-full bg-black group-hover:bg-yellow-500 transition-all duration-700" style={{ width: `${percent}%` }}></div>
                              </div>
                              <span className="w-10 text-[11px] font-black text-gray-900">{percent.toFixed(0)}%</span>
                           </div>
                         );
                       })}
                    </div>

                    {/* Write Review Form */}
                    <div className="pt-8 border-t border-gray-100">
                       {user ? (
                         <form onSubmit={submitReviewHandler} className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"><MessageSquare size={16}/> Write A Review</h3>
                            
                            {reviewSuccess && <div className="bg-green-100 text-green-700 p-3 text-xs font-bold rounded-sm uppercase tracking-widest animate-in slide-in-from-top-2">Thank you! Your review was shared.</div>}

                            <div>
                               <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">My Rating</label>
                               <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                      type="button" 
                                      key={star} 
                                      onClick={() => setRating(star)} 
                                      className={`p-1 transition-all ${rating >= star ? 'text-yellow-500 scale-110' : 'text-gray-200 hover:text-yellow-300'}`}
                                    >
                                      <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                                    </button>
                                  ))}
                               </div>
                            </div>
                            
                            <div>
                               <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Comment</label>
                               <textarea 
                                 rows="4" 
                                 required
                                 value={comment}
                                 onChange={(e) => setComment(e.target.value)}
                                 className="w-full bg-gray-50 border border-gray-200 p-4 text-sm outline-none focus:border-black transition-all resize-none font-medium placeholder:text-gray-300"
                                 placeholder="Tell us about your experience..."
                               />
                            </div>
                            
                            <button 
                              type="submit" 
                              disabled={reviewLoading}
                              className="w-full bg-black text-white py-3 text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                               {reviewLoading ? 'Sharing...' : 'Share Review'}
                            </button>
                         </form>
                       ) : (
                         <div className="text-center p-6 bg-gray-50 rounded-sm">
                            <p className="text-[11px] font-bold text-gray-500 uppercase mb-4">Professional reviews are only available for our members.</p>
                            <Link href={`/login?redirect=/product/${id}`} className="inline-block bg-black text-white px-8 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Sign In To Review</Link>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Reviews List */}
                 <div className="lg:col-span-8 space-y-10">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                       <h2 className="text-sm font-black uppercase tracking-widest">Verified Customer Experiences</h2>
                       <select className="text-[11px] font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer">
                          <option>Sort By: Newest</option>
                          <option>Sort By: High Rating</option>
                          <option>Sort By: Low Rating</option>
                       </select>
                    </div>

                    {totalReviews === 0 ? (
                      <div className="py-20 text-center space-y-4">
                         <div className="text-gray-200 flex justify-center"><MessageSquare size={64}/></div>
                         <p className="text-gray-400 text-sm font-bold uppercase tracking-widest italic">No experiences shared for this product yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                         {product.reviews.map(rev => (
                           <div key={rev._id} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                              <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-xs">
                                       {rev.name.charAt(0)}
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black uppercase tracking-tighter leading-none">{rev.name}</h4>
                                       <div className="flex items-center gap-2 mt-1">
                                          <div className="flex text-yellow-500">
                                             {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < rev.rating ? 'currentColor' : 'none'} className={i < rev.rating ? '' : 'text-gray-200'} />)}
                                          </div>
                                          <span className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1"><Check size={8} strokeWidth={4}/> Verified Purchase</span>
                                       </div>
                                    </div>
                                 </div>
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-600 text-[13px] leading-relaxed font-medium pl-[52px]">{rev.comment}</p>
                              <div className="flex gap-4 pl-[52px]">
                                 <button className="text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors">Helpful (0)</button>
                                 <button className="text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors">Report</button>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center uppercase tracking-widest">
                    <div className="space-y-4 p-6 bg-gray-50 rounded-sm">
                       <MapPin size={32} className="mx-auto text-black"/>
                       <h3 className="text-xs font-black">24H Delivery</h3>
                       <p className="text-[10px] font-bold text-gray-500 leading-relaxed">Fast local distribution across all Mogadishu districts.</p>
                    </div>
                    <div className="space-y-4 p-6 bg-gray-50 rounded-sm">
                       <ShieldCheck size={32} className="mx-auto text-black"/>
                       <h3 className="text-xs font-black">Secure Checkout</h3>
                       <p className="text-[10px] font-bold text-gray-500 leading-relaxed">International grade encryption on all transactions.</p>
                    </div>
                    <div className="space-y-4 p-6 bg-gray-50 rounded-sm">
                       <Globe size={32} className="mx-auto text-black"/>
                       <h3 className="text-xs font-black">Global Standards</h3>
                       <p className="text-[10px] font-bold text-gray-500 leading-relaxed">Quality products handled with professional care.</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-tighter">Shipping Information</h2>
                    <ul className="space-y-4 text-[12px] font-medium text-gray-600 list-disc pl-5 leading-loose">
                       <li>Standard shipping is free for orders over $50 within Mogadishu.</li>
                       <li>Orders are typically processed within 1-2 professional business hours.</li>
                       <li>You will receive a real-time push notification once your rider is on the way.</li>
                       <li>For international shipping queries, please contact our 24/7 customer support.</li>
                    </ul>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
