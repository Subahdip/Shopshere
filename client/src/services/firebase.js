import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length
  ? getApp()
  : console.log("Firebase config diagnostic:", {
      apiKeyLoaded: Boolean(firebaseConfig.apiKey),
      apiKeyLength: firebaseConfig.apiKey?.length,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
