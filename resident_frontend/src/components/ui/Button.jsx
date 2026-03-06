import React from "react";
import styles from "./ui.module.css";

/**
 * @param {{
 *  variant?: "primary" | "secondary" | "danger" | "ghost",
 *  size?: "sm" | "md",
 *  type?: "button" | "submit" | "reset",
 *  disabled?: boolean,
 *  onClick?: () => void,
 *  children: React.ReactNode
 * }} props
 */
export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  onClick,
  children
}) {
  const className = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    disabled ? styles.btn_disabled : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
