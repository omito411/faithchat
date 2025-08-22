"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("fc_token");
    if (t) setTokenState(t);
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("fc_token", t);
    else localStorage.removeItem("fc_token");
  };

  const clearToken = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
