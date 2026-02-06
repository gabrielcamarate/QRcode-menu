"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/settings", label: "Configuracoes" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
