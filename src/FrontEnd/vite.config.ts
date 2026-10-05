/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Configuration du proxy dev pour éviter tout problème CORS avec le backend FastAPI (port 8000)
    proxy: {
      "/scope-monitorings": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/api/audit-log": {
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
    // Chaque fichier ouvre son propre jsdom. En `forks` (le défaut), cela
    // signifiait jusqu'à un processus node par cœur, et la suite se faisait tuer
    // par l'OOM sur une machine déjà chargée : l'échaillement venait d'un worker
    // mort, pas d'une régression. Les threads partagent un seul processus.
    pool: "threads",
  },
});
