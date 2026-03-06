import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./layout.module.css";
import Button from "./ui/Button.jsx";
import Modal from "./ui/Modal.jsx";
import Input from "./ui/Input.jsx";
import Toast from "./ui/Toast.jsx";
import { apiLogin, getApiBaseUrl } from "../api/client.js";
import { getAdminToken, isAdminAuthed, logoutAdmin, setAdminToken } from "../auth/adminAuth.js";

export default function AppLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const authed = isAdminAuthed();
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true" />
          <div>
            <div className={styles.brandTitle}>Resident Directory</div>
            <div className={styles.brandSub}>Search and view residents</div>
          </div>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Residents
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Admin
          </NavLink>
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.apiHint} title={apiBase}>
            API: <code className={styles.code}>{apiBase}</code>
          </div>
          {authed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logoutAdmin();
                setToast({ tone: "success", message: "Logged out." });
              }}
            >
              Logout
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setLoginOpen(true)}>
              Admin Login
            </Button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet context={{ toast, setToast, loginOpen, setLoginOpen }} />
      </main>

      <footer className={styles.footer}>
        <span>Modern light UI • Primary </span>
        <span className={styles.dot} aria-hidden="true" />
        <span> #3b82f6</span>
        <span className={styles.dot} aria-hidden="true" />
        <span> Success #06b6d4</span>
      </footer>

      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={() => {
          setLoginOpen(false);
          setToast({ tone: "success", message: "Admin authenticated." });
        }}
      />

      {toast ? <Toast tone={toast.tone} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

function AdminLoginModal({ open, onClose, onLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { token } = await apiLogin({ username, password });
      setAdminToken(token);
      onLoggedIn();
      // Ensure admin page re-renders with authed state.
      navigate("/admin");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Admin Login"
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={busy} onClick={() => {}}>
            {/* submit button is in form; this is just for layout consistency */}
            Continue
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit}>
        <Input
          id="admin-username"
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          disabled={busy}
        />
        <Input
          id="admin-password"
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="current-password"
          disabled={busy}
        />
        {error ? <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div> : null}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose} disabled={busy} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={busy || !username || !password}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>

        {/* For debugging: show token presence without revealing it */}
        <div style={{ marginTop: 12, color: "#64748b", fontSize: 12 }}>
          Current session: {getAdminToken() ? "token set" : "not authenticated"}
        </div>
      </form>
    </Modal>
  );
}
