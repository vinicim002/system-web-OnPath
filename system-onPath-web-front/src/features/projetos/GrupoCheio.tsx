import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/i18n";

export interface Ocupante {
  id: string;
  nome: string;
}

interface Props {
  aberto: boolean;
  grupo: string;
  projeto: string;
  ocupantes: Ocupante[];
  ocupado: boolean;
  aoLiberar: (ocupanteId: string, status: "pausado" | "concluido") => void;
  aoFechar: () => void;
}

/** Recusa por grupo cheio: pausar ou concluir um ativo para abrir a vaga (RN07, FR-012). */
export function GrupoCheio({ aberto, grupo, projeto, ocupantes, ocupado, aoLiberar, aoFechar }: Props) {
  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projetos.grupoCheio.titulo", { grupo })}</DialogTitle>
          <DialogDescription>{t("projetos.grupoCheio.descricao", { projeto })}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {ocupantes.map((ocupante) => (
            <li key={ocupante.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
              <span className="min-w-0 flex-1 truncate">{ocupante.nome}</span>
              <Button size="sm" variant="outline" disabled={ocupado} onClick={() => aoLiberar(ocupante.id, "pausado")}>
                {t("projetos.acoes.pausado")}
              </Button>
              <Button size="sm" variant="outline" disabled={ocupado} onClick={() => aoLiberar(ocupante.id, "concluido")}>
                {t("projetos.acoes.concluido")}
              </Button>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={aoFechar}>
            {t("projetos.grupoCheio.fechar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
