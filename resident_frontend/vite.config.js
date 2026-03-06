import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /**
   * Vite configuration for the resident frontend.
   * Ensures the dev server binds to 0.0.0.0:3000 so container health/port checks can detect readiness.
   */
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true
  }
});
