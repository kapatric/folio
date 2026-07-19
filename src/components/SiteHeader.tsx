"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export function SiteHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const onMenuOpenChange = useCallback((open: boolean) => {
    setDropdownOpen(open);
  }, []);

  return (
    <header
      className={`site-header${dropdownOpen ? " is-dropdown-open" : ""}`}
    >
      <Link href="/" className="brand-mark brand-mark-link">
        Folio
      </Link>
      <HamburgerMenu onOpenChange={onMenuOpenChange} />
    </header>
  );
}
