
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check Firebase configuration
console.log("Firebase config diagnostic:", {
  apiKeyLoaded: Boolean(firebaseConfig.apiKey),
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appIdLoaded: Boolean(firebaseConfig.appId),
});

// Initialize Firebase correctly
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
