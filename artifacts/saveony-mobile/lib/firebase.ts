import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGic6MHfCktfR9z5QSM9HdhMzjZRW5nFI",
  authDomain: "saveony-65af4.firebaseapp.com",
  projectId: "saveony-65af4",
  storageBucket: "saveony-65af4.firebasestorage.app",
  messagingSenderId: "491206246362",
  appId: "1:491206246362:web:27ae60798b7a6796140ae3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

export { app, auth };
