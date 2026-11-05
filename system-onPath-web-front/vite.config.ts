import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const PASTA_SISTEMA = fileURLToPath(new URL("..", import.meta.url));

/**
 * Painel do projeto (só em desenvolvimento): devolve o histórico do git em
 * /__onpath/historico, lido a cada pedido para mostrar sempre os commits mais novos.
 */
function historicoGit(): Plugin {
  return {
    name: "onpath-historico-git",
    apply: "serve",
    configureServer(servidor) {
      servidor.middlewares.use("/__onpath/historico", (_pedido, resposta) => {
        execFile(
          "git",
          ["log", "-n", "500", "--date=iso-strict", "--pretty=format:%H%x1f%ad%x1f%s%x1e"],
          { cwd: PASTA_SISTEMA, maxBuffer: 10 * 1024 * 1024 },
          (erro, saida) => {
            resposta.setHeader("Content-Type", "application/json; charset=utf-8");
            if (erro) {
              resposta.statusCode = 500;
              resposta.end("[]");
              return;
            }
            const commits = saida
              .split("\x1e")
              .map((linha) => linha.trim())
              .filter(Boolean)
              .map((linha) => {
                const [hash, data, mensagem] = linha.split("\x1f");
                return { hash, data, mensagem };
              });
            resposta.end(JSON.stringify(commits));
          },
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), historicoGit()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    // O painel lê docs/ e specs/, que ficam fora da pasta do front.
    fs: { allow: [PASTA_SISTEMA] },
  },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: "jsdom",
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["./__tests__/configuracao.ts"],
  },
});
