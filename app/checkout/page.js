"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import api from '@/utils/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample');

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, itemsPrice, clearCart, discount } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [payment, setPayment] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [senderPhoneNumber, setSenderPhoneNumber] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, router]);

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG or PDF.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setScreenshot(data);
      setScreenshotPreview(URL.createObjectURL(file));
      setUploading(false);
    } catch (err) {
      setError('Failed to upload screenshot. Please try again.');
      setUploading(false);
    }
  };

  const subtotal = itemsPrice;
  const discountAmount = (subtotal * discount) / 100;
  const deliveryFee = subtotal * 0.01;
  const tax = (subtotal - discountAmount) * 0.04; 
  const total = subtotal - discountAmount + deliveryFee + tax;



  const handlePlaceOrder = async (paymentId = null) => {
    if (payment === 'Mobile Money Payment') {
      if (!screenshot) {
        setError('Please upload your payment screenshot before placing the order.');
        return;
      }
      if (!senderPhoneNumber) {
        setError('Please enter your sender phone number.');
        return;
      }
    }

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.images?.[0] || item.image || '/placeholder.svg',
          price: item.price,
          product: item._id,
          size: item.size || 'N/A',
          color: item.color || 'N/A'
        })),
        shippingAddress: address,
        paymentMethod: payment,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: deliveryFee,
        totalPrice: total,
        discountPrice: discountAmount,
        paymentProofImage: screenshot,
        senderPhoneNumber: payment === 'Mobile Money Payment' ? senderPhoneNumber : undefined,
        transactionReference: payment === 'Mobile Money Payment' ? transactionReference : undefined,
        isPaid: !!paymentId,
        paidAt: paymentId ? new Date() : null,
        paymentResult: paymentId ? { id: paymentId, status: 'succeeded', update_time: new Date().toISOString(), email_address: user.email } : null
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      router.push(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (isCheckingAuth || !user) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col justify-center items-center text-center">
        <Lock size={48} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
        <p className="text-gray-500 mb-6">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <div className="flex items-center justify-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Checkout <Lock size={24} className="text-gray-400" />
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Main Checkout Area */}
        <div className="flex-1 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all ${step === 1 ? 'shadow-md border-[#2563EB]' : 'bg-gray-50'}`}>
             <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => step > 1 && setStep(1)}>
               <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-[#2563EB] text-white' : 'bg-gray-300 text-gray-600'}`}>1</span>
                 Shipping Address
               </h2>
               {step > 1 && <span className="text-[#2563EB] text-sm font-medium hover:underline">Change</span>}
             </div>
             
             {step === 1 && (
               <div className="p-6 pt-0 border-t border-gray-100 bg-white">
                 <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" placeholder="First and Last Name" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="Street address, P.O. box, company name, c/o" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                          <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="bg-[#fae8b2] hover:bg-[#F3C235] border border-[#F3C235] text-gray-900 px-6 py-2.5 rounded-lg font-bold shadow-sm transition w-full sm:w-auto">Use this address</button>
                    </div>
                 </form>
               </div>
             )}
             
             {step > 1 && (
               <div className="px-6 pb-6 pt-0 ml-11 text-sm text-gray-600">
                 {address.street}, {address.city}, {address.state} {address.zip}
               </div>
             )}
          </div>

          {/* Step 2: Payment Method */}
          <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all ${step === 2 ? 'shadow-md border-[#2563EB]' : 'bg-gray-50'}`}>
             <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => step > 2 && setStep(2)}>
               <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-[#2563EB] text-white' : step > 2 ? 'bg-[#2563EB] text-white' : 'bg-gray-300 text-gray-600'}`}>
                   {step > 2 ? <CheckCircle2 size={16} /> : '2'}
                 </span>
                 Payment Method
               </h2>
               {step > 2 && <span className="text-[#2563EB] text-sm font-medium hover:underline">Change</span>}
             </div>

             {step === 2 && (
               <div className="p-6 pt-0 border-t border-gray-100 bg-white">
                 <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4 pt-4">
                     <div className="space-y-3">
                      {['Cash on Delivery', 'Mobile Money Payment', 'Credit or Debit Card', 'PayPal'].map((method) => (
                        <label key={method} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${payment === method ? 'border-[#2563EB] bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="payment" value={method} checked={payment === method} onChange={() => setPayment(method)} className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{method}</span>
                            {method === 'Mobile Money Payment' && <span className="text-xs text-gray-500">Zaad / Sahal / EVC Plus</span>}
                          </div>
                          {method === 'PayPal' && <span className="ml-auto text-blue-800 font-bold italic">PayPal</span>}
                          {method === 'Mobile Money Payment' && <div className="ml-auto flex gap-1"><span className="text-xl">📱</span></div>}
                          {method === 'Credit or Debit Card' && <div className="ml-auto flex gap-1"><CreditCard size={20} className="text-gray-400"/></div>}
                        </label>
                      ))}
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button type="submit" className="bg-[#fae8b2] hover:bg-[#F3C235] border border-[#F3C235] text-gray-900 px-6 py-2.5 rounded-lg font-bold shadow-sm transition w-full sm:w-auto">Use this payment method</button>
                    </div>
                  </form>
               </div>
             )}
             
             {step > 2 && (
               <div className="px-6 pb-6 pt-0 ml-11 text-sm text-gray-600 font-medium">
                 {payment}
               </div>
             )}
          </div>

          {/* Mobile Money Instructions - Conditional */}
          {step === 3 && payment === 'Mobile Money Payment' && (
            <div className="bg-white border border-[#2563EB] rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="text-[#2563EB]" /> Mobile Money Instructions
              </h3>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-6 font-medium">
                <p className="text-sm font-bold text-blue-900 mb-4">Steps to pay:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 mb-6">
                  <li>Dial the USSD code below or tap the "Dial Payment" button.</li>
                  <li>Complete the payment on your mobile phone.</li>
                  <li>Take a screenshot of the confirmation message.</li>
                  <li>Return here to upload the screenshot and click "Place your order".</li>
                </ol>

                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200">
                     <span className="text-gray-500 text-xs uppercase font-bold">USSD Code</span>
                     <span className="text-lg font-black text-gray-900 font-mono tracking-tight">*880*{process.env.NEXT_PUBLIC_MERCHANT_NUMBER || '123456'}*{total.toFixed(2)}#</span>
                   </div>
                   <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200">
                     <span className="text-gray-500 text-xs uppercase font-bold">Amount to Send</span>
                     <span className="text-lg font-black text-[#b12704]">${total.toFixed(2)}</span>
                   </div>
                   <a 
                     href={`tel:*880*${process.env.NEXT_PUBLIC_MERCHANT_NUMBER || '123456'}*${total.toFixed(2)}%23`}
                     className="mt-4 block w-full bg-[#2563EB] hover:bg-blue-700 text-white text-center font-bold py-3 rounded-lg shadow transition"
                   >
                     Dial Payment Now
                   </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sender Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required 
                      value={senderPhoneNumber}
                      onChange={(e) => setSenderPhoneNumber(e.target.value)}
                      placeholder="e.g. +252631234567" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Transaction Ref <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input 
                      type="text" 
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="e.g. TXN123456" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" 
                    />
                  </div>
                </div>

                <label className="block mt-4">
                  <span className="text-sm font-bold text-gray-700 mb-2 block">Upload Payment Screenshot <span className="text-red-500">*</span></span>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition ${screenshot ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-[#2563EB]/50'}`}>
                    <div className="space-y-1 text-center">
                      {screenshotPreview ? (
                        <div className="relative group">
                          <img src={screenshotPreview} alt="Preview" className="h-32 w-auto mx-auto rounded-lg shadow-sm" />
                          <div className="mt-2 text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Ready to submit
                          </div>
                          <button 
                            type="button" 
                            onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Remove and re-upload
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#2563EB] hover:text-blue-500">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" onChange={handleScreenshotUpload} accept="image/*,application/pdf" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </label>
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#2563EB] h-full animate-progress origin-left"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all ${step === 3 ? 'shadow-md border-[#2563EB]' : 'bg-gray-50 opacity-60'}`}>
             <div className="p-6">
               <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 3 ? 'bg-[#2563EB] text-white' : 'bg-gray-300 text-gray-600'}`}>3</span>
                 Review items and shipping
               </h2>
             </div>

             {step === 3 && (
               <div className="p-6 pt-0 border-t border-gray-100 bg-white">
                 <div className="border border-gray-200 rounded-lg p-4 mt-4 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h3 className="text-green-700 font-bold flex items-center gap-2 mb-2"><CheckCircle2 size={18} /> Guaranteed delivery: Tomorrow</h3>
                    <p className="text-sm text-gray-600">Items shipped from Hudi Supermarket warehouse</p>
                    
                    <div className="mt-4 space-y-4">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                            <img src={item.images?.[0] || item.image || '/placeholder.svg'} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                            <p className="text-red-600 font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {error && (
                   <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                     {error}
                   </div>
                 )}

                 {payment === 'Credit or Debit Card' ? (
                   <div className="max-w-md">
                     <Elements stripe={stripePromise}>
                       <CheckoutForm 
                         amount={total} 
                         onSuccess={(id) => handlePlaceOrder(id)} 
                         onError={(msg) => setError(msg)} 
                       />
                     </Elements>
                   </div>
                 ) : (
                   <button 
                     onClick={() => handlePlaceOrder()} 
                     disabled={uploading || (payment === 'Mobile Money Payment' && !screenshot)}
                     className={`px-8 py-3 rounded-xl font-bold shadow-md transition w-full sm:w-auto text-lg mt-4 ${
                       uploading || (payment === 'Mobile Money Payment' && !screenshot)
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                       : 'bg-[#fae8b2] hover:bg-[#F3C235] border border-[#F3C235] text-gray-900'
                     }`}
                   >
                     {uploading ? 'Uploading Proof...' : payment === 'Mobile Money Payment' && !screenshot ? 'Awaiting Payment Proof' : 'Place your order'}
                   </button>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-80">
           <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <button 
                onClick={handlePlaceOrder}
                disabled={step !== 3 || uploading || (payment === 'Mobile Money Payment' && !screenshot)} 
                className={`w-full py-3 rounded-lg font-bold transition shadow-sm mb-4 ${
                  step === 3 && !uploading && !(payment === 'Mobile Money Payment' && !screenshot)
                  ? 'bg-[#fae8b2] hover:bg-[#F3C235] border border-[#F3C235] text-gray-900 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                {uploading ? 'Uploading...' : 'Place your order'}
              </button>
              <p className="text-xs text-gray-500 text-center mb-6 px-4">
                By placing your order, you agree to Hudi Supermarket's privacy notice and conditions of use.
              </p>

              <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Items ({cartItems.reduce((a,c) => a+c.qty, 0)}):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee (1%):</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total before tax:</span>
                  <span>${(subtotal - discountAmount + deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (4%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 text-[#b12704] font-bold text-xl border-b border-gray-200 mb-4">
                <span>Order total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2 border border-gray-200">
                <Truck size={18} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                   Eligible for <span className="font-bold">FREE Shipping</span>. Details below.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
