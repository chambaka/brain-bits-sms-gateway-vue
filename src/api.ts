const base = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export type Envelope<T> = { success: boolean; data: T; error: { code: string; message: string } | null };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = localStorage.getItem("accessToken");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data;
}
