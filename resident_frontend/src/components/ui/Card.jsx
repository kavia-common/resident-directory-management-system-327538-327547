import React from "react";
import styles from "./ui.module.css";

/**
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function Card({ children, className }) {
  return <div className={[styles.card, className || ""].filter(Boolean).join(" ")}>{children}</div>;
}
