import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>;
}
