"use client";

import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Truck, User as UserIcon, Phone, PieChart, Activity } from 'lucide-react';
import api, { getAdminDeliveries } from '@/utils/api';

export default function DeliveriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
    fetchRiders();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data } = await getAdminDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries & Riders</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor active deliveries and manage your rider fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Map and Active Deliveries */}
        <div className="xl:col-span-2 space-y-6">
          {/* Map Stub */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative h-[400px]">
             <div className="absolute inset-0 bg-blue-50/50" style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <MapPin size={48} className="text-gray-300 mb-2" />
                <h3 className="text-sm font-bold text-gray-500">Live Map View (Placeholder)</h3>
                <p className="text-xs text-gray-400 mt-1">Google Maps integration goes here.</p>
             </div>
          </div>

          {/* Active Deliveries List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Active Deliveries ({deliveries.length})</h2>
             <div className="space-y-3">
              {deliveries.length > 0 ? deliveries.map(delivery => (
                <div key={delivery._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#2563EB] font-bold border border-gray-100">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">#{delivery.order?._id.substring(0,8)}</p>
                      <p className="text-xs text-gray-500">{delivery.rider?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase ${
                      delivery.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'
                    }`}>{delivery.status}</p>
                    <p className="text-xs font-bold text-gray-900">ETA: --</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No active deliveries at the moment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Riders Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit xl:sticky top-24">
           <div className="p-6 border-b border-gray-100">
             <h2 className="text-lg font-bold text-gray-900">Rider Fleet</h2>
             <p className="text-sm text-gray-500 mt-1">Status and current assignments.</p>
           </div>
           
           <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search riders..." 
                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>

           <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
             {riders.length > 0 ? riders.map(rider => (
               <div key={rider._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition group">
                 <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                       {rider.name.charAt(0)}
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 text-sm">{rider.name}</p>
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Available</span>
                     </div>
                   </div>
                   <button className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition">
                     <Phone size={16} />
                   </button>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Current Order</span>
                     <span className="text-gray-900 font-medium">None</span>
                   </div>
                 </div>
               </div>
             )) : (
               <p className="text-sm text-gray-500 text-center py-4">No riders available.</p>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
