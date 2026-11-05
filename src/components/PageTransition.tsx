import { ViewTransition, type ReactNode } from "react";

/**
 * Fades the page body on route changes. Each page wraps its own body so the
 * shared header stays put.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      {children}
    </ViewTransition>
  );
}
