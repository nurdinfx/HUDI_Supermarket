"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAdminAuth } from './AdminAuthContext';
import api from '@/utils/api';

const NotificationContext = createContext();

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
            vapidKey: 'YOUR_VAPID_KEY'
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
        if (!firebaseConfig.apiKey.startsWith('YOUR_')) {
          console.error('Admin Notification Init Error:', error);
        }
      }
    };

    if (!firebaseConfig.apiKey.startsWith('YOUR_')) {
      initNotifications();
    } else {
      console.warn('Firebase Notifications: Please configure your credentials in NotificationContext.js');
    }
  }, [adminUser]);

  return (
    <NotificationContext.Provider value={{ fcmToken, permission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
