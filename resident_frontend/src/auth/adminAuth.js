const STORAGE_KEY = "resident_directory_admin_token";

// PUBLIC_INTERFACE
export function getAdminToken() {
  /** Returns the admin bearer token from localStorage, if set. */
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

// PUBLIC_INTERFACE
export function setAdminToken(token) {
  /** Stores the admin token in localStorage. */
  try {
    if (!token) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Ignore storage errors (e.g., disabled storage); app will behave as logged out.
  }
}

// PUBLIC_INTERFACE
export function isAdminAuthed() {
  /** Returns true if an admin token exists. */
  return Boolean(getAdminToken());
}

// PUBLIC_INTERFACE
export function logoutAdmin() {
  /** Logs out admin by clearing stored token. */
  setAdminToken("");
}
