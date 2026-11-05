export const ptBR = {
  app: {
    nome: "OnPath",
  },
  comum: {
    fechar: "Fechar",
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
    anotar: "Anotar",
    painel: "Painel do projeto",
    sair: "Sair",
    itensNovos: "{quantidade} itens novos",
  },
  caixa: {
    campo: "Anote uma ideia…",
    dicaCampo: "Enter para salvar · Shift+Enter para nova linha",
    abas: {
      caixa: "Caixa",
      descartados: "Descartados",
    },
    vazia: "Nada por aqui. Anote qualquer ideia que surgir, sem se preocupar com data, área ou prioridade. Você organiza depois.",
    descartadosVazia: "Nenhum item descartado.",
    descartadoEm: "Descartado em {data}",
    editar: "Editar",
    descartar: "Descartar",
    recuperar: "Recuperar",
    dicaEdicao: "Enter para salvar · Esc para cancelar",
    avisos: {
      descartado: "Item descartado",
      desfazer: "Desfazer",
      recuperado: "Item recuperado",
      anotado: "Anotado na caixa",
    },
    rapida: {
      titulo: "Anotar na caixa",
      dica: "Enter para salvar · Esc para fechar",
    },
  },
  login: {
    titulo: "Entrar no OnPath",
    subtitulo: "Organize o que fazer agora.",
    email: "E-mail",
    senha: "Senha",
    entrar: "Entrar",
    ou: "ou",
    acessoRapido: "Acesso rápido",
    aviso: "Tela de demonstração: o login de verdade chega na Parte 2. Qualquer e-mail válido entra.",
    erros: {
      email: "Digite um e-mail válido, como nome@exemplo.com.",
      senha: "Digite a senha.",
    },
  },
  painel: {
    titulo: "Painel do projeto",
    descricao: "Visível só no modo de desenvolvimento. Os dados vêm de docs/, specs/ e do histórico do git.",
    abas: {
      visao: "Visão geral",
      board: "Board",
      historico: "Histórico",
      documentos: "Documentos",
    },
    visao: {
      objetivo: "O que é o projeto",
      andamento: "Andamento",
      tarefasFeitas: "{feitas} de {total} tarefas feitas",
      etapaAtual: "Etapa atual",
      proximaEtapa: "Próxima etapa",
      etapas: "Etapas",
      semEtapa: "Todas as etapas foram concluídas.",
    },
    board: {
      aFazer: "A fazer",
      etapaAtual: "Etapa atual",
      feito: "Feito",
      prontoQuando: "Pronto quando",
    },
    historico: {
      todos: "Todos",
      vazio: "Nenhum commit encontrado.",
      erro: "Não foi possível ler o histórico do git. Confira se o servidor está rodando com npm run dev.",
      categorias: {
        adicionado: "Adicionado",
        alterado: "Alterado",
        corrigido: "Corrigido",
        retirado: "Retirado",
        documentacao: "Documentação",
        manutencao: "Manutenção",
      },
      quebra: "Mudança incompatível",
    },
    documentos: {
      escolha: "Escolha um documento.",
    },
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
      tituloSubstituir: "Substituir os dados atuais?",
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
