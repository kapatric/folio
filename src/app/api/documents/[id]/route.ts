import { NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/auth/session";
import { getDocumentForCustomer } from "@/lib/documents/store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await getDocumentForCustomer(id, customer.id);
    if (!result) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { record, bytes } = result;
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": record.mimeType,
        "Content-Length": String(bytes.length),
        "Content-Disposition": `attachment; filename="${record.originalName.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to download document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
