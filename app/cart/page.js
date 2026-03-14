"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShieldCheck, ChevronRight, Ticket } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { validateCoupon } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { 
    cartItems, addToCart, removeFromCart, clearCart, itemsPrice,
    discount, setDiscount, appliedCoupon, setAppliedCoupon 
  } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const router = useRouter();

  const subtotal = itemsPrice;
  const discountAmount = (subtotal * discount) / 100;
  const deliveryFee = subtotal * 0.01; 
  const tax = (subtotal - discountAmount) * 0.04; 
  const total = subtotal - discountAmount + deliveryFee + tax;

  const handleApplyCoupon = async () => {
    try {
      setCouponError('');
      const { data } = await validateCoupon({ code: couponCode });
      setDiscount(data.discount);
      setAppliedCoupon(data.code);
    } catch (err) {
      setCouponError('Invalid or expired coupon code');
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const updateQty = (item, newQty) => {
    if(newQty < 1) return;
    addToCart(item, newQty - item.qty, item.size, item.color);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
      <div className="flex justify-between items-center mb-6">
        <Link href="/shop" className="text-[#2563EB] hover:underline text-sm font-medium">← Continue Shopping</Link>
        {cartItems.length > 0 && (
          <button 
            onClick={() => { if(window.confirm('Are you sure you want to clear your bag?')) clearCart(); }}
            className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition"
          >
            <Trash2 size={16} /> Clear Bag
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart Items */}
        <div className="w-full lg:flex-1 space-y-4">
          {cartItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-300">🛒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
              <Link href="/shop" className="bg-[#2563EB] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 hidden sm:grid grid-cols-12 text-sm font-medium text-gray-500 uppercase tracking-wider">
                 <div className="col-span-6">Product</div>
                 <div className="col-span-3 text-center">Quantity</div>
                 <div className="col-span-3 text-right">Total Price</div>
               </div>
               
               <div className="divide-y divide-gray-100">
                  {cartItems.map(item => (
                    <div key={item._id} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center">
                      <div className="col-span-6 flex gap-4 w-full">
                        <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                          <img src={item.images?.[0] || item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link href={`/product/${item._id}`}>
                            <h3 className="text-base font-semibold text-gray-900 hover:text-[#2563EB] transition leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          {item.size && item.color && (
                            <p className="text-xs text-gray-500 mt-1">
                              Size: <span className="font-semibold">{item.size}</span> | Color: <span className="font-semibold capitalize">{item.color}</span>
                            </p>
                          )}
                          <p className="text-green-600 text-xs font-semibold mt-1 mb-2">In Stock</p>
                          <button onClick={() => removeFromCart(item._id, item.size, item.color)} className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1 w-fit transition">
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="col-span-3 flex justify-center w-full sm:w-auto">
                        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                          <button onClick={() => updateQty(item, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition disabled:opacity-50">
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold text-gray-900 w-8 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-3 text-right w-full sm:w-auto">
                        <p className="font-bold text-lg text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                        {item.qty > 1 && <p className="text-xs text-gray-500 mt-1">${item.price.toFixed(2)} each</p>}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-96 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span>Items ({cartItems.reduce((a,c) => a+c.qty, 0)}):</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Discount ({discount}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Delivery Fee (1%):</span>
                <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Tax (4%):</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="text-lg font-bold text-gray-900">Order Total:</span>
              <span className="text-3xl font-bold text-[#b12704]">${total.toFixed(2)}</span>
            </div>

            <div className="mb-6">
               <p className="text-xs text-gray-500 mb-2 font-medium">Have a gift card or promotional code?</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className={`w-full border rounded-lg px-4 py-2 text-sm outline-none transition focus:ring-1 ${
                      couponError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]'
                    }`}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button 
                      onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition whitespace-nowrap"
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition whitespace-nowrap"
                    >
                      Apply
                    </button>
                  ) }
                </div>
                {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><Ticket size={12}/> Coupon {appliedCoupon} applied!</p>}
              </div>
            </div>

            <button 
              onClick={() => {
                if (user) {
                  router.push('/checkout');
                } else {
                  router.push('/login?redirect=/checkout');
                }
              }}
              className="w-full bg-[#fae8b2] hover:bg-[#F3C235] text-gray-900 border border-[#F3C235] py-3 rounded-full font-bold transition-colors shadow-sm flex items-center justify-center gap-2 mb-4"
            >
              Proceed to checkout <ChevronRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
               <ShieldCheck size={16} className="text-green-600" />
               Safe and Secure Payments
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
