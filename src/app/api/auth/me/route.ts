import { NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }
    return NextResponse.json({ customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
