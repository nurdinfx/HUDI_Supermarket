"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, MapPin, Package, Heart, LogOut, Camera, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
    { id: 'orders', label: 'Order History', icon: <Package size={18} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mb-4">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your profile.</p>
        <Link href="/login" className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-blue-900 to-blue-700 text-white text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-blue-100 text-[#2563EB] flex items-center justify-center text-3xl font-bold mx-auto backdrop-blur-sm">
                {user.name?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white text-blue-900 rounded-full shadow-lg hover:bg-gray-100 transition">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="font-bold text-xl">{user.name}</h2>
            <p className="text-blue-200 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">{user.role}</p>
          </div>
          <div className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-[#2563EB]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <Save size={16} /> Edit Profile
                </button>
              )}
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#2563EB] disabled:bg-gray-50 disabled:text-gray-500 transition shadow-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#2563EB] disabled:bg-gray-50 disabled:text-gray-500 transition shadow-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="+1 234 567 890"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#2563EB] disabled:bg-gray-50 disabled:text-gray-500 transition shadow-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    type="submit"
                    className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-md"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
              <button className="bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 px-5 py-2 rounded-full font-bold text-sm transition flex items-center gap-2">
                <Plus size={18} /> Add New Address
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses?.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-blue-200 transition">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
                         <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{addr.street}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.postalCode}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                       <button className="text-xs font-bold text-[#2563EB] hover:underline uppercase">Set as Default</button>
                       <button className="text-xs font-bold text-red-600 hover:underline uppercase">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                   <p className="text-gray-500 font-medium">No saved addresses yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'orders' || activeTab === 'wishlist') && (
          <div className="bg-white p-20 rounded-2xl shadow-sm border border-gray-100 text-center">
             <Link 
              href={activeTab === 'orders' ? "/orders" : "/shop"} 
              className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition inline-block shadow-sm"
             >
               View {activeTab === 'orders' ? "Order History" : "Shop now"}
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
