"use client";

import { useState, useEffect } from 'react';
import { Search, Mail, Ban, MoreVertical, ExternalLink } from 'lucide-react';
import { getAdminCustomers, deleteAdminCustomer } from '@/utils/api';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await getAdminCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to remove this customer?')) {
      try {
        await deleteAdminCustomer(id);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your user base, view purchase history, and handle accounts.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm transition hover:bg-gray-50 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search customers by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg outline-none focus:border-[#2563EB] cursor-pointer w-full sm:w-auto text-sm">
            <option>All Statuses</option>
            <option>Active</option>
            <option>VIP</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg outline-none focus:border-[#2563EB] cursor-pointer w-full sm:w-auto text-sm">
            <option>Sort by: Newest</option>
            <option>Sort by: Most Spent</option>
            <option>Sort by: Most Orders</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Customer Info</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Contact</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Joined Date</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Total Orders</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Total Spent</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(customer => (
                <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                        {customer.name.charAt(0)}{customer.name.split(' ')[1]?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {customer._id.substring(0,8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{customer.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm font-medium">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-gray-900 text-sm font-bold">{customer.orders ?? 0}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">${(customer.spent ?? 0).toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      customer.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                      customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="View Profile">
                        <ExternalLink size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="Send Email">
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Account">
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="border-t border-gray-100 p-4 flex items-center justify-between text-sm text-gray-500">
           <div>Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">4</span> of <span className="font-medium text-gray-900">8,390</span> customers</div>
        </div>
      </div>
    </div>
  );
}
