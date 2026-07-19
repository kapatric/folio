import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type AccountShellProps = {
  children: ReactNode;
  footer?: string;
};

export function AccountShell({
  children,
  footer = "Folio · Signed-in account",
}: AccountShellProps) {
  return (
    <div className="page-shell">
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere-wash" />
        <div className="atmosphere-grid" />
        <div className="atmosphere-orb atmosphere-orb-a" />
        <div className="atmosphere-orb atmosphere-orb-b" />
      </div>

      <SiteHeader />

      <main className="account-main">{children}</main>

      <footer className="site-footer">
        <p>{footer}</p>
      </footer>
    </div>
  );
}
