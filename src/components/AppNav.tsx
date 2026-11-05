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
    <nav className="flex items-center gap-2" aria-label={tApp("title")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            transitionTypes={["page-fade"]}
            aria-current={active ? "page" : undefined}
            className="rounded-md px-3 py-1.5 text-base text-foreground no-underline hover:bg-accent aria-[current=page]:bg-accent"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
