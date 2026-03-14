"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, Globe, Smartphone, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?keyword=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/shop');
    }
  };
  
  const navCategories = [
    'Categories', 'New In', '3-Day Delivery', 'Sale', 'Women Clothing', 
    'Beachwear', 'Curve', 'Kids', 'Men Clothing', 'Home & Living', 
    'Underwear & Sleepwear', 'Shoes', 'Jewelry & Accessories', 'Beauty & Health',
    'Home Textiles', 'Cell Phones & Accessories', 'Electronics', 'Sports & Outdoors'
  ];

  return (
    <header className="w-full font-sans select-none sticky top-0 z-[100] bg-white shadow-sm transition-all duration-300">
      {/* Top Info Bar (SHEIN Style) */}
      <div className="bg-[#FAF9F6] border-b border-gray-100 py-2 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-center items-center gap-12 text-[12px] font-medium text-[#666]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8B0000]">Shipping Info</span>
            <span>Free Shipping Conditions</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8B0000]">Free Return</span>
            <span>Within 30 Days</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8B0000]">HUDI CLUB</span>
            <span>15x FREE Shipping Vouchers</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="bg-black text-white h-[60px] md:h-[70px] flex items-center px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-4 md:gap-8">
          
          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Logo - Updated to Hudi_Supermarket */}
          <Link href="/" className="flex items-center shrink-0">
             <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase font-serif">
                Hudi<span className="text-gray-400">_</span>Supermarket
             </h1>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-[600px] hidden sm:block">
            <form onSubmit={handleSearch} className="flex w-full h-[38px] bg-white rounded-sm overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-4 text-[14px] text-gray-900 outline-none placeholder-gray-400"
              />
              <button type="submit" className="bg-black text-white w-[50px] flex items-center justify-center hover:bg-gray-900 transition-colors border-l border-gray-200">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            {/* User Account */}
            <div className="group relative flex items-center cursor-pointer py-2">
              <User size={24} strokeWidth={1.5} className="hover:text-gray-300 transition-colors" />
              
              <div className="absolute top-full right-[-20px] mt-0 w-[240px] bg-white text-gray-900 shadow-2xl border border-gray-100 py-4 hidden group-hover:block z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col">
                    {!user ? (
                        <div className="px-5 pb-4 border-b border-gray-100">
                            <Link href="/login" className="block w-full bg-black text-white py-2.5 text-center text-[13px] font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider mb-2">Sign In / Register</Link>
                        </div>
                    ) : (
                        <div className="px-5 pb-3 border-b border-gray-100 mb-2">
                           <p className="text-sm font-bold truncate">Hello, {user.name}</p>
                        </div>
                    )}
                    <div className="px-5 space-y-2.5 mt-2">
                        <Link href="/profile" className="block text-[13px] text-gray-600 hover:text-black hover:underline transition-colors uppercase tracking-tight">Your Account</Link>
                        <Link href="/orders" className="block text-[13px] text-gray-600 hover:text-black hover:underline transition-colors uppercase tracking-tight">Orders History</Link>
                        <Link href="/wishlist" className="block text-[13px] text-gray-600 hover:text-black hover:underline transition-colors uppercase tracking-tight">My Collections</Link>
                        {user && <button onClick={logout} className="block text-[13px] text-red-600 hover:underline pt-2 border-t border-gray-100 w-full text-left uppercase tracking-tight mt-2">Sign Out</button>}
                    </div>
                  </div>
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative group">
              <Heart size={24} strokeWidth={1.5} className="hover:text-gray-300 transition-colors" />
            </Link>

            {/* Cart with Counter */}
            <Link href="/cart" className="relative group">
              <ShoppingCart size={24} strokeWidth={1.5} className="hover:text-gray-300 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black group-hover:bg-gray-100 transition-colors">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* App Icon (SHEIN Style) */}
            <button className="hidden lg:block hover:text-gray-300 transition-colors">
              <Smartphone size={22} strokeWidth={1.5} />
            </button>

            {/* Language/Globe Icon */}
            <button className="hidden lg:block hover:text-gray-300 transition-colors">
              <Globe size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Layer (Categories) - Horizontal Scrollable */}
      <div className="bg-white border-b border-gray-100 py-3 overflow-hidden shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap md:justify-start">
             {navCategories.map((cat, i) => (
                <Link 
                  key={cat} 
                  href={`/shop?category=${cat === 'Categories' ? '' : cat}`} 
                  className={`text-[12px] md:text-[13px] font-bold transition-all hover:text-black ${i === 4 ? 'bg-gray-900 text-white px-3 py-1.5 rounded-sm' : 'text-gray-700'}`}
                >
                  {cat}
                  {cat === 'Categories' && <ChevronDown size={14} className="inline ml-1 mb-0.5" />}
                </Link>
             ))}
          </div>
        </div>
      </div>

      {/* Mobile Search - Bottom of Main Header on small screens */}
      <div className="sm:hidden bg-black px-4 pb-3">
        <form onSubmit={handleSearch} className="flex w-full h-[36px] bg-white rounded-sm overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 text-[14px] text-gray-900 outline-none"
            />
            <button type="submit" className="bg-black text-white w-[40px] flex items-center justify-center border-l border-gray-100">
              <Search size={18} />
            </button>
        </form>
      </div>

      {/* Mobile Sidebar Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-[200]" onClick={() => setIsMenuOpen(false)}>
           <div className="w-[280px] h-full bg-white text-gray-900 animate-in slide-in-from-left duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="bg-black text-white p-6 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black tracking-tighter">Hudi_Supermarket</h2>
                    <Menu size={20} className="md:hidden" onClick={() => setIsMenuOpen(false)} />
                 </div>
                 <div className="flex items-center gap-3 pt-2">
                    <User size={20} />
                    <span className="font-bold text-sm">Hello, {user ? user.name : 'Sign In'}</span>
                 </div>
              </div>
              <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-140px)]">
                 <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Top Categories</h3>
                    <div className="flex flex-col gap-4 font-bold text-sm">
                       {navCategories.slice(1, 10).map(cat => (
                          <Link key={cat} href={`/shop?category=${cat}`} onClick={() => setIsMenuOpen(false)} className="hover:text-black transition-colors">{cat}</Link>
                       ))}
                    </div>
                 </div>
                 <hr className="border-gray-100" />
                 <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account & Help</h3>
                    <div className="flex flex-col gap-4 font-bold text-sm">
                       <Link href="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                       <Link href="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                       <Link href="/wishlist" onClick={() => setIsMenuOpen(false)}>My Wishlist</Link>
                       {user && <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-500 text-left">Sign Out</button>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </header>
  );
}
