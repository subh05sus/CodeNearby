import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

// Firebase configuration (read from env)
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSENGER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Only initialize Firebase when we have the minimal required config
const canInitializeFirebase = Boolean(
  firebaseConfig.projectId && (firebaseConfig.databaseURL || firebaseConfig.apiKey)
);

let app: FirebaseApp | null = null;
let db: Database | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let messaging: Messaging | null = null;

if (canInitializeFirebase) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

    // Initialize messaging only in the browser and only if supported
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        try {
          if (supported && app) {
            messaging = getMessaging(app as FirebaseApp);
          }
        } catch (err) {
          console.warn("Firebase messaging init failed:", err);
        }
      });
    }
  } catch (error) {
    // Don't crash the server if Firebase isn't configured correctly in dev
    // Log a helpful warning so developers can fix their env
    // eslint-disable-next-line no-console
    console.warn(
      "Firebase initialization skipped or failed. Make sure NEXT_PUBLIC_FIREBASE_* env vars are set. Error:",
      error
    );
    app = null;
    db = null;
    firestore = null;
    storage = null;
    messaging = null;
  }
} else {
  // Missing config - avoid initializing in development
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase config is incomplete - skipping initialization. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_DATABASE_URL or NEXT_PUBLIC_FIREBASE_API_KEY to enable Firebase."
  );
}

export { app, db, firestore, storage, messaging };
