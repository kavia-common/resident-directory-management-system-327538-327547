import React, { useEffect, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import { apiGetResident } from "../api/client.js";
import Card from "../components/ui/Card.jsx";
import styles from "./pages.module.css";

export default function ResidentDetailPage() {
  const { setToast } = useOutletContext();
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [resident, setResident] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      if (!id) return;
      setError("");
      setBusy(true);
      try {
        const data = await apiGetResident(id, { signal: ctrl.signal });
        setResident(data);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load resident.");
        setToast?.({ tone: "error", message: "Could not load resident details." });
      } finally {
        setBusy(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [id, setToast]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Resident Details</h1>
          <p className={styles.sub}>View contact info and address.</p>
        </div>
        <div className={styles.headerRight}>
          <Link to="/" className={styles.backLink}>
            ← Back to residents
          </Link>
        </div>
      </div>

      {busy ? <Card className={styles.infoCard}>Loading…</Card> : null}

      {error ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorTitle}>Couldn’t load resident</div>
          <div className={styles.errorMsg}>{error}</div>
        </Card>
      ) : null}

      {resident ? (
        <div className={styles.detailGrid}>
          <Card className={styles.detailCard}>
            <div className={styles.detailHeader}>
              <ResidentAvatar name={resident?.name} photoUrl={resident?.photoUrl} />
              <div>
                <div className={styles.detailName}>{resident?.name || "Unnamed resident"}</div>
                <div className={styles.detailSub}>{resident?.address || "—"}</div>
              </div>
            </div>

            <div className={styles.kv}>
              <div className={styles.k}>Email</div>
              <div className={styles.v}>{resident?.email || "—"}</div>
              <div className={styles.k}>Phone</div>
              <div className={styles.v}>{resident?.phone || "—"}</div>
            </div>
          </Card>

          <Card className={styles.detailCard}>
            <div className={styles.sectionTitle}>Notes</div>
            <div className={styles.notes}>{resident?.notes || "—"}</div>
          </Card>
        </div>
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
    return <img className={styles.detailAvatarImg} src={photoUrl} alt={`${name || "Resident"} photo`} />;
  }

  return <div className={styles.detailAvatarFallback}>{initials || "?"}</div>;
}
