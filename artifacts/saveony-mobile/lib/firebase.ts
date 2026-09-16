import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGic6MHfCktfR9z5QSM9HdhMzjZRW5nFI",
  authDomain: "saveony-65af4.firebaseapp.com",
  projectId: "saveony-65af4",
  storageBucket: "saveony-65af4.firebasestorage.app",
  messagingSenderId: "491206246362",
  appId: "1:491206246362:web:27ae60798b7a6796140ae3"
};

// Initialize Firebase (guard against double initialization in Expo hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use standard getAuth — works reliably with Expo + Firebase v12
// Firebase automatically handles session persistence via AsyncStorage in RN enviroment
const auth = getAuth(app);

export { app, auth };
