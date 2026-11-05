import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  /** Salva o texto já sem espaços nas pontas. Devolve `true` se deu certo. */
  aoSalvar: (conteudo: string) => Promise<boolean>;
  /** Com esta função, Esc e salvar vazio cancelam (usado na edição). */
  aoCancelar?: () => void;
  valorInicial?: string;
  /** Na captura, o campo fica vazio depois de salvar. Na edição, não. */
  limparAoSalvar?: boolean;
  focarAoMontar?: boolean;
  placeholder?: string;
  rotulo: string;
  dica?: string;
  className?: string;
}

/** Área de texto da caixa: Enter salva, Shift+Enter quebra a linha (research.md, item 7). */
export function CampoAnotacao({
  aoSalvar,
  aoCancelar,
  valorInicial = "",
  limparAoSalvar = true,
  focarAoMontar = false,
  placeholder,
  rotulo,
  dica,
  className,
}: Props) {
  const [texto, setTexto] = useState(valorInicial);
  const [salvando, setSalvando] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);

  // Foco ao abrir, com o cursor no fim do texto (útil na edição).
  useEffect(() => {
    const elemento = campo.current;
    if (!focarAoMontar || !elemento) return;
    elemento.focus();
    elemento.setSelectionRange(elemento.value.length, elemento.value.length);
  }, [focarAoMontar]);

  async function salvar() {
    const conteudo = texto.trim();
    if (conteudo === "") {
      aoCancelar?.();
      return;
    }
    setSalvando(true);
    const deuCerto = await aoSalvar(conteudo);
    setSalvando(false);
    if (deuCerto && limparAoSalvar) setTexto("");
    campo.current?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Escape" && aoCancelar) {
      evento.preventDefault();
      evento.stopPropagation();
      aoCancelar();
      return;
    }
    if (evento.key !== "Enter" || evento.shiftKey || evento.nativeEvent.isComposing) return;
    evento.preventDefault();
    if (!salvando) void salvar();
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Textarea
        ref={campo}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={aoTeclar}
        aria-label={rotulo}
        placeholder={placeholder}
        rows={1}
        className="min-h-10 resize-none text-normal"
      />
      {dica && <p className="text-pequeno text-cinza-500">{dica}</p>}
    </div>
  );
}
