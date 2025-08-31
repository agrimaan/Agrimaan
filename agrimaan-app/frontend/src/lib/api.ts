// src/lib/api.ts
//const base = process.env.REACT_APP_API_BASE_URL || "";
import { API_BASE_URL } from '../config/apiConfig';


if (!API_BASE_URL) {
  console.warn("[api] No API base URL set. Configure REACT_APP_API_BASE_URL in .env");
}


export async function api<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`[${res.status}] ${res.statusText} ${detail}`);
  }
  return res.json();
}
