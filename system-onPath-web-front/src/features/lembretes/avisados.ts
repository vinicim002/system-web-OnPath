/** Itens já avisados, para cada um ter um lembrete só, mesmo recarregando a página. */
const CHAVE = "onpath:lembretes-avisados";
const UM_DIA = 24 * 60 * 60 * 1000;

function ler(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** Marca o item como avisado e diz se é a primeira vez. Entradas com mais de um dia são limpas. */
export function avisarUmaVez(id: string, inicio: string, agora = Date.now()): boolean {
  const avisados = ler();
  const chave = `${id}@${inicio}`;
  if (chave in avisados) return false;
  const recentes = Object.fromEntries(Object.entries(avisados).filter(([, quando]) => agora - Date.parse(quando) < UM_DIA));
  recentes[chave] = new Date(agora).toISOString();
  try {
    localStorage.setItem(CHAVE, JSON.stringify(recentes));
  } catch {
    // Sem armazenamento, o aviso ainda aparece; só pode se repetir ao recarregar.
  }
  return true;
}
