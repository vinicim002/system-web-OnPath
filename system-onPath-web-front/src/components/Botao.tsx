import estilos from "./Botao.module.css";

interface Props {
  rotulo: string;
  aoClicar: () => void;
  variante?: "principal" | "secundario";
  desativado?: boolean;
}

export function Botao({ rotulo, aoClicar, variante = "secundario", desativado = false }: Props) {
  return (
    <button
      type="button"
      className={`${estilos.botao} ${estilos[variante]}`}
      onClick={aoClicar}
      disabled={desativado}
    >
      {rotulo}
    </button>
  );
}
