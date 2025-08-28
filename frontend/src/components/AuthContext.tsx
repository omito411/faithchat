"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;                 // UI hint (e.g., "1"), not the real JWT
  setToken: (t: string | null) => void; // call after successful login
  clearToken: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
  signOut: async () => {},
});

const HINT_KEY  = "fc_token";  // UI hint only (actual auth is httpOnly cookie)
const NAME_KEY  = "fc_name";
const EMAIL_KEY = "fc_email";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    setTokenState(localStorage.getItem(HINT_KEY));
  }, []);

  // keep multiple tabs in sync (optional but nice)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === HINT_KEY) setTokenState(localStorage.getItem(HINT_KEY));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem(HINT_KEY, t);
    else localStorage.removeItem(HINT_KEY);
  };

  const clearToken = () => setToken(null);

  const signOut = async () => {
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    // clear UI hint + any stored profile bits
    localStorage.removeItem(HINT_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setTokenState(null);
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
