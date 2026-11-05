/**
 * Signed-in routes. The header lives on the root layout so login can share it.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
