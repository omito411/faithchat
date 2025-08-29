// components/AppFrame.tsx
"use client";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AppFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
