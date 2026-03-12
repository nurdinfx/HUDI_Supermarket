"use client";

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Eye, EyeOff, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { getAdminOrders, verifyAdminPayment } from '@/utils/api';

export default function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminOrders();
      // Only show orders that are pending verification or have a proof image
      setOrders(data.filter(order => order.paymentMethod === 'Mobile Money Payment' || order.paymentStatus === 'Pending Verification'));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    if (status === 'Rejected' && !rejectionNote) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyAdminPayment(id, status, rejectionNote);
      setSelectedOrder(null);
      setRejectionNote('');
      fetchOrders();
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.includes(searchQuery) || 
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve manual mobile money payments.</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
           <AlertCircle size={18} />
           {orders.filter(o => o.paymentStatus === 'Pending Verification').length} Pending Requests
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Order Info</th>
              <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Customer</th>
              <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Amount</th>
              <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
              <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400">Loading payments...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400">No payment requests found.</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-900 text-sm">#{order._id.substring(order._id.length - 8)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900 text-sm">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.user?.email}</p>
                </td>
                <td className="py-4 px-6 font-black text-gray-900 text-sm">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                    order.paymentStatus === 'Pending Verification' ? 'bg-orange-100 text-orange-700' :
                    order.paymentStatus === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                   <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ml-auto"
                   >
                     <Eye size={14} /> Review Proof
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
               <div>
                 <h2 className="text-xl font-bold text-gray-900">Review Payment Proof</h2>
                 <p className="text-sm text-gray-500">Order #{selectedOrder._id}</p>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                 <XCircle size={24} className="text-gray-400" />
               </button>
             </div>
             
             <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
               {/* Proof Column */}
               <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center min-h-[400px]">
                 {selectedOrder.paymentProofImage ? (
                   <div className="space-y-4 w-full">
                     <img 
                      src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api').replace('/api', '')}${selectedOrder.paymentProofImage}`} 
                      alt="Payment Proof" 
                      className="max-h-[500px] w-auto mx-auto border-4 border-white shadow-lg rounded-xl"
                     />
                     <a 
                      href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api').replace('/api', '')}${selectedOrder.paymentProofImage}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 text-sm text-[#2563EB] font-bold hover:underline"
                     >
                        <ExternalLink size={16} /> Open full image
                     </a>
                   </div>
                 ) : (
                   <div className="text-center py-20">
                     <EyeOff size={48} className="text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500">No screenshot uploaded</p>
                   </div>
                 )}
               </div>
               
               {/* Verification Column */}
               <div className="w-full lg:w-96 p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-6">Verification Actions</h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount Due:</span>
                        <span className="font-bold">${selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Status:</span>
                        <span className="font-bold text-orange-600">{selectedOrder.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Internal Note / Rejection Reason</label>
                      <textarea 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition h-32"
                        placeholder="e.g. Transaction ID not found or partial payment..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                      />
                      <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                        <Info className="text-[#2563EB] shrink-0" size={18} />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Confirming will notify the customer and move the order to "Preparing".
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button 
                      onClick={() => handleVerify(selectedOrder._id, 'Rejected')}
                      disabled={isVerifying}
                      className="px-4 py-3 border-2 border-red-500 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleVerify(selectedOrder._id, 'Confirmed')}
                      disabled={isVerifying}
                      className="px-4 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition disabled:opacity-50"
                    >
                      {isVerifying ? 'Confirming...' : 'Confirm'}
                    </button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
