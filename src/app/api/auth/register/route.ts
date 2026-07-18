import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/auth/customerStore";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

type RegisterBody = {
  email?: string;
  password?: string;
  fullName?: string;
  organization?: string;
  phone?: string;
  walletAddress?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const customer = await registerCustomer({
      email: body.email || "",
      password: body.password || "",
      fullName: body.fullName || "",
      organization: body.organization,
      phone: body.phone,
      walletAddress: body.walletAddress,
    });
    await setSessionCookie(customer.id);
    return NextResponse.json({ customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account.";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
