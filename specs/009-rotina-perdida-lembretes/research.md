# Pesquisa: Rotina perdida, tempo livre e lembretes

## 1. Preferências

- **Decisão**: `src/dados/local/preferencias.ts` guarda `{ horaInicioDia, horaFimDia, lembretesAtivos }`
  na chave `onpath:preferencias`, com padrão 07:00, 23:00 e desativado, validado com Zod. Exposto como
  `servicos.preferencias` (`obter`, `alterar`).
- **Motivo**: o front não tem usuário; no servidor estes campos são do usuário (`PATCH /me`). Fica fora
  das coleções, como o modo escuro, e não entra na cópia de dados.

## 2. Rotina perdida (RN18)

- **Decisão**: `agenda.rotinasPerdidas(agora)` devolve os blocos de rotina não arquivados, planejados,
  do dia local de `agora`, com `fim <= agora`, cada um com `proposta: { inicio, fim } | null`.
- **Proposta**: procura de 30 em 30 minutos, a partir da próxima meia hora cheia, o primeiro intervalo
  com a mesma duração dentro da janela do dia que não sobrepõe blocos ativos nem compromissos; se
  hoje não couber, tenta amanhã desde o início da janela.
- **Ações**: `aceitarProposta(id, proposta)` confere o conflito de novo (`horario_ocupado`) e, numa
  escrita, põe o antigo como `remarcado` e cria o novo `planejado` da mesma rotina;
  `recusarProposta(id)` põe `perdido`; "Fiz" usa `marcarRealizado`.
- **Motivo**: limitar a hoje evita uma pilha de propostas depois de dias sem abrir o app. A renovação
  da janela de 14 dias não duplica, porque a chave é (rotina, início).

## 3. Tempo livre (RN10)

- **Decisão**: `agenda.tempoLivre(data)` devolve `{ janelaMin, ocupadoMin, livreMin }`: os intervalos
  de blocos de rotina ativos e compromissos do dia são cortados na janela e unidos antes de somar.
  Hoje compara com o `planejadoMin` que já existe.
- **Motivo**: fórmula do `docs/plan.md`; a união evita descontar duas vezes o que se sobrepõe.

## 4. Lembretes

- **Decisão**: `agenda.lembretesDevidos(agora, antecedenciaMin)` devolve compromissos e blocos
  planejados com `agora < inicio <= agora + antecedência`. Um componente `Lembretes` na moldura
  confere a cada 30 s (e ao voltar para a aba), mostra um toast e, com `Notification.permission ===
  "granted"`, uma notificação; os já avisados ficam em `onpath:lembretes-avisados` (id + início),
  limpos depois de um dia.
- **Motivo**: `docs/plan.md`: notificações do navegador com o app aberto. O toast cobre a permissão
  negada.

## 5. Testes

- Perdidas: só de hoje, só planejados e passados, proposta pula ocupados, respeita a janela, vai para
  amanhã, sem proposta; aceitar, recusar, conflito ao aceitar.
- Tempo livre: sobreposição unida, corte na janela, só blocos de rotina.
- Lembretes: intervalo da antecedência, ignora passados e realizados.
- Preferências: padrão, alteração e fim antes do início recusado.
