// Server Component (no "use client")
import type { ReactNode } from "react";

export const metadata = {
  title: "Giving • FaithChat",
};

export default function DonateLayout({ children }: { children: ReactNode }) {
  return (
    <div data-route="donate-root">
      {children}
    </div>
  );
}
