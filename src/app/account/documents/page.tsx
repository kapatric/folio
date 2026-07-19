import type { Metadata } from "next";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { AccountShell } from "@/components/AccountShell";
import { DocumentsWorkspace } from "@/components/DocumentsWorkspace";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uploaded documents — Folio",
  description:
    "Upload, list, and download documents from your encrypted Folio vault.",
};

export default async function AccountDocumentsPage() {
  await requireSessionCustomer();

  return (
    <AccountShell footer="Folio · Uploaded documents">
      <AccountPageHeader
        title="Uploaded documents"
        description="Files in your vault are encrypted at rest and available only to your signed-in session."
      />
      <DocumentsWorkspace />
    </AccountShell>
  );
}
