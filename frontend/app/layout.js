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
import { NotificationProvider } from '@/context/NotificationContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-[#F8FAFC] min-h-screen text-gray-900 font-poppins antialiased">
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Navbar />
              <main className="max-w-full mx-auto">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
