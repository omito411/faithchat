import { ReactNode } from "react";
import Link from "next/link";

type ButtonProps = {
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  children: ReactNode;
  className?: string;
};

const base =
  "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-soft";

export default function Button({ href, onClick, variant = "solid", children, className }: ButtonProps) {
  const styles =
    variant === "solid"
      ? "bg-brand-500 text-white hover:bg-brand-400"
      : variant === "outline"
      ? "border border-white/20 text-white hover:bg-white/5"
      : "text-white/80 hover:text-white";

  if (href) return <Link href={href} className={`${base} ${styles} ${className || ""}`}>{children}</Link>;
  return <button onClick={onClick} className={`${base} ${styles} ${className || ""}`}>{children}</button>;
}
