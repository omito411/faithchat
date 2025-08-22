import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";

export const metadata = {
  title: "FaithChat - Bible-Based AI",
  description: "Ask anything about faith, life, or the Bible — NKJV-only, pastorally explained."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <AuthProvider>
          <NavBar />
          <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
