import React from "react";
import styles from "./ui.module.css";

/**
 * @param {{
 *  id: string,
 *  label: string,
 *  value: string,
 *  onChange: (v: string) => void,
 *  placeholder?: string,
 *  type?: string,
 *  autoComplete?: string,
 *  error?: string,
 *  hint?: string,
 *  disabled?: boolean
 * }} props
 */
export default function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
  hint,
  disabled
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={[styles.input, error ? styles.input_error : ""].filter(Boolean).join(" ")}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {error ? <div className={styles.error}>{error}</div> : hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
}
