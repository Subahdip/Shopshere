import fs from "fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID || "shopsphere-c85ce";
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const hasValidCredFile = credPath && fs.existsSync(credPath);

if (!hasValidCredFile && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const firebaseAdminApp = getApps().length
  ? getApps()[0]
  : initializeApp(
      hasValidCredFile
        ? { credential: applicationDefault(), projectId }
        : { projectId }
    );

export const adminAuth = getAuth(firebaseAdminApp);
export default firebaseAdminApp;
