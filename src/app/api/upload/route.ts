import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_BYTES = 12 * 1024 * 1024;
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const certificate = formData.get("certificate");
    const walletAddress = String(formData.get("walletAddress") || "");

    if (!(certificate instanceof File)) {
      return NextResponse.json(
        { error: "A copyright certificate file is required." },
        { status: 400 },
      );
    }

    if (!ADDRESS_RE.test(walletAddress)) {
      return NextResponse.json(
        { error: "A valid wallet address is required." },
        { status: 400 },
      );
    }

    if (!ACCEPTED_TYPES.has(certificate.type)) {
      return NextResponse.json(
        { error: "Upload a PDF or image (PNG, JPEG, WebP)." },
        { status: 400 },
      );
    }

    if (certificate.size <= 0 || certificate.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 12 MB." },
        { status: 400 },
      );
    }

    // Front-end scaffold: validate and acknowledge upload.
    // Persistence / on-chain anchoring can plug in here later.
    await certificate.arrayBuffer();

    const certificateId = `folio_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    return NextResponse.json({
      ok: true,
      certificateId,
      originalName: certificate.name,
      mimeType: certificate.type,
      size: certificate.size,
      walletAddress: walletAddress.toLowerCase(),
      receivedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the upload." },
      { status: 500 },
    );
  }
}
