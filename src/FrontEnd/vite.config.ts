/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Configuration du proxy dev pour éviter tout problème CORS avec le backend FastAPI (port 8000)
    proxy: {
      "/scope-monitorings": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9-log":
        {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      "/project/settings": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
