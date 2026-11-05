import type { KeyboardCoordinateGetter } from "@dnd-kit/core";

/**
 * Pelo teclado, as setas para os lados levam o cartão direto para o centro da coluna vizinha,
 * em vez de andar alguns pixels por vez.
 */
export const coordenadasEntreColunas: KeyboardCoordinateGetter = (evento, { context }) => {
  const { droppableRects, collisionRect } = context;
  if (!collisionRect || (evento.code !== "ArrowRight" && evento.code !== "ArrowLeft")) return undefined;
  evento.preventDefault();
  const colunas = [...droppableRects.values()].sort((a, b) => a.left - b.left);
  const centro = collisionRect.left + collisionRect.width / 2;
  const destino =
    evento.code === "ArrowRight"
      ? colunas.find((rect) => rect.left > centro)
      : [...colunas].reverse().find((rect) => rect.left + rect.width < centro);
  if (!destino) return undefined;
  return { x: destino.left + (destino.width - collisionRect.width) / 2, y: destino.top + 48 };
};
