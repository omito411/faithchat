// components/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AuthContextType = {
  token: string | null;                 // UI hint only
  setToken: (t: string | null) => void;
  clearToken: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
  signOut: async () => {},
});

const HINT_KEY = "fc_token";
const IDLE_MS = 30 * 60 * 1000; // 30 minutes idle logout
const HEARTBEAT_MS = 5 * 60 * 1000; // check session every 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const expTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hbTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem(HINT_KEY, t);
    else localStorage.removeItem(HINT_KEY);
  };
  const clearToken = () => setToken(null);

  const signOut = async () => {
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    clearToken();
    window.location.assign("/login");
  };

  // ----- helpers -----
  const scheduleExpiry = (exp?: number | null) => {
    if (expTimer.current) clearTimeout(expTimer.current);
    if (!exp) return;
    const ms = Math.max(0, exp * 1000 - Date.now() - 2_000); // 2s grace
    expTimer.current = setTimeout(() => {
      // Token expired — sign out automatically
      signOut();
    }, ms);
  };

  const resetIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      // No user activity for IDLE_MS — sign out
      signOut();
    }, IDLE_MS);
  };

  const startIdleWatch = () => {
    const evs: (keyof DocumentEventMap)[] = [
      "mousemove", "keydown", "scroll", "click", "touchstart", "visibilitychange",
    ];
    const reset = () => resetIdle();
    evs.forEach(ev => window.addEventListener(ev, reset, { passive: true } as any));
    resetIdle();
    return () => evs.forEach(ev => window.removeEventListener(ev, reset as any));
  };

  const fetchSession = async () => {
    try {
      const r = await fetch("/api/session", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { email?: string; exp?: number };
      // If we get here, session is valid; ensure UI shows "Sign out"
      if (!token) setToken("1");
      scheduleExpiry(data.exp);
      return true;
    } catch {
      // Session invalid/expired — clear UI
      if (token) clearToken();
      return false;
    }
  };

  // ----- effects -----
  // Boot: load hint, then verify real session & schedule expiry/idle/heartbeat
  useEffect(() => {
    setTokenState(localStorage.getItem(HINT_KEY));
    (async () => {
      await fetchSession();
    })();

    const stopIdle = startIdleWatch();
    hbTimer.current = setInterval(fetchSession, HEARTBEAT_MS);

    return () => {
      stopIdle();
      if (expTimer.current) clearTimeout(expTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (hbTimer.current) clearInterval(hbTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
