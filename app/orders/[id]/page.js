"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, Clock, MapPin, CreditCard } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Protect the route
  if (!user && typeof window !== 'undefined') {
    router.push(`/login?redirect=/orders/${id}`);
    return null;
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-600">Order not found.</div>;

  const steps = [
    { title: 'Ordered', icon: <Package size={18} />, status: 'Completed', date: new Date(order.createdAt).toLocaleString() },
    { title: 'Paid', icon: <CreditCard size={18} />, status: order.isPaid ? 'Completed' : 'Pending', date: order.paidAt ? new Date(order.paidAt).toLocaleString() : '' },
    { title: 'Processing', icon: <Clock size={18} />, status: ['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'Completed' : 'Pending' },
    { title: 'Out for Delivery', icon: <Truck size={18} />, status: ['Shipped', 'Delivered'].includes(order.status) ? 'Completed' : 'Pending' },
    { title: 'Delivered', icon: <CheckCircle2 size={18} />, status: order.status === 'Delivered' ? 'Completed' : 'Pending', date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">Order # {order._id}</p>
        </div>
        <Link href="/orders" className="text-[#2563EB] hover:underline font-medium">Back to Orders</Link>
      </div>

      {/* Tracking Stepper */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${step.status === 'Completed' ? 'bg-[#2563EB] border-blue-100 text-white' : 'bg-white border-gray-100 text-gray-400'}`}>
                {step.icon}
              </div>
              <p className={`mt-3 text-sm font-bold ${step.status === 'Completed' ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
              <p className="text-[10px] text-gray-500 mt-1">{step.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Items Ordered</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item, i) => (
                <div key={i} className="p-6 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 flex-shrink-0 flex items-center justify-center p-2 rounded">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.product}`} className="text-[#2563EB] hover:underline hover:text-orange-600 font-medium line-clamp-2">
                      {item.name}
                    </Link>
                    {item.size && item.size !== 'N/A' && item.color && item.color !== 'N/A' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: <span className="font-semibold">{item.size}</span> | Color: <span className="font-semibold capitalize">{item.color}</span>
                        </p>
                    )}
                    <div className="flex justify-between items-end mt-2">
                       <p className="text-sm font-bold text-gray-900">${item.price.toFixed(2)} x {item.qty}</p>
                       <p className="text-sm font-bold text-[#b12704]">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-[#F97316]" /> Shipping Info</h3>
              <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName || 'Customer'}</p>
              <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.street}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#F97316]" /> Payment Info</h3>
              <p className="text-sm text-gray-600">Method: <span className="font-bold text-gray-900">{order.paymentMethod}</span></p>
              <p className={`text-sm mt-1 font-bold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                {order.isPaid ? `Paid at ${new Date(order.paidAt).toLocaleString()}` : 'Not Paid'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
             <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
               <div className="flex justify-between">
                 <span className="text-gray-600">Items:</span>
                 <span className="font-bold">${order.itemsPrice.toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Shipping:</span>
                 <span className="font-bold">${order.shippingPrice.toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Tax:</span>
                 <span className="font-bold">${order.taxPrice.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex justify-between items-center text-[#b12704] font-bold text-xl">
               <span>Total:</span>
               <span>${order.totalPrice.toFixed(2)}</span>
             </div>
           </div>

           {order.rider && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 relative">
                  <div className="absolute -left-1 w-1 h-full bg-[#2563EB] rounded-full"></div>
                  Your Rider
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xl">
                    {order.rider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{order.rider.name}</p>
                    <p className="text-sm text-gray-500">{order.rider.phone || 'Ready for delivery'}</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gray-100 text-gray-900 py-2 rounded-xl font-bold hover:bg-gray-200 transition text-sm">
                  Contact Rider
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
