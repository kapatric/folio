export type ApiErrorBody = {
  error?: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: init.cache ?? "no-store",
  });

  const data = await parseJson<T & ApiErrorBody>(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

export type ApiCustomer = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  phone: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
};

export function loginRequest(body: { email: string; password: string }) {
  return apiFetch<{ customer: ApiCustomer }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function registerRequest(body: {
  email: string;
  password: string;
  fullName: string;
  organization?: string;
  phone?: string;
}) {
  return apiFetch<{ customer: ApiCustomer }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Returns `{ customer: null }` when there is no session (HTTP 401). */
export async function meRequest() {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await parseJson<
    { customer: ApiCustomer | null } & ApiErrorBody
  >(response);

  if (response.status === 401) {
    return { customer: null as ApiCustomer | null };
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

export function logoutRequest() {
  return apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function forgotPasswordRequest(body: { email: string }) {
  return apiFetch<{
    ok: true;
    message: string;
    delivery: "email" | "outbox";
    resetUrl?: string;
  }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function resetPasswordRequest(body: {
  token: string;
  password: string;
}) {
  return apiFetch<{ ok: true; customer: ApiCustomer }>(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function updateProfileRequest(body: {
  fullName?: string;
  organization?: string;
  phone?: string;
  walletAddress?: string;
}) {
  return apiFetch<{ customer: ApiCustomer }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export type UploadResponse = {
  ok: boolean;
  certificateId: string;
  originalName: string;
  size: number;
  mimeType: string;
  contentHash: string;
  documentType: string;
  linkedToAccount: boolean;
  walletAddress: string | null;
};

export function uploadDocumentRequest(formData: FormData) {
  return apiFetch<UploadResponse>("/api/upload", {
    method: "POST",
    body: formData,
  });
}

export function listDocumentsRequest() {
  return apiFetch<{
    documents: import("@/lib/documents/types").PublicDocument[];
  }>("/api/documents");
}
