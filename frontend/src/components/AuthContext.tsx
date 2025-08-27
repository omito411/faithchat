"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;                 // use a *hint* (e.g., "1"), not the real JWT
  setToken: (t: string | null) => void; // call this after successful login
  clearToken: () => void;
  signOut: () => Promise<void>;         // NEW
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
  signOut: async () => {},
});

const HINT_KEY = "fc_token"; // this is just a UI hint; not the httpOnly cookie

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(HINT_KEY);
    if (t) setTokenState(t);
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem(HINT_KEY, t);
    else localStorage.removeItem(HINT_KEY);
  };

  const clearToken = () => setToken(null);

  // NEW: clears httpOnly cookies server-side, then clears local hint and redirects
  const signOut = async () => {
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    clearToken();
    window.location.assign("/login");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
