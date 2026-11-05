import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/**
 * Consistent page chrome: title, optional description, and content area.
 */
export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6">
        <h1>{title}</h1>
        {description ? <p className="mt-2 max-w-2xl">{description}</p> : null}
      </div>
      {children}
    </main>
  );
}
