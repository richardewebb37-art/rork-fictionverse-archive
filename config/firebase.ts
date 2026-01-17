import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage 
} from 'firebase/storage';
import { 
  getMessaging, 
  Messaging,
  isSupported as isMessagingSupported 
} from 'firebase/messaging';
import {
  getAnalytics,
  Analytics,
  isSupported as isAnalyticsSupported
} from 'firebase/analytics';
// Crashlytics not available in web
// import {
//   getCrashlytics,
//   Crashlytics
// } from 'firebase/crashlytics';
import { 
  getRemoteConfig, 
  RemoteConfig 
} from 'firebase/remote-config';
import { Platform } from 'react-native';

// Firebase configuration for fictionverse-dba28
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAWVGpJMCghGz1Xf78OhRCq9o0Q0NqBpr8',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fictionverse-dba28.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'fictionverse-dba28',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fictionverse-dba28.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '435820668282',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:435820668282:android:006b469e022a15d43462c3',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase app
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
const auth: Auth = getAuth(app);

// Initialize Firestore with persistent caching (only on React Native)
let firestore: Firestore;
if (Platform.OS !== 'web') {
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (error) {
    console.warn('Firestore initialization error:', error);
    firestore = getFirestore(app);
  }
} else {
  firestore = getFirestore(app);
}

// Initialize Storage
const storage: FirebaseStorage = getStorage(app);

// Initialize Messaging (only on supported platforms)
let messaging: Messaging | null = null;
if (Platform.OS === 'web') {
  isMessagingSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// Initialize Analytics (only on web)
let analytics: Analytics | null = null;
if (Platform.OS === 'web') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Crashlytics (not available on web)
// const crashlytics: Crashlytics = getCrashlytics(app);
const crashlytics: any = null;

// Initialize Remote Config
let remoteConfig: RemoteConfig;
try {
  remoteConfig = getRemoteConfig(app);
  // Set default values for remote config
  remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000, // 1 hour
    fetchTimeoutMillis: 60000, // 1 minute
  };
} catch (error) {
  console.warn('Remote Config not available:', error);
  remoteConfig = {} as RemoteConfig;
}

// Export Firebase instances
export {
  app,
  auth,
  firestore,
  storage,
  messaging,
  analytics,
  crashlytics,
  remoteConfig,
};

// Export Firebase config
export { firebaseConfig };

// Helper to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
};

// Log configuration status
if (!isFirebaseConfigured()) {
  console.warn('⚠️ Firebase is not properly configured!');
} else {
  console.log('✅ Firebase initialized successfully for project: fictionverse-dba28');
}