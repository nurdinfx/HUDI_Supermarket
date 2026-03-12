"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Request permission and initialize Firebase
    const initNotifications = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            setFcmToken(token);
            // Sync with backend if user is logged in
            if (user) {
              await api.put('/users/profile', { fcmToken: token });
            }
          }
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Foreground message:', payload);
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play blocked:', e));
          
          // Show browser notification if possible
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/placeholder.svg'
            });
          }
        });
      } catch (error) {
        if (!firebaseConfig.apiKey.startsWith('YOUR_')) {
          console.error('Notification Init Error:', error);
        }
      }
    };

    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIzaSy')) {
      initNotifications();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ fcmToken, permission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
