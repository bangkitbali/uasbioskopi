import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  isReady: boolean;
  login: (username: string) => Promise<void>; // Saya ubah agar bisa menerima username
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Kita cek 'username' bukan 'userToken' agar sesuai dengan login kamu
        const user = await AsyncStorage.getItem("username");
        if (!cancelled) {
          setIsLoggedIn(!!user); // true jika username ada, false jika tidak
        }
      } catch (e) {
        console.error("Gagal cek login:", e);
      } finally {
        // PERBAIKAN PENTING: Kita harus set isReady=true agar loading berhenti
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (username: string) => {
    // Simpan username yang asli dari login form
    await AsyncStorage.setItem("username", username);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("username");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}