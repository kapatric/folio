import { cookies } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/crypto";
import {
  getPublicCustomerById,
  type PublicCustomer,
} from "@/lib/auth/customerStore";

export const SESSION_COOKIE = "folio_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function setSessionCookie(customerId: string) {
  const token = createSessionToken(customerId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function getSessionCustomer(): Promise<PublicCustomer | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return getPublicCustomerById(payload.sub);
}
