/** Lê o docs/tasks.md e devolve as partes, etapas e tarefas com o que já foi feito. */

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prontoQuando: string | null;
  feita: boolean;
  etapa: string;
}

export interface Etapa {
  nome: string;
  parte: string;
  tarefas: Tarefa[];
}

const PARTE = /^## (Parte .+)$/;
const ETAPA = /^### (Etapa .+)$/;
const TAREFA = /^- \[( |x|X)\] \*\*(T\d+): (.+?)\*\*\s*(.*)$/;
const PRONTO = /^\s+- Pronto quando: (.+)$/;

export function lerTarefas(markdown: string): Etapa[] {
  const etapas: Etapa[] = [];
  let parte = "";
  let atual: Etapa | null = null;
  let ultima: Tarefa | null = null;

  for (const linha of markdown.split("\n")) {
    const parteEncontrada = PARTE.exec(linha);
    if (parteEncontrada) {
      parte = parteEncontrada[1]!;
      atual = null;
      continue;
    }
    const etapaEncontrada = ETAPA.exec(linha);
    if (etapaEncontrada) {
      atual = { nome: etapaEncontrada[1]!, parte, tarefas: [] };
      etapas.push(atual);
      continue;
    }
    const tarefaEncontrada = TAREFA.exec(linha);
    if (tarefaEncontrada && atual) {
      ultima = {
        id: tarefaEncontrada[2]!,
        titulo: tarefaEncontrada[3]!.replace(/\.$/, ""),
        descricao: tarefaEncontrada[4]!.trim(),
        prontoQuando: null,
        feita: tarefaEncontrada[1] !== " ",
        etapa: atual.nome,
      };
      atual.tarefas.push(ultima);
      continue;
    }
    const prontoEncontrado = PRONTO.exec(linha);
    if (prontoEncontrado && ultima) ultima.prontoQuando = prontoEncontrado[1]!;
  }
  return etapas.filter((etapa) => etapa.tarefas.length > 0);
}

export interface Andamento {
  feitas: number;
  total: number;
  /** Primeira etapa com tarefa pendente. */
  atual: Etapa | null;
  /** Etapa seguinte à atual. */
  proxima: Etapa | null;
}

export function calcularAndamento(etapas: Etapa[]): Andamento {
  const tarefas = etapas.flatMap((etapa) => etapa.tarefas);
  const indiceAtual = etapas.findIndex((etapa) => etapa.tarefas.some((tarefa) => !tarefa.feita));
  return {
    feitas: tarefas.filter((tarefa) => tarefa.feita).length,
    total: tarefas.length,
    atual: indiceAtual === -1 ? null : etapas[indiceAtual]!,
    proxima: indiceAtual === -1 ? null : (etapas[indiceAtual + 1] ?? null),
  };
}
