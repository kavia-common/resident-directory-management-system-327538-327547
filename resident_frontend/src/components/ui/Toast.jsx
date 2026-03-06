import React, { useEffect } from "react";
import styles from "./ui.module.css";

/**
 * @param {{
 *  tone?: "info" | "success" | "error",
 *  message: string,
 *  onClose: () => void,
 *  durationMs?: number
 * }} props
 */
export default function Toast({ tone = "info", message, onClose, durationMs = 3500 }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [onClose, durationMs]);

  return (
    <div className={[styles.toast, styles[`toast_${tone}`]].join(" ")} role="status" aria-live="polite">
      <div className={styles.toastMsg}>{message}</div>
      <button className={styles.toastClose} onClick={onClose} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
