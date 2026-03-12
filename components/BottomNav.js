"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((a, c) => a + c.qty, 0);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Cart', href: '/cart', icon: ShoppingCart, count: cartCount },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all relative ${
              isActive ? 'text-[#2563EB]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.count > 0 && (
                <span className="absolute top-1 right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {item.count}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
