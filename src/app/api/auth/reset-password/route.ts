import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/passwordReset";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

type ResetBody = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetBody;
    const customer = await resetPasswordWithToken({
      token: body.token || "",
      password: body.password || "",
    });

    // Replace any existing session with a fresh login after reset.
    await clearSessionCookie();
    await setSessionCookie(customer.id);

    return NextResponse.json({ ok: true, customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reset password.";
    const status =
      message.includes("invalid") ||
      message.includes("expired") ||
      message.includes("at least 8") ||
      message.includes("required")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
