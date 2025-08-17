// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "FaithChat",
  description: "Bible-based AI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
