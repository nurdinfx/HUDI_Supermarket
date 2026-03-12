"use client";

import { useState, useEffect } from 'react';
import { Search, MapPin, Eye, CheckCircle2, X } from 'lucide-react';
import { getAdminOrders, updateAdminOrderStatus, assignRiderToOrder } from '@/utils/api';
import api from '@/utils/api';
import Link from 'next/link';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riders, setRiders] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const { data } = await api.get('/admin/riders');
      setRiders(data);
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAdminOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignRider = async (riderId) => {
    try {
      await assignRiderToOrder(selectedOrder._id, riderId);
      setShowRiderModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error assigning rider:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders, track payments, and assign deliveries.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm transition hover:bg-gray-50 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg outline-none focus:border-[#2563EB] cursor-pointer w-full sm:w-auto text-sm">
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Out for delivery</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Order ID</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Customer</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Date</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Payment</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Total</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">{order._id.substring(0, 8)}...</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{order.user?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.orderItems?.length} Items</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                      order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">${order.totalPrice.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <select 
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer ${
                        order.status === 'Processing' ? 'bg-blue-50 text-[#2563EB] border-blue-200' :
                        order.status === 'Shipped' ? 'bg-orange-50 text-[#F97316] border-orange-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}
                      value={order.status}
                    >
                      <option className="text-gray-900 bg-white" value="Processing">Processing</option>
                      <option className="text-gray-900 bg-white" value="Shipped">Shipped</option>
                      <option className="text-gray-900 bg-white" value="Delivered">Delivered</option>
                      <option className="text-gray-900 bg-white" value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'Processing' && (
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowRiderModal(true); }}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition"
                        >
                          <MapPin size={14} /> {order.rider ? 'Change Rider' : 'Assign Rider'}
                        </button>
                      )}
                      <Link href={`/orders/${order._id}`} className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="View Details">
                        <Eye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="border-t border-gray-100 p-4 flex items-center justify-between text-sm text-gray-500">
           <div>Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">4</span> of <span className="font-medium text-gray-900">1,245</span> orders</div>
        </div>
      </div>
      {/* Rider Selection Modal */}
      {showRiderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Assign Rider</h2>
              <button onClick={() => setShowRiderModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-2 font-medium italic">Select a rider for order #{selectedOrder?._id.substring(0,8)}...</p>
              {riders.length > 0 ? riders.map(rider => (
                <div key={rider._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-gray-900">{rider.name}</p>
                    <p className="text-xs text-gray-500">{rider.phone || 'No phone'}</p>
                  </div>
                  <button 
                    onClick={() => handleAssignRider(rider._id)}
                    className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    Select
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                   No riders available.
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button onClick={() => setShowRiderModal(false)} className="text-sm font-bold text-gray-600 hover:text-gray-900">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
