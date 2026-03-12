"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/mine');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Protect the route
  if (!user && typeof window !== 'undefined') {
    router.push('/login?redirect=/orders');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header and Breadcrumbs */}
      <div className="mb-6">
        <Link href="/profile" className="text-sm text-gray-600 hover:text-[#2563EB] hover:underline mb-2 inline-block">Your Account</Link> › <span className="text-sm text-[#F97316]">Your Orders</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Your Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button className={`pb-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'orders' ? 'border-[#F97316] text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('orders')}>Orders</button>
        <button className={`pb-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'buy-again' ? 'border-[#F97316] text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('buy-again')}>Buy Again</button>
        <button className={`pb-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'not-yet-shipped' ? 'border-[#F97316] text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('not-yet-shipped')}>Not Yet Shipped</button>
        <button className={`pb-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'cancelled' ? 'border-[#F97316] text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('cancelled')}>Cancelled Orders</button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
         <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
           <span className="font-bold">{orders.length}</span> orders placed in
         </span>
         <select className="bg-gray-100 border border-gray-300 text-gray-900 py-1 px-3 rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm font-medium">
            <option>past 3 months</option>
            <option>2025</option>
            <option>2024</option>
         </select>
      </div>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-100 border-b border-gray-200 p-4 flex flex-wrap gap-4 sm:gap-8 justify-between items-center text-sm text-gray-600">
               <div className="flex gap-4 sm:gap-8 w-full sm:w-auto">
                 <div>
                   <p className="font-medium uppercase text-xs mb-1">Order Placed</p>
                   <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="font-medium uppercase text-xs mb-1">Total</p>
                   <p className="text-gray-900">${order.totalPrice.toFixed(2)}</p>
                 </div>
                 <div>
                   <p className="font-medium uppercase text-xs mb-1">Ship To</p>
                   <a className="text-[#2563EB] hover:underline cursor-pointer">{order.shippingAddress?.street}</a>
                 </div>
               </div>
               <div className="w-full sm:w-auto text-left sm:text-right">
                 <p className="font-medium uppercase text-xs mb-1">Order # {order._id}</p>
                 <div className="flex items-center gap-2 sm:justify-end">
                   <Link href={`/orders/${order._id}`} className="text-[#2563EB] hover:underline">View order details</Link>
                 </div>
               </div>
            </div>

            {/* Order Content */}
            <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
               <div className="flex-1 space-y-4">
                 <h2 className="text-lg font-bold text-gray-900">
                   Status: {order.status} {order.isDelivered ? `at ${new Date(order.deliveredAt).toLocaleDateString()}` : ''}
                 </h2>
                 {order.orderItems.map((item, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-20 h-20 bg-gray-50 flex-shrink-0 flex items-center justify-center p-2 rounded">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                     <div>
                       <Link href={`/product/${item.product}`} className="text-[#2563EB] hover:underline hover:text-orange-600 font-medium line-clamp-2">
                         {item.name}
                       </Link>
                       <p className="text-red-600 font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                       <p className="text-xs text-gray-500 mt-1">Quantity: {item.qty}</p>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Actions column */}
               <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 leading-none">
                 <Link href={`/orders/${order._id}`} className="bg-white border border-gray-300 shadow-sm text-center text-sm font-medium text-gray-800 py-2.5 rounded-lg hover:bg-gray-50 transition w-full">
                   Track package
                 </Link>
                 <button className="bg-white border text-center text-sm font-medium py-2.5 rounded-lg transition w-full border-gray-300 text-gray-800 shadow-sm hover:bg-gray-50">
                   Return or replace items
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
