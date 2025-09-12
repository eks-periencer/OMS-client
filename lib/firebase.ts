// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGVofEoMVQY1uJVhrQ-y4_kNJhW-q3yew",
  authDomain: "oms-platform-e2d35.firebaseapp.com",
  projectId: "oms-platform-e2d35",
  storageBucket: "oms-platform-e2d35.appspot.com",
  messagingSenderId: "911564384878",
  appId: "1:911564384878:web:999c808b136910f413147f",
  measurementId: "G-745Y1G9BTX"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure Google provider
provider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, provider };
export default app;
