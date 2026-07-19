import type { Metadata } from "next";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { AccountShell } from "@/components/AccountShell";
import { ProfileWorkspace } from "@/components/ProfileWorkspace";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account information — Folio",
  description:
    "Manage your encrypted Folio profile, contact details, and linked wallet.",
};

export default async function AccountProfilePage() {
  const customer = await requireSessionCustomer();

  return (
    <AccountShell footer="Folio · Account information">
      <AccountPageHeader
        title="Account information"
        description="Review and update the encrypted details tied to your Folio login."
      />
      <ProfileWorkspace customer={customer} />
    </AccountShell>
  );
}
