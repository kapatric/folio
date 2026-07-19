import { NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/auth/session";
import { storeDocument } from "@/lib/documents/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file =
      formData.get("document") ??
      formData.get("certificate") ??
      formData.get("file");
    const walletAddress = String(formData.get("walletAddress") || "");
    const documentType = String(
      formData.get("documentType") || "copyright_certificate",
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A document file is required." },
        { status: 400 },
      );
    }

    const customer = await getSessionCustomer().catch(() => null);

    const document = await storeDocument({
      file,
      documentType,
      walletAddress: walletAddress || undefined,
      ownerCustomerId: customer?.id ?? null,
    });

    return NextResponse.json({
      ok: true,
      document,
      // Backward-compatible fields for the existing upload UI / mint flow
      certificateId: document.id,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      contentHash: document.contentHash,
      walletAddress: document.walletAddress,
      documentType: document.documentType,
      receivedAt: document.createdAt,
      storedSecurely: true,
      linkedToAccount: Boolean(customer),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to store the document.";
    const status =
      message.includes("Missing DOCUMENT_ENCRYPTION_KEY") ||
      message.includes("Missing CUSTOMER_DATA_KEY")
        ? 500
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
