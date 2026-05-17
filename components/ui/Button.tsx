"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  arrow?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
};

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  onClick,
  type = "button",
  arrow = false,
  size = "md",
  disabled = false,
}: Props) {
  const sizeCls = {
    sm: "px-4 py-2 text-[13px]",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-[15px]",
  }[size];

  const base = `btn btn-${variant} ${sizeCls} group`;
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {content}
    </button>
  );
}
