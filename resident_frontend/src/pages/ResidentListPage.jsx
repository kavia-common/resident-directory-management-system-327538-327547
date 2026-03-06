import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { apiListResidents } from "../api/client.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import styles from "./pages.module.css";

export default function ResidentListPage() {
  const { setToast } = useOutletContext();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      setError("");
      setBusy(true);
      try {
        const data = await apiListResidents({ q: q.trim(), signal: ctrl.signal });
        // Allow either {items:[...]} or direct array.
        const items = Array.isArray(data) ? data : data?.items || [];
        setResidents(items);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load residents.");
        setToast?.({ tone: "error", message: "Could not load residents from API." });
      } finally {
        setBusy(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [q, setToast]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return residents;
    // In addition to backend 'q', also filter client-side for responsiveness.
    return residents.filter((r) => {
      const hay = `${r?.name || ""} ${r?.address || ""} ${r?.email || ""} ${r?.phone || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [residents, q]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Residents</h1>
          <p className={styles.sub}>Search by name, address, email, or phone.</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.badge}>{busy ? "Loading…" : `${filtered.length} shown`}</div>
        </div>
      </div>

      <Card className={styles.searchCard}>
        <Input id="search" label="Search" value={q} onChange={setQ} placeholder="e.g., Ada Lovelace, 123 Main St" />
      </Card>

      {error ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorTitle}>Couldn’t load residents</div>
          <div className={styles.errorMsg}>{error}</div>
          <div className={styles.errorHint}>
            Check <code>REACT_APP_API_BASE</code> / <code>REACT_APP_BACKEND_URL</code> and that the backend is running.
          </div>
        </Card>
      ) : null}

      <div className={styles.grid}>
        {filtered.map((r) => (
          <Link key={r.id} to={`/residents/${encodeURIComponent(r.id)}`} className={styles.residentLink}>
            <Card className={styles.residentCard}>
              <div className={styles.residentRow}>
                <ResidentAvatar name={r?.name} photoUrl={r?.photoUrl} />
                <div className={styles.residentMeta}>
                  <div className={styles.residentName}>{r?.name || "Unnamed resident"}</div>
                  <div className={styles.residentLine}>{r?.address || "—"}</div>
                  <div className={styles.residentLine}>
                    {r?.email ? <span>{r.email}</span> : <span>—</span>}
                    <span className={styles.sep} aria-hidden="true" />
                    {r?.phone ? <span>{r.phone}</span> : <span>—</span>}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!busy && !error && filtered.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No residents found</div>
          <div className={styles.emptyMsg}>Try a different search term.</div>
        </Card>
      ) : null}
    </div>
  );
}

function ResidentAvatar({ name, photoUrl }) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  if (photoUrl) {
    return <img className={styles.avatarImg} src={photoUrl} alt={`${name || "Resident"} photo`} />;
  }

  return <div className={styles.avatarFallback}>{initials || "?"}</div>;
}
