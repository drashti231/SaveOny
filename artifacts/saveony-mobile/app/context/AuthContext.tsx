import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signOut: async () => {},
  reloadUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoaded(true);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <AuthContext.Provider
      key={refreshKey}
      value={{
        isLoaded,
        isSignedIn: !!auth.currentUser || !!user,
        user: auth.currentUser || user,
        signOut,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hooks to mimic Clerk's API for easy migration
export const useAuth = () => {
  const context = useContext(AuthContext);
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    signOut: context.signOut,
    reloadUser: context.reloadUser,
    getToken: async () => {
      if (context.user) {
        return await context.user.getIdToken();
      }
      return null;
    }
  };
};

export const useUser = () => {
  const context = useContext(AuthContext);
  return {
    user: context.user,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    reloadUser: context.reloadUser,
  };
};
