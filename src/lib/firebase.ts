// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGVofEoMVQY1uJVhrQ-y4_kNJhW-q3yew",
  authDomain: "oms-platform-e2d35.firebaseapp.com",
  projectId: "oms-platform-e2d35",
  storageBucket: "oms-platform-e2d35.firebasestorage.app",
  messagingSenderId: "911564384878",
  appId: "1:911564384878:web:999c808b136910f413147f",
  measurementId: "G-745Y1G9BTX"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, provider, analytics };
