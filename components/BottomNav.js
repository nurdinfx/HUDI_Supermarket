"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-2 py-2 z-50 flex justify-around items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 relative transition-all duration-300 ${
              isActive ? 'text-[#2563EB]' : 'text-gray-400'
            }`}
          >
            <motion.div 
              initial={false}
              animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
              className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-[#2563EB]' : 'bg-transparent'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {item.count}
                </span>
              )}
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70 text-[9px]'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
