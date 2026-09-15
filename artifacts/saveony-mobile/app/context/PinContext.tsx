import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PinContextType = {
  isPinSet: boolean | null; // null means loading
  isUnlocked: boolean;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  lock: () => void;
  removePin: () => Promise<void>;
};

const PinContext = createContext<PinContextType>({
  isPinSet: null,
  isUnlocked: false,
  setPin: async () => {},
  verifyPin: async () => false,
  lock: () => {},
  removePin: async () => {},
});

const PIN_STORAGE_KEY = "SAVEONY_USER_PIN";

// Helper for web compatibility (SecureStore is not supported on web)
async function saveString(key: string, value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getString(key: string) {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteString(key: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [isPinSet, setIsPinSet] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  useEffect(() => {
    async function loadPinStatus() {
      try {
        const storedPin = await getString(PIN_STORAGE_KEY);
        setIsPinSet(!!storedPin);
      } catch (error) {
        console.error("Failed to load PIN status", error);
        setIsPinSet(false);
      }
    }
    loadPinStatus();
  }, []);

  const setPin = async (pin: string) => {
    try {
      await saveString(PIN_STORAGE_KEY, pin);
      setIsPinSet(true);
      setIsUnlocked(true); // Automatically unlock when setting for the first time
    } catch (error) {
      console.error("Failed to set PIN", error);
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await getString(PIN_STORAGE_KEY);
      if (storedPin === pin) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to verify PIN", error);
      return false;
    }
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  const removePin = async () => {
    try {
      await deleteString(PIN_STORAGE_KEY);
      setIsPinSet(false);
      setIsUnlocked(false);
    } catch (error) {
      console.error("Failed to remove PIN", error);
    }
  };

  return (
    <PinContext.Provider value={{ isPinSet, isUnlocked, setPin, verifyPin, lock, removePin }}>
      {children}
    </PinContext.Provider>
  );
}

export const usePin = () => useContext(PinContext);
