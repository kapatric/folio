"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { meRequest } from "@/lib/api/client";

type CustomerSummary = {
  id: string;
  fullName: string;
  email: string;
};

type MenuLink = {
  href: string;
  label: string;
};

const NAV_LINKS: MenuLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/account", label: "Account" },
  { href: "/account/profile", label: "Account information" },
  { href: "/account/documents", label: "Uploaded documents" },
  { href: "/sign-out", label: "Sign out" },
  { href: "/login", label: "Sign in" },
];

type HamburgerMenuProps = {
  onOpenChange?: (open: boolean) => void;
};

export function HamburgerMenu({ onOpenChange }: HamburgerMenuProps) {
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);

  // Close the sticky dropdown when the route changes; keep it open while scrolling.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    let cancelled = false;
    void meRequest()
      .then((data) => {
        if (!cancelled) setCustomer(data.customer);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const links = NAV_LINKS.filter((link) => {
    if (link.href === "/login" && customer) return false;
    if (link.href === "/sign-out" && !customer) return false;
    if (link.href.startsWith("/account") && !customer) return false;
    return true;
  });

  return (
    <div className="hamburger" ref={rootRef}>
      <button
        type="button"
        className={`hamburger-toggle${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hamburger-line" aria-hidden="true" />
        <span className="hamburger-line" aria-hidden="true" />
        <span className="hamburger-line" aria-hidden="true" />
      </button>

      {open && (
        <nav
          id={menuId}
          className="hamburger-dropdown"
          aria-label="Primary"
        >
          <ul className="hamburger-list">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hamburger-link"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
