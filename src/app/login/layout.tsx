// src/app/login/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}