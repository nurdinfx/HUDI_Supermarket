"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAdminAuth } from './AdminAuthContext';
import api from '@/utils/api';

const NotificationContext = createContext();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function NotificationProvider({ children }) {
  const { adminUser } = useAdminAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initNotifications = async () => {
      try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            setFcmToken(token);
            if (adminUser) {
              await api.put('/users/profile', { fcmToken: token });
            }
          }
        }

        onMessage(messaging, (payload) => {
          console.log('Admin Foreground message:', payload);
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play blocked:', e));
          
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/placeholder.svg'
            });
          }
        });
      } catch (error) {
        if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_') && !firebaseConfig.apiKey.includes('...')) {
          console.error('Admin Notification Init Error:', error);
        }
      }
    };

    if (firebaseConfig.apiKey) {
      initNotifications();
    } else {
      console.warn('Firebase Notifications: Credentials not found (NEXT_PUBLIC_FIREBASE_API_KEY). Notifications disabled.');
    }
  }, [adminUser]);

  return (
    <NotificationContext.Provider value={{ fcmToken, permission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
