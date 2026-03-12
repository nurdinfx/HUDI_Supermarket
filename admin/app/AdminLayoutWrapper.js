"use client";

import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { usePathname } from 'next/navigation';

export default function AdminLayoutWrapper({ children }) {
  const { adminUser, logout } = useAdminAuth();
  const pathname = usePathname();

  // If we're on the login page, just show children (the login form)
  // without the sidebar/header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!adminUser) {
    return null; // Return null to prevent rendering protected children while redirecting
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm sticky top-0 h-screen hidden lg:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 mb-4">
          <span className="text-xl font-bold text-[#2563EB] tracking-tighter">Hudi Super</span>
          <span className="ml-2 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2">
          {[
            { href: '/', label: 'Dashboard', icon: '📊' },
            { href: '/orders', label: 'Orders', icon: '📦' },
            { href: '/payments', label: 'Payments', icon: '💳' },
            { href: '/products', label: 'Products', icon: '🏷️' },
            { href: '/categories', label: 'Categories', icon: '📁' },
            { href: '/customers', label: 'Customers', icon: '👥' },
            { href: '/deliveries', label: 'Deliveries', icon: '🚚' },
            { href: '/coupons', label: 'Coupons', icon: '🎫' },
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                pathname === item.href 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`text-xl ${pathname === item.href ? '' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span> 
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-100">
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-blue-600 hover:bg-blue-50 font-bold transition-all"
            >
              <span className="text-xl">🛒</span> 
              <span className="text-sm">Storefront</span>
            </a>
          </div>
        </nav>
        
        <div className="p-4 mt-auto">
           <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-100">
                 {adminUser?.name?.charAt(0) || 'A'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.name || 'Admin'}</p>
                 <p className="text-[10px] text-gray-500 font-medium truncate">{adminUser?.email || 'admin@hudi.com'}</p>
               </div>
             </div>
             <button 
               onClick={logout}
               className="w-full py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2"
             >
               <span>🚪</span> Log Out
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 text-xl">☰</button>
            <h1 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              {pathname === '/' ? 'Overview' : pathname.split('/')[1]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-500">SYSTEM ONLINE</span>
            </div>
            <button className="relative w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all border border-gray-100">
              <span>🔔</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#F97316] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
