import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSessionCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — Folio",
  description:
    "Your Folio account: view and edit account information, or manage uploaded documents.",
};

/** Hub entry point opens the Account information tab by default. */
export default async function AccountPage() {
  await requireSessionCustomer();
  redirect("/account/profile");
}
