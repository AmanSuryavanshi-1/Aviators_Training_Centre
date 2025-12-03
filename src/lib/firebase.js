// Initialize Firebase variables
let app = null;
let db = null;
let firestore = null;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export const initFirebase = async () => {
  if (app) {
    return { app, db, firestore };
  }

  // Import the functions you need from the SDKs you need
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getDatabase } = await import("firebase/database");
  const { getFirestore } = await import("firebase/firestore");

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional.
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // Initialize Realtime Database (for contact forms)
  db = getDatabase(app);

  // Initialize Firestore (for analytics)
  firestore = getFirestore(app);

  return { app, db, firestore };
};

export { app, db, firestore };
// const analytics = getAnalytics(app);