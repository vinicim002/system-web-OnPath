import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { cores } from "@/theme";

function coresDoCss(): Record<string, string> {
  const css = readFileSync(resolve(process.cwd(), "src/theme/tema.css"), "utf8");
  const encontradas: Record<string, string> = {};
  for (const [, nome, valor] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) {
    encontradas[nome!] = valor!.toUpperCase();
  }
  return encontradas;
}

function coresDoTs(): Record<string, string> {
  const esperadas: Record<string, string> = { preto: cores.preto, branco: cores.branco, roxo: cores.roxo };
  for (const [tom, valor] of Object.entries(cores.cinza)) esperadas[`cinza-${tom}`] = valor;
  return esperadas;
}

describe("tema", () => {
  it("tema.css e index.ts têm as mesmas cores", () => {
    expect(coresDoCss()).toEqual(coresDoTs());
  });
});
