import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";

/**
 * Signed-in pages share the app header. Login is outside this group.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AppHeader />
      </Suspense>
      {children}
    </>
  );
}
