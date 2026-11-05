/**
 * Documentos do projeto, lidos direto dos arquivos (só no modo de desenvolvimento).
 * Os caminhos partem de system-web-onPath/.
 */
const arquivos = import.meta.glob(
  [
    "../../../../docs/*.md",
    "../../../../specs/**/*.md",
    "../../../../.specify/memory/constitution.md",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

export interface Documento {
  caminho: string;
  grupo: string;
  nome: string;
  conteudo: string;
}

const PREFIXO = "../../../../";

function grupoDe(caminho: string): string {
  if (caminho.startsWith("docs/")) return "docs";
  if (caminho.startsWith(".specify/")) return "constituição";
  const partes = caminho.split("/");
  return partes.slice(0, 2).join("/");
}

export const documentos: Documento[] = Object.entries(arquivos)
  .map(([chave, conteudo]) => {
    const caminho = chave.replace(PREFIXO, "");
    const grupo = grupoDe(caminho);
    const nome = caminho.split("/").slice(grupo === "constituição" ? -1 : grupo.split("/").length).join("/");
    return { caminho, grupo, nome, conteudo };
  })
  .sort((a, b) => a.caminho.localeCompare(b.caminho));

export function documento(caminho: string): Documento | undefined {
  return documentos.find((doc) => doc.caminho === caminho);
}
