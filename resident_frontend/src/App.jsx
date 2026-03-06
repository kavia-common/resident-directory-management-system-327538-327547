import React from "react";

/**
 * Minimal application shell.
 * This intentionally stays lightweight: the immediate goal is ensuring the frontend binds to port 3000 and becomes ready.
 */
export default function App() {
  const apiBase =
    import.meta.env?.VITE_API_BASE ||
    // keep compatibility with existing .env naming convention
    (typeof process !== "undefined" ? process.env?.REACT_APP_API_BASE : undefined) ||
    "http://localhost:3001";

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Resident Directory</h1>
      <p style={{ marginBottom: 8 }}>
        Frontend is running and listening on <code>3000</code>.
      </p>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Backend API base (from env): <code>{apiBase}</code>
      </p>
    </div>
  );
}
