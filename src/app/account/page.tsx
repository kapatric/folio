import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AccountWelcome } from "@/components/AccountWelcome";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — Folio",
  description:
    "Your Folio account hub: open account information or uploaded documents.",
};

export default async function AccountPage() {
  const customer = await requireSessionCustomer();

  return (
    <AccountShell>
      <AccountWelcome fullName={customer.fullName} email={customer.email} />
    </AccountShell>
  );
}
