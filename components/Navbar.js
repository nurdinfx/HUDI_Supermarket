"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || searchCategory) {
      let url = '/shop?';
      if (searchQuery.trim()) url += `keyword=${encodeURIComponent(searchQuery)}&`;
      if (searchCategory && searchCategory !== 'All Departments') url += `category=${encodeURIComponent(searchCategory)}`;
      router.push(url);
    } else {
      router.push('/shop');
    }
  };
  
  const categories = [
    'Fresh Food', 'Meat & Seafood', 'Dairy & Eggs', 'Frozen Food', 
    'Pantry', 'Snacks & Sweets', 'Beverages', 'Bakery', 
    'Health & Personal Care', 'Beauty', 'Household Essentials', 
    'Baby & Child', 'Pet Supplies', 'Kitchen & Dining', 
    'Home & Garden', 'Electronics', 'Clothing', 'Sports & Outdoors'
  ];

  return (
    <header className="w-full font-sans text-white select-none">
      {/* Top Bar - Main Navigation */}
      <div className="bg-[#131921] h-[60px] md:h-[65px] flex items-center px-4 gap-1">
        
        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:border border-white rounded-sm"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center h-[50px] px-2 border border-transparent hover:border-white rounded-sm transition-all group shrink-0">
          <div className="flex flex-col leading-none">
            <span className="text-[18px] md:text-[22px] font-black tracking-tight">Hudi</span>
            <span className="hidden sm:inline text-[22px] font-black tracking-tight">-Supermarket</span>
            <span className="text-[10px] md:text-[12px] text-[#febd69] font-bold self-end -mt-1">.so</span>
          </div>
        </Link>

        {/* Deliver To - Hidden on mobile */}
        <div className="hidden lg:flex items-center h-[50px] px-2 ml-1 border border-transparent hover:border-white rounded-sm cursor-pointer transition-all shrink-0">
          <MapPin size={18} className="mt-2 mr-0.5" />
          <div className="flex flex-col leading-none">
            <span className="text-[12px] text-[#ccc] font-normal">Delivering to Mogadishu</span>
            <span className="text-[14px] font-bold">Update location</span>
          </div>
        </div>

        {/* Search Bar - Hidden on very small screens or compressed */}
        <div className="hidden sm:flex flex-1 items-center h-[40px] ml-2 group min-w-[100px]">
          <form onSubmit={handleSearch} className="flex w-full h-full rounded-[4px] overflow-hidden focus-within:ring-[3px] focus-within:ring-[#f3a847] transition-shadow">
            {/* Category Dropdown - Hidden on tablets */}
            <div className="hidden md:flex h-full relative items-center bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#555] border-r border-[#bbb] cursor-pointer">
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
              >
                <option value="">All Departments</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex items-center px-4 whitespace-nowrap text-[12px]">
                <span>{searchCategory && searchCategory !== 'All Departments' ? searchCategory.slice(0, 10) + (searchCategory.length > 10 ? '..' : '') : 'All'}</span>
                <ChevronDown size={14} className="ml-1 mt-0.5" />
              </div>
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hudi"
              className="flex-1 px-4 text-[15px] text-gray-900 border-none focus:ring-0 outline-none h-full w-full"
            />
            
            {/* Search Button */}
            <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] w-[45px] h-full flex items-center justify-center transition-colors shrink-0">
              <Search size={22} className="text-[#333]" strokeWidth={2.5} />
            </button>
          </form>
        </div>

        {/* Right Nav Sections */}
        <div className="flex items-center h-full ml-auto">
          
          {/* Account & Lists - Icon only on mobile */}
          <div className="group relative flex flex-col justify-center h-[50px] px-2 border border-transparent hover:border-white rounded-sm cursor-pointer transition-all leading-none ml-1">
            <span className="hidden md:inline text-[12px] font-normal">Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
            <div className="flex items-center mt-0.5">
              <span className="hidden md:inline text-[14px] font-bold">Account</span>
              <User className="md:hidden" size={24} />
              <ChevronDown size={12} className="text-[#ccc] ml-0.5 mt-0.5 hidden md:inline" />
            </div>
            
            {/* Dropdown overlay */}
            <div className="absolute top-full right-0 mt-0 w-[240px] bg-white text-gray-900 shadow-xl border border-gray-200 py-4 hidden group-hover:block z-[100] rounded-sm">
                {!user && (
                    <div className="px-4 pb-4 border-b border-gray-100 text-center">
                        <Link href="/login" className="block w-full bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] py-1.5 rounded-sm text-[13px] font-medium hover:from-[#f5d78e] hover:to-[#ebb331] shadow-sm">Sign in</Link>
                        <p className="text-[11px] mt-2">New customer? <Link href="/register" className="text-blue-600 hover:text-[#e47911] hover:underline">Start here.</Link></p>
                    </div>
                )}
                <div className="px-4 pt-4 space-y-3">
                    <h4 className="font-bold text-[14px]">Your Account</h4>
                    <Link href="/profile" className="block text-[13px] hover:text-[#e47911] hover:underline">Manage Profile</Link>
                    <Link href="/orders" className="block text-[13px] hover:text-[#e47911] hover:underline">Your Orders</Link>
                    {user && <button onClick={logout} className="block text-[13px] text-red-600 hover:underline pt-2 border-t border-gray-100 w-full text-left">Sign Out</button>}
                </div>
            </div>
          </div>

          {/* Cart */}
          <Link href="/cart" className="flex items-end h-[50px] px-2 border border-transparent hover:border-white rounded-sm cursor-pointer transition-all ml-1 relative group">
            <div className="relative">
              <ShoppingCart className="text-white w-8 h-8 md:w-[38px] md:h-[38px]" strokeWidth={1.5} />
              <span className="absolute top-0 left-[14px] md:left-[18px] text-[14px] md:text-[16px] font-bold text-[#f08804]">
                {totalItems}
              </span>
            </div>
            <span className="hidden sm:inline text-[14px] font-bold mb-1 ml-0.5">Cart</span>
          </Link>

        </div>
      </div>

      {/* Mobile Search Bar - Only visible on smallest screens */}
      <div className="sm:hidden bg-[#131921] px-4 pb-3">
        <form onSubmit={handleSearch} className="flex w-full h-[40px] rounded-[4px] overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hudi"
              className="flex-1 px-4 text-[15px] text-gray-900 border-none focus:ring-0 outline-none h-full"
            />
            <button type="submit" className="bg-[#febd69] w-[45px] h-full flex items-center justify-center">
              <Search size={22} className="text-[#333]" />
            </button>
        </form>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] lg:hidden" onClick={() => setIsMenuOpen(false)}>
           <div className="w-[80%] max-w-[300px] h-full bg-white text-gray-900 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
              <div className="bg-[#232f3e] text-white p-4 flex items-center gap-3">
                 <User size={24} />
                 <span className="font-bold">Hello, {user ? user.name : 'Sign In'}</span>
              </div>
              <div className="p-4 space-y-6">
                 <div>
                    <h3 className="text-lg font-bold mb-3">Shop By Category</h3>
                    <div className="flex flex-col gap-3">
                       {categories.slice(0, 8).map(cat => (
                          <Link key={cat} href={`/shop?category=${cat}`} onClick={() => setIsMenuOpen(false)} className="text-sm hover:text-orange-500">{cat}</Link>
                       ))}
                       <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-blue-600">See All Categories</Link>
                    </div>
                 </div>
                 <hr />
                 <div>
                    <h3 className="text-lg font-bold mb-3">Help & Settings</h3>
                    <div className="flex flex-col gap-3">
                       <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm">Your Account</Link>
                       <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="text-sm">Your Orders</Link>
                       <Link href="/customer-service" onClick={() => setIsMenuOpen(false)} className="text-sm">Customer Service</Link>
                       {user && <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-sm text-red-600 text-left">Sign Out</button>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Bottom Bar - Sub Navigation */}
      <div className="bg-[#232f3e] h-[39px] flex items-center px-4 overflow-x-auto no-scrollbar">
        <button className="flex items-center h-[34px] px-2 border border-transparent hover:border-white rounded-sm transition-all font-bold text-[14px] mr-1">
          <Menu size={20} className="mr-1" />
          All
        </button>
        
        <div className="flex items-center h-full gap-0.5 text-[14px]">
          {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((link) => (
            <Link 
              key={link} 
              href="/shop" 
              className="px-2 h-[34px] flex items-center border border-transparent hover:border-white rounded-sm transition-all whitespace-nowrap"
            >
              {link}
            </Link>
          ))}
          
          {/* Highlights */}
          <Link href="/" className="px-2 h-[34px] flex items-center border border-transparent hover:border-white rounded-sm transition-all whitespace-nowrap font-bold text-[#febd69]">
            Join Prime
          </Link>
          
          <div className="hidden lg:flex items-center ml-auto px-2 h-[34px] border border-transparent hover:border-white rounded-sm transition-all whitespace-nowrap font-bold">
            Shop great deals on essentials
          </div>
        </div>
      </div>
    </header>
  );
}
