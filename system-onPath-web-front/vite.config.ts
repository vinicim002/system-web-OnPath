import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 8081, strictPort: true },
  preview: { port: 8081, strictPort: true },
  test: {
    environment: "jsdom",
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["./__tests__/configuracao.ts"],
  },
});
