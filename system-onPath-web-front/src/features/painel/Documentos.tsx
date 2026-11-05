import { useState } from "react";

import { cn } from "@/lib/utils";

import { documento, documentos } from "./documentos";
import { Markdown } from "./Markdown";

const GRUPOS = [...new Set(documentos.map((doc) => doc.grupo))];

/** spec, plan, tasks, constituição e os documentos de cada feature em specs/. */
export function Documentos() {
  const [caminho, setCaminho] = useState("docs/spec.md");
  const atual = documento(caminho);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <nav className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
        {GRUPOS.map((grupo) => (
          <div key={grupo} className="flex flex-col gap-0.5">
            <p className="px-2 text-pequeno font-medium text-cinza-500">{grupo}</p>
            {documentos
              .filter((doc) => doc.grupo === grupo)
              .map((doc) => (
                <button
                  key={doc.caminho}
                  type="button"
                  onClick={() => setCaminho(doc.caminho)}
                  aria-current={doc.caminho === caminho ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2 py-1 text-left text-pequeno text-cinza-700 hover:bg-cinza-100",
                    doc.caminho === caminho && "bg-cinza-200 font-medium text-preto",
                  )}
                >
                  {doc.nome}
                </button>
              ))}
          </div>
        ))}
      </nav>
      <article className="min-w-0">{atual && <Markdown conteudo={atual.conteudo} />}</article>
    </div>
  );
}
