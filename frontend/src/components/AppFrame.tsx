"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDonate = pathname?.startsWith("/donate");

  return (
    <>
      {!isDonate && <NavBar />}
      <main className={isDonate ? "max-w-none p-0" : "max-w-2xl mx-auto px-4 py-8"}>
        {children}
      </main>
      {!isDonate && <Footer />}
    </>
  );
}
