import { NextResponse } from "next/server";
import { updateCustomerProfile } from "@/lib/auth/customerStore";
import { getSessionCustomer } from "@/lib/auth/session";

export const runtime = "nodejs";

type UpdateBody = {
  fullName?: string;
  organization?: string;
  phone?: string;
  walletAddress?: string;
};

export async function PATCH(request: Request) {
  try {
    const sessionCustomer = await getSessionCustomer();
    if (!sessionCustomer) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = (await request.json()) as UpdateBody;
    const customer = await updateCustomerProfile(sessionCustomer.id, {
      fullName: body.fullName,
      organization: body.organization,
      phone: body.phone,
      walletAddress: body.walletAddress,
    });
    return NextResponse.json({ customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
