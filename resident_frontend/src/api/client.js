/**
 * Lightweight REST client for the Resident Backend.
 *
 * Env base URL resolution:
 * - Prefer REACT_APP_API_BASE / REACT_APP_BACKEND_URL (per container env list)
 * - Fall back to Vite-style VITE_API_BASE (if present)
 *
 * IMPORTANT: Backend API endpoints are inferred because no OpenAPI spec is present
 * in this workspace. The chosen paths are common conventions:
 * - GET    /health
 * - POST   /auth/login
 * - GET    /residents
 * - POST   /residents
 * - GET    /residents/:id
 * - PUT    /residents/:id
 * - DELETE /residents/:id
 *
 * If the backend differs, update the endpoint paths here only.
 */

const DEFAULT_BASE = "http://localhost:3001";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured backend base URL from environment variables. */
  const vite = import.meta.env?.VITE_API_BASE;
  // Vite only exposes VITE_* at build time; REACT_APP_* isn't auto-exposed, but we
  // keep compatibility with existing conventions via window injection (optional)
  // and Node-style process.env (useful in tests).
  const nodeEnv =
    typeof process !== "undefined"
      ? process.env?.REACT_APP_API_BASE || process.env?.REACT_APP_BACKEND_URL
      : undefined;

  const windowEnv =
    typeof window !== "undefined"
      ? window.__ENV__?.REACT_APP_API_BASE || window.__ENV__?.REACT_APP_BACKEND_URL
      : undefined;

  return windowEnv || nodeEnv || vite || DEFAULT_BASE;
}

/**
 * @typedef {Object} Resident
 * @property {string} id
 * @property {string} name
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [photoUrl]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {string} message
 * @property {any} [details]
 */

function buildUrl(path) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJsonOrText(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toApiError(status, payload) {
  const message =
    (payload && typeof payload === "object" && (payload.detail || payload.message)) ||
    (typeof payload === "string" ? payload : "Request failed");
  return { status, message, details: payload };
}

async function request(path, { method = "GET", token, json, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    signal
  });

  const payload = await parseJsonOrText(res);
  if (!res.ok) throw toApiError(res.status, payload);
  return payload;
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  /** Basic connectivity check. */
  return request("/health");
}

// ---- Auth ----

// PUBLIC_INTERFACE
export async function apiLogin({ username, password }) {
  /**
   * Log in as admin. Expected response shape:
   * - { access_token: string } or { token: string }
   */
  const data = await request("/auth/login", { method: "POST", json: { username, password } });
  const token = data?.access_token || data?.token;
  if (!token) {
    const err = { status: 500, message: "Login succeeded but token was not returned.", details: data };
    throw err;
  }
  return { token, raw: data };
}

// ---- Residents ----

// PUBLIC_INTERFACE
export async function apiListResidents({ q, signal } = {}) {
  /** List residents, optionally filtered by 'q'. */
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const qs = params.toString();
  return request(`/residents${qs ? `?${qs}` : ""}`, { signal });
}

// PUBLIC_INTERFACE
export async function apiGetResident(id, { signal } = {}) {
  /** Fetch a single resident by id. */
  return request(`/residents/${encodeURIComponent(id)}`, { signal });
}

// PUBLIC_INTERFACE
export async function apiCreateResident(resident, { token } = {}) {
  /** Create a resident (admin). */
  return request("/residents", { method: "POST", token, json: resident });
}

// PUBLIC_INTERFACE
export async function apiUpdateResident(id, resident, { token } = {}) {
  /** Update a resident by id (admin). */
  return request(`/residents/${encodeURIComponent(id)}`, { method: "PUT", token, json: resident });
}

// PUBLIC_INTERFACE
export async function apiDeleteResident(id, { token } = {}) {
  /** Delete a resident by id (admin). */
  return request(`/residents/${encodeURIComponent(id)}`, { method: "DELETE", token });
}
