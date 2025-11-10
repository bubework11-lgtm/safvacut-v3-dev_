import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/", // keep this
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    hmr: {
      host: "0.0.0.0",
      protocol: "ws",
    },
    // ✅ Allow Replit preview domain
    allowedHosts: [
      "016ad9f1-1000-46e1-b1c3-e98819ca5dbc-00-3cyk3dwjzaygj.janeway.replit.dev",
    ],
  },
  build: {
    target: "es2020",
  },
});
