/** Barra de progresso em cinza e preto. */
export function Progresso({ feitas, total }: { feitas: number; total: number }) {
  const porcentagem = total === 0 ? 0 : Math.round((feitas / total) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={feitas}
      className="h-1.5 w-full overflow-hidden rounded-full bg-cinza-200"
    >
      <div className="h-full rounded-full bg-preto" style={{ width: `${porcentagem}%` }} />
    </div>
  );
}
