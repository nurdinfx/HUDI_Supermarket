import './globals.css';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AdminLayoutWrapper from './AdminLayoutWrapper';

export const metadata = {
  title: 'Hudi_Supermarket | Admin',
  description: 'Premium Supermarket Management System',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-[#F8FAFC] min-h-screen text-gray-900 font-poppins antialiased">
        <AdminAuthProvider>
          <NotificationProvider>
            <AdminLayoutWrapper>
              {children}
            </AdminLayoutWrapper>
          </NotificationProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
