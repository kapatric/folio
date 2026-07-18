import Link from "next/link";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark brand-mark-link">
        Folio
      </Link>
      <HamburgerMenu />
    </header>
  );
}
