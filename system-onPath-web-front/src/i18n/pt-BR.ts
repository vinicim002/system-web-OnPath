export const ptBR = {
  app: {
    nome: "OnPath",
  },
  menu: {
    hoje: "Hoje",
    caixa: "Caixa de entrada",
    tarefas: "Tarefas",
    projetos: "Projetos",
    areas: "Áreas e metas",
    agenda: "Agenda",
    rotinas: "Rotinas",
    estudos: "Estudos",
    ajustes: "Ajustes",
  },
  telas: {
    hoje: { titulo: "Hoje" },
    caixa: { titulo: "Caixa de entrada" },
    tarefas: { titulo: "Tarefas" },
    projetos: { titulo: "Projetos" },
    areas: { titulo: "Áreas e metas" },
    agenda: { titulo: "Agenda" },
    rotinas: { titulo: "Rotinas" },
    estudos: { titulo: "Estudos" },
    ajustes: { titulo: "Ajustes" },
  },
  carregando: "Preparando seus dados…",
  naoEncontrada: {
    titulo: "Página não encontrada",
    mensagem: "O endereço digitado não existe no OnPath.",
    voltar: "Voltar para Hoje",
  },
  ajustes: {
    copia: {
      titulo: "Cópia dos dados",
      descricao:
        "Os dados ficam só neste navegador. Exporte uma cópia com frequência para não perdê-los.",
      exportar: "Exportar",
      importar: "Importar",
      exportando: "Exportando…",
      importando: "Importando…",
      exportado: "Cópia exportada.",
      confirmarSubstituir:
        "A importação substitui todos os dados atuais pelos da cópia. Deseja continuar?",
      confirmar: "Substituir dados",
      cancelar: "Cancelar",
      importado: "Cópia importada: {registros} registros.",
    },
  },
  erros: {
    nao_encontrado: "O item procurado não existe ou foi removido. Atualize a página e tente de novo.",
    dados_invalidos: "Alguns campos estão inválidos. Confira os dados e tente de novo.",
    copia_invalida:
      "O arquivo não é uma cópia válida do OnPath. Escolha um arquivo exportado pela tela Ajustes.",
    copia_versao_desconhecida:
      "A cópia foi feita por uma versão mais nova do OnPath. Atualize o app e tente de novo.",
    copia_referencia_quebrada:
      "A cópia tem registros que apontam para itens ausentes. Exporte uma nova cópia e tente de novo.",
    armazenamento_indisponivel:
      "O navegador não permitiu gravar os dados, por bloqueio ou falta de espaço.",
    acao: {
      liberarArmazenamento: "Libere o armazenamento deste site no navegador e recarregue a página.",
    },
  },
} as const;

export type Textos = typeof ptBR;
