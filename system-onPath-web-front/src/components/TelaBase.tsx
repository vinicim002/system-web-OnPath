import type { ReactNode } from "react";

import estilos from "./TelaBase.module.css";

interface Props {
  titulo: string;
  children?: ReactNode;
}

export function TelaBase({ titulo, children }: Props) {
  return (
    <section className={estilos.tela}>
      <h1 className={estilos.titulo}>{titulo}</h1>
      {children}
    </section>
  );
}
