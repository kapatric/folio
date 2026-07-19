"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/profile", label: "Account information", exact: false },
  { href: "/account/documents", label: "Uploaded documents", exact: false },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="account-nav" aria-label="Account sections">
      <ul className="account-nav-list">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`account-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
