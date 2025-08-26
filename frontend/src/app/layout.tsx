import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthContext";
import AppFrame from "@/components/AppFrame"; // <-- client wrapper

export const metadata = {
  title: "FaithChat - Bible-Based AI",
  description:
    "Ask anything about faith, life, or the Bible — NKJV-only, pastorally explained.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <AuthProvider>
          <AppFrame>{children}</AppFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
