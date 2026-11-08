import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "dark" | "taupe" | "outline" | "lightOutline";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "dark",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link className={`${styles.button} ${styles[variant]} ${className}`} href={href}>
      {children}
    </Link>
  );
}
