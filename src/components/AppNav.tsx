"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Center menu. The link for the section the user is in stays highlighted.
 */
export function AppNav() {
  const t = useTranslations("Nav");
  const tApp = useTranslations("App");
  const pathname = usePathname();
  const items = [
    { href: "/batches", label: t("batches") },
    { href: "/inspections", label: t("inspection") },
    { href: "/dashboard", label: t("dashboard") },
  ];

  return (
    <nav className="app-nav" aria-label={tApp("title")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
