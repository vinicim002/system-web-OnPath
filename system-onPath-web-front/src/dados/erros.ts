import { t } from "@/i18n";

export type CodigoErro =
  | "nao_encontrado"
  | "dados_invalidos"
  | "copia_invalida"
  | "copia_versao_desconhecida"
  | "copia_referencia_quebrada"
  | "armazenamento_indisponivel"
  | "ciclo_subtarefa"
  | "subtarefas_abertas"
  | "item_indisponivel"
  | "data_passada"
  | "nao_e_pendencia"
  | "nome_repetido"
  | "area_com_itens"
  | "ultima_area"
  | "grupo_com_projetos"
  | "grupo_cheio"
  | "sem_proxima_acao"
  | "transicao_invalida"
  | "horario_ocupado";

export class ErroOnPath extends Error {
  readonly codigo: CodigoErro;
  readonly mensagem: string;
  readonly detalhes: Record<string, unknown>;

  constructor(codigo: CodigoErro, mensagem: string, detalhes: Record<string, unknown> = {}) {
    super(mensagem);
    this.name = "ErroOnPath";
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.detalhes = detalhes;
  }
}

export function criarErro(codigo: CodigoErro, detalhes?: Record<string, unknown>): ErroOnPath {
  return new ErroOnPath(codigo, t(`erros.${codigo}`), detalhes);
}

export function ehErroOnPath(erro: unknown): erro is ErroOnPath {
  return erro instanceof ErroOnPath;
}
