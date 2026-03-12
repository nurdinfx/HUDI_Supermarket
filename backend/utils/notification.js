import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp;

if (!admin.apps.length) {
  try {
    // In a real production environment, you would use a service account JSON or environment variables
    // For this implementation, we'll use a placeholder or check for environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin Initialized');
    } else {
      console.warn('Firebase Admin: No service account found. Push notifications will be disabled.');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
} else {
  firebaseApp = admin.app();
}

export const sendPushNotification = async (token, title, body, data = {}) => {
  if (!firebaseApp || !token) return;

  const message = {
    notification: { title, body },
    token,
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // Common for mobile, can be adjusted for web
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export default admin;
