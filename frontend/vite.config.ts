import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "::",
    port: 5173,
    proxy: {
      "/auth/register": "http://localhost:8000",
      "/auth/login": "http://localhost:8000",
      "/auth/me": "http://localhost:8000",
      "/auth/google": "http://localhost:8000",
      "/meetings": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
});
