/**
 * Executa `fn` com uma trava exclusiva entre abas (Web Locks API). Sem suporte a travas, executa
 * direto: cada aba roda um código por vez e o localStorage responde na hora.
 */
export async function comTrava<R>(nome: string, fn: () => R | Promise<R>): Promise<R> {
  const travas = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (travas?.request) {
    return travas.request(nome, () => fn()) as Promise<R>;
  }
  return fn();
}
