"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseEnabled } from "@/lib/firebase/config";
import { getDemoUserFromStorage, getOrCreateUserProfile, loginWithEmail, logoutUser, signupWithEmail } from "@/lib/firebase/auth";
import { AppUser } from "@/lib/types";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseAuth = auth;

    if (!firebaseEnabled || !firebaseAuth) {
      setUser(getDemoUserFromStorage());
      setLoading(false);
      return;
    }

    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }
        setUser(await getOrCreateUserProfile(firebaseUser));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        setUser(await loginWithEmail(email, password));
      },
      async signup(name, email, password) {
        setUser(await signupWithEmail(name, email, password));
      },
      async logout() {
        await logoutUser();
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
