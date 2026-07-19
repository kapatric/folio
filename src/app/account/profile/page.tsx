import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AccountTabs } from "@/components/AccountTabs";
import { AccountWelcome } from "@/components/AccountWelcome";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account information — Folio",
  description:
    "View and edit your encrypted Folio account information and linked wallet.",
};

export default async function AccountProfilePage() {
  const customer = await requireSessionCustomer();

  return (
    <AccountShell footer="Folio · Account information">
      <AccountWelcome fullName={customer.fullName} email={customer.email} />
      <AccountTabs customer={customer} initialTab="information" />
    </AccountShell>
  );
}
