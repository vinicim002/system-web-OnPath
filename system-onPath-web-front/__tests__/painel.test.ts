import { describe, expect, it } from "vitest";

import { lerCommit } from "@/features/painel/historico";
import { calcularAndamento, lerTarefas } from "@/features/painel/tarefas";

const TAREFAS = `# Tarefas

## Parte 1 — Front-end

### Etapa 0 — Base

- [x] **T001: Criar o repositório.** Crie as pastas.
  - Pronto quando: existirem as pastas.
- [x] **T002: Criar o app.** Configure o app.

### Etapa 1 — Caixa

- [ ] **T003: Construir a caixa.** Cubra a captura.
  - Pronto quando: anotar só com texto.
  - Observação que não é o critério.

## Parte 2 — Back-end

### Etapa 2 — API

- [ ] **T004: Criar a API base.**
`;

describe("painel: tarefas", () => {
  it("lê partes, etapas e tarefas", () => {
    const etapas = lerTarefas(TAREFAS);

    expect(etapas.map((etapa) => [etapa.parte, etapa.nome])).toEqual([
      ["Parte 1 — Front-end", "Etapa 0 — Base"],
      ["Parte 1 — Front-end", "Etapa 1 — Caixa"],
      ["Parte 2 — Back-end", "Etapa 2 — API"],
    ]);
    expect(etapas[0]!.tarefas[0]).toEqual({
      id: "T001",
      titulo: "Criar o repositório",
      descricao: "Crie as pastas.",
      prontoQuando: "existirem as pastas.",
      feita: true,
      etapa: "Etapa 0 — Base",
    });
    expect(etapas[1]!.tarefas[0]!.prontoQuando).toBe("anotar só com texto.");
    expect(etapas[2]!.tarefas[0]).toMatchObject({ id: "T004", titulo: "Criar a API base", descricao: "" });
  });

  it("calcula o andamento, a etapa atual e a próxima", () => {
    const andamento = calcularAndamento(lerTarefas(TAREFAS));
    expect(andamento.feitas).toBe(2);
    expect(andamento.total).toBe(4);
    expect(andamento.atual?.nome).toBe("Etapa 1 — Caixa");
    expect(andamento.proxima?.nome).toBe("Etapa 2 — API");
  });

  it("sem pendências, não há etapa atual", () => {
    const andamento = calcularAndamento(lerTarefas("### Etapa 0 — A\n\n- [x] **T001: Feita.**\n"));
    expect(andamento.atual).toBeNull();
    expect(andamento.proxima).toBeNull();
  });
});

describe("painel: histórico", () => {
  const commit = (mensagem: string) => lerCommit({ hash: "abc", data: "2026-11-05T12:00:00-03:00", mensagem });

  it("classifica pelos tipos dos Conventional Commits", () => {
    expect(commit("feat(front): anota na caixa").categoria).toBe("adicionado");
    expect(commit("fix: corrige a ordem").categoria).toBe("corrigido");
    expect(commit("refactor(front): troca o estilo").categoria).toBe("alterado");
    expect(commit("perf(front): deixa a lista leve").categoria).toBe("alterado");
    expect(commit("docs: adiciona o plano").categoria).toBe("documentacao");
    expect(commit("build(front): adiciona componentes").categoria).toBe("manutencao");
    expect(commit("revert: desfaz a troca").categoria).toBe("retirado");
  });

  it("descrição que começa com remove ou retira é retirada", () => {
    expect(commit("chore: remove o .gitignore antigo").categoria).toBe("retirado");
    expect(commit("refactor: retira o Expo").categoria).toBe("retirado");
  });

  it("lê escopo e mudança incompatível", () => {
    expect(commit("refactor(front)!: refaz a interface")).toMatchObject({
      escopo: "front",
      quebra: true,
      descricao: "refaz a interface",
    });
  });

  it("mensagem fora do padrão vira manutenção", () => {
    expect(commit("Initial commit")).toMatchObject({ categoria: "manutencao", descricao: "Initial commit" });
  });
});
