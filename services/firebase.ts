import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC46a_RNiA3jloSWiKbZvuD2Z9ViciZdNE",
  authDomain: "solventless-7d0ef.firebaseapp.com",
  projectId: "solventless-7d0ef",
  storageBucket: "solventless-7d0ef.firebasestorage.app",
  messagingSenderId: "1092435425142",
  appId: "1:1092435425142:web:95bf6b54be84031ccfac57",
  measurementId: "G-7WLDD5GV18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
