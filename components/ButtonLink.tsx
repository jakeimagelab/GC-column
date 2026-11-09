import Link from "next/link";
import type { ReactNode } from "react";
import { attributeEditProps } from "@/content/site-content-types";
import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "dark" | "taupe" | "outline" | "lightOutline";
  className?: string;
  editId?: string;
  target?: "_blank";
  rel?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "dark",
  className = "",
  editId,
  target,
  rel,
}: ButtonLinkProps) {
  return (
    <Link
      className={`${styles.button} ${styles[variant]} ${className}`}
      href={href}
      target={target}
      rel={rel}
      {...(editId ? attributeEditProps(editId, "href") : {})}
    >
      {children}
    </Link>
  );
}
