"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

const styledButton = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 text-center font-sans no-underline disabled:cursor-not-allowed disabled:opacity-[0.55]",
  {
    variants: {
      variant: {
        primary: "border-primary bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "border-border bg-transparent text-on-primary hover:bg-accent",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

type StyledButtonProps = VariantProps<typeof styledButton> & {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

/**
 * Red primary and transparent secondary actions used by forms and dialogs.
 */
export function StyledButton({
  variant,
  size,
  className,
  children,
  href,
  type = "button",
  disabled,
  onClick,
}: StyledButtonProps) {
  const classes = styledButton({ variant, size, className });

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
