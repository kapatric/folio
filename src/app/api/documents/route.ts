import { NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/auth/session";
import { listDocumentsForCustomer } from "@/lib/documents/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const documents = await listDocumentsForCustomer(customer.id);
    return NextResponse.json({ documents });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list documents.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
