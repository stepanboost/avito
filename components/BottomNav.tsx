"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Лента", icon: "🏠" },
    { href: "/listings/new", label: "Добавить", icon: "＋" },
    { href: "/profile", label: "Кабинет", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
      <div className="flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition ${
              pathname === link.href
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
