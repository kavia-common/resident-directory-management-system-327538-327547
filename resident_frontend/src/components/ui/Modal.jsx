import React, { useEffect, useRef } from "react";
import styles from "./ui.module.css";

/**
 * @param {{
 *  title: string,
 *  open: boolean,
 *  onClose: () => void,
 *  children: React.ReactNode,
 *  footer?: React.ReactNode
 * }} props
 */
export default function Modal({ title, open, onClose, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Focus the first focusable element in the panel for usability.
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && typeof focusable.focus === "function") focusable.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer ? <div className={styles.modalFooter}>{footer}</div> : null}
      </div>
    </div>
  );
}
