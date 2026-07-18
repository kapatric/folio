import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/auth/customerStore";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim() || "";
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const customer = await authenticateCustomer(email, password);
    if (!customer) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await setSessionCookie(customer.id);
    return NextResponse.json({ customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
