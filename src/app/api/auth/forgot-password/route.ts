import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/passwordReset";

export const runtime = "nodejs";

type ForgotBody = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotBody;
    const result = await requestPasswordReset({
      email: body.email || "",
      request,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to start password recovery.";
    const status = message.includes("valid email") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
