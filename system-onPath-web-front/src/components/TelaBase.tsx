import type { ReactNode } from "react";

interface Props {
  titulo: string;
  children?: ReactNode;
}

export function TelaBase({ titulo, children }: Props) {
  return (
    <section className="flex flex-col gap-6 px-10 py-8">
      <h1 className="text-titulo font-semibold">{titulo}</h1>
      {children}
    </section>
  );
}
