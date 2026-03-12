"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Tag, Trash2, Edit } from 'lucide-react';
import { getAdminCoupons, createAdminCoupon, deleteAdminCoupon } from '@/utils/api';

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', discount: 0, expiryDate: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await getAdminCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await createAdminCoupon(formData);
      setFormData({ code: '', discount: 0, expiryDate: '' });
      fetchCoupons();
    } catch (error) {
      console.error('Error adding coupon:', error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteAdminCoupon(id);
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount codes for marketing campaigns.</p>
        </div>
        <button className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition">
          <Plus size={20} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Coupons List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search codes..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg outline-none focus:border-[#2563EB] cursor-pointer w-full sm:w-auto text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Expired</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Coupon Code</th>
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Discount</th>
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Usage</th>
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Expires</th>
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
                    <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map(coupon => (
                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0">
                            <Tag size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{coupon._id}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{coupon.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-gray-900">{coupon.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Min: {coupon.minPurchase}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 mt-1">
                          <div 
                            className="bg-[#2563EB] h-1.5 rounded-full" 
                            style={{ width: `${coupon.limit === Infinity ? 100 : Math.min(100, (coupon.usage / coupon.limit) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{coupon.usage} / {coupon.limit === Infinity ? '∞' : coupon.limit}</p>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm font-medium">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-gray-100 p-4 flex items-center justify-between text-sm text-gray-500">
               <div>Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">4</span> of <span className="font-medium text-gray-900">4</span> coupons</div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Add Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
           <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Create Quick Coupon</h2>
           <form onSubmit={handleAddCoupon} className="space-y-4">
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Coupon Code</label>
               <input 
                type="text" 
                placeholder="e.g. SUMMER25" 
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-1 hover:border-gray-300 transition uppercase" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
                 <select className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-1 hover:border-gray-300 transition" defaultValue="Percentage (%)">
                   <option>Percentage (%)</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
                 <input 
                  type="number" 
                  placeholder="e.g. 20" 
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-1 hover:border-gray-300 transition" 
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                  required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
               <input 
                type="date" 
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-1 hover:border-gray-300 transition" 
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                required
               />
             </div>
             
             <button type="submit" className="bg-[#2563EB] text-white w-full py-2.5 rounded-xl font-bold hover:bg-blue-700 transition mt-6">
               Save Coupon
             </button>
           </form>
        </div>

      </div>
    </div>
  );
}
