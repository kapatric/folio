import { redirect } from "next/navigation";
import { getSessionCustomer } from "@/lib/auth/session";
import type { PublicCustomer } from "@/lib/auth/customerStore";

export async function requireSessionCustomer(): Promise<PublicCustomer> {
  let customer: PublicCustomer | null;
  try {
    customer = await getSessionCustomer();
  } catch {
    redirect("/login");
  }

  if (!customer) {
    redirect("/login");
  }

  return customer;
}
