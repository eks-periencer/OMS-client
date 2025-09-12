// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBGVofEoMVQY1uJVhrQ-y4_kNJhW-q3yew",
//   authDomain: "oms-platform-e2d35.firebaseapp.com",
//   projectId: "oms-platform-e2d35",
//   storageBucket: "oms-platform-e2d35.firebasestorage.app",
//   messagingSenderId: "911564384878",
//   appId: "1:911564384878:web:999c808b136910f413147f",
//   measurementId: "G-745Y1G9BTX"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
