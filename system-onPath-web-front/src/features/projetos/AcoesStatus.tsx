import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCriarTarefa, useMudarStatusProjeto } from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import { TRANSICOES } from "@/dados/regrasProjetos";
import type { Projeto, StatusProjeto } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

import { GrupoCheio, type Ocupante } from "./GrupoCheio";
import { ProximaAcao, type ValoresProximaAcao } from "./ProximaAcao";

interface Props {
  projeto: Pick<Projeto, "id" | "nome" | "status" | "prioridade" | "areaId">;
  grupo: string;
  tamanho?: "xs" | "sm";
}

type Recusa = { tipo: "grupoCheio"; ocupantes: Ocupante[] } | { tipo: "proximaAcao" } | null;

/** Botões das mudanças de status permitidas, resolvendo as recusas de ativação (FR-007, FR-012 e FR-013). */
export function AcoesStatus({ projeto, grupo, tamanho = "xs" }: Props) {
  const mudar = useMudarStatusProjeto();
  const criarTarefa = useCriarTarefa();
  const [recusa, setRecusa] = useState<Recusa>(null);

  async function aplicar(status: StatusProjeto, id = projeto.id, nome = projeto.nome): Promise<boolean> {
    try {
      await mudar.mutateAsync({ id, status });
      toast(t("projetos.avisos.status", { projeto: nome, status: t(`projetos.status.${status}`) }));
      return true;
    } catch (erro) {
      if (id === projeto.id && status === "ativo" && ehErroOnPath(erro)) {
        if (erro.codigo === "grupo_cheio") {
          setRecusa({ tipo: "grupoCheio", ocupantes: erro.detalhes.ocupantes as Ocupante[] });
          return false;
        }
        if (erro.codigo === "sem_proxima_acao") {
          setRecusa({ tipo: "proximaAcao" });
          return false;
        }
      }
      avisarErro(erro);
      return false;
    }
  }

  async function aoLiberar(ocupanteId: string, status: "pausado" | "concluido") {
    const ocupante = recusa?.tipo === "grupoCheio" ? recusa.ocupantes.find((o) => o.id === ocupanteId) : undefined;
    setRecusa(null);
    if (await aplicar(status, ocupanteId, ocupante?.nome)) await aplicar("ativo");
  }

  async function aoCriarProximaAcao(valores: ValoresProximaAcao) {
    try {
      await criarTarefa.mutateAsync({
        titulo: valores.titulo,
        areaId: projeto.areaId,
        projetoId: projeto.id,
        prioridade: valores.prioridade,
        tempoEstimadoMin: Number(valores.tempoEstimadoMin),
        status: "aberta",
      });
      setRecusa(null);
      await aplicar("ativo");
    } catch (erro) {
      avisarErro(erro);
    }
  }

  const reabrir = projeto.status === "concluido" || projeto.status === "cancelado";

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {TRANSICOES[projeto.status].map((status) => (
          <Button
            key={status}
            size={tamanho}
            variant={status === "ativo" ? "outline" : "ghost"}
            disabled={mudar.isPending}
            onClick={() => void aplicar(status)}
          >
            {reabrir && status === "fila" ? t("projetos.acoes.reabrir") : t(`projetos.acoes.${status}`)}
          </Button>
        ))}
      </div>
      {recusa?.tipo === "grupoCheio" && (
        <GrupoCheio
          aberto
          grupo={grupo}
          projeto={projeto.nome}
          ocupantes={recusa.ocupantes}
          ocupado={mudar.isPending}
          aoLiberar={(id, status) => void aoLiberar(id, status)}
          aoFechar={() => setRecusa(null)}
        />
      )}
      {recusa?.tipo === "proximaAcao" && (
        <ProximaAcao
          aberto
          projeto={projeto.nome}
          prioridade={projeto.prioridade}
          aoCriar={aoCriarProximaAcao}
          aoFechar={() => setRecusa(null)}
        />
      )}
    </>
  );
}
