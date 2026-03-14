import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: 'Hudi_Supermarket',
  description: 'Your one-stop shop for groceries, electronics, and more.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { NotificationProvider } from '@/context/NotificationContext';
import BottomNav from '@/components/BottomNav';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hudi_Supermarket" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-[#F8FAFC] min-h-screen text-gray-900 font-poppins antialiased pb-20 lg:pb-0">
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <Navbar />
                <main className="max-w-full mx-auto">
                  {children}
                </main>
                <BottomNav />
                <PWAInstallPrompt />
                <Footer />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
