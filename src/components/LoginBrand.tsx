import { PackageCheck } from "lucide-react";

interface LoginBrandProps {
  title: string;
}

/**
 * Left-aligned product mark for the login screen.
 */
export function LoginBrand({ title }: LoginBrandProps) {
  return (
    <header className="login-brand">
      <PackageCheck aria-hidden="true" />
      <h1>{title}</h1>
    </header>
  );
}
