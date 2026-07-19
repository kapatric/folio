import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AccountTabs } from "@/components/AccountTabs";
import { AccountWelcome } from "@/components/AccountWelcome";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uploaded documents — Folio",
  description:
    "Upload, list, and download documents from your encrypted Folio vault.",
};

export default async function AccountDocumentsPage() {
  const customer = await requireSessionCustomer();

  return (
    <AccountShell footer="Folio · Uploaded documents">
      <AccountWelcome fullName={customer.fullName} email={customer.email} />
      <AccountTabs customer={customer} initialTab="documents" />
    </AccountShell>
  );
}
