import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  apiCreateResident,
  apiDeleteResident,
  apiListResidents,
  apiUpdateResident
} from "../api/client.js";
import { getAdminToken, isAdminAuthed } from "../auth/adminAuth.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import styles from "./pages.module.css";

const emptyForm = {
  name: "",
  address: "",
  email: "",
  phone: "",
  photoUrl: "",
  notes: ""
};

export default function AdminResidentsPage() {
  const { setToast, setLoginOpen } = useOutletContext();

  const authed = isAdminAuthed();
  const token = getAdminToken();

  const [busy, setBusy] = useState(false);
  const [residents, setResidents] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState("create"); // create | update
  const [currentId, setCurrentId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null); // {id, name}

  async function load() {
    setError("");
    setBusy(true);
    try {
      const data = await apiListResidents({ q: q.trim() });
      const items = Array.isArray(data) ? data : data?.items || [];
      setResidents(items);
    } catch (err) {
      setError(err?.message || "Failed to load residents.");
      setToast?.({ tone: "error", message: "Admin: failed to load residents." });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return residents;
    return residents.filter((r) => `${r?.name || ""} ${r?.address || ""}`.toLowerCase().includes(needle));
  }, [residents, q]);

  function openCreate() {
    setFormError("");
    setEditMode("create");
    setCurrentId("");
    setForm(emptyForm);
    setEditOpen(true);
  }

  function openUpdate(r) {
    setFormError("");
    setEditMode("update");
    setCurrentId(r.id);
    setForm({
      name: r?.name || "",
      address: r?.address || "",
      email: r?.email || "",
      phone: r?.phone || "",
      photoUrl: r?.photoUrl || "",
      notes: r?.notes || ""
    });
    setEditOpen(true);
  }

  async function onSave(e) {
    e.preventDefault();
    setFormError("");
    if (!authed) {
      setFormError("Admin authentication required.");
      return;
    }
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setBusy(true);
    try {
      if (editMode === "create") {
        await apiCreateResident({ ...form, name: form.name.trim() }, { token });
        setToast?.({ tone: "success", message: "Resident added." });
      } else {
        await apiUpdateResident(currentId, { ...form, name: form.name.trim() }, { token });
        setToast?.({ tone: "success", message: "Resident updated." });
      }
      setEditOpen(false);
      await load();
    } catch (err) {
      setFormError(err?.message || "Save failed.");
      setToast?.({ tone: "error", message: "Could not save resident." });
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteConfirmed() {
    if (!confirmDelete) return;
    if (!authed) {
      setToast?.({ tone: "error", message: "Admin authentication required." });
      return;
    }
    setBusy(true);
    try {
      await apiDeleteResident(confirmDelete.id, { token });
      setToast?.({ tone: "success", message: "Resident deleted." });
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setToast?.({ tone: "error", message: err?.message || "Delete failed." });
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.h1}>Admin</h1>
            <p className={styles.sub}>Add, edit, and remove residents.</p>
          </div>
        </div>

        <Card className={styles.infoCard}>
          <div className={styles.infoTitle}>Admin authentication required</div>
          <div className={styles.infoMsg}>
            Please sign in to manage residents. Your session token is stored locally in the browser.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button variant="primary" onClick={() => setLoginOpen(true)}>
              Open Admin Login
            </Button>
            <Link to="/" className={styles.backLink}>
              Return to public directory
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Admin Residents</h1>
          <p className={styles.sub}>Create and maintain resident records.</p>
        </div>
        <div className={styles.headerRight}>
          <Button variant="primary" onClick={openCreate}>
            + Add resident
          </Button>
        </div>
      </div>

      <Card className={styles.searchCard}>
        <Input id="admin-search" label="Search" value={q} onChange={setQ} placeholder="Filter by name or address" />
      </Card>

      {error ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorTitle}>Couldn’t load residents</div>
          <div className={styles.errorMsg}>{error}</div>
        </Card>
      ) : null}

      <div className={styles.adminTable}>
        <div className={styles.adminHeaderRow}>
          <div>Name</div>
          <div className={styles.hideSm}>Address</div>
          <div>Actions</div>
        </div>

        {filtered.map((r) => (
          <div key={r.id} className={styles.adminRow}>
            <div>
              <div className={styles.residentName}>{r?.name || "Unnamed resident"}</div>
              <div className={styles.mutedSm}>{r?.email || "—"}</div>
            </div>
            <div className={styles.hideSm}>{r?.address || "—"}</div>
            <div className={styles.actions}>
              <Link to={`/residents/${encodeURIComponent(r.id)}`} className={styles.smallLink}>
                View
              </Link>
              <Button variant="secondary" size="sm" onClick={() => openUpdate(r)} disabled={busy}>
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete({ id: r.id, name: r?.name || "Unnamed resident" })}
                disabled={busy}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!busy && !error && filtered.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No residents</div>
          <div className={styles.emptyMsg}>Add your first resident to get started.</div>
        </Card>
      ) : null}

      <Modal
        title={editMode === "create" ? "Add Resident" : "Edit Resident"}
        open={editOpen}
        onClose={() => (!busy ? setEditOpen(false) : null)}
      >
        <form onSubmit={onSave} className={styles.formGrid}>
          <Input id="name" label="Name" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} />
          <Input
            id="address"
            label="Address"
            value={form.address}
            onChange={(v) => setForm((s) => ({ ...s, address: v }))}
          />
          <Input
            id="email"
            label="Email"
            value={form.email}
            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            type="email"
            autoComplete="email"
          />
          <Input
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            autoComplete="tel"
          />
          <Input
            id="photoUrl"
            label="Photo URL"
            value={form.photoUrl}
            onChange={(v) => setForm((s) => ({ ...s, photoUrl: v }))}
            placeholder="https://…"
          />

          <div className={styles.fieldWide}>
            <label className={styles.textareaLabel} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              rows={4}
            />
          </div>

          {formError ? <div className={styles.formError}>{formError}</div> : null}

          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Confirm delete"
        open={Boolean(confirmDelete)}
        onClose={() => (!busy ? setConfirmDelete(null) : null)}
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDeleteConfirmed} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <div style={{ color: "#111827" }}>
          Delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
        </div>
      </Modal>
    </div>
  );
}
