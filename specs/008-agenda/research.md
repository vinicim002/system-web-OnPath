# Pesquisa: Agenda, blocos e rotinas

## 1. Horário local e UTC

- **Decisão**: `instanteLocal(data, hora)` converte uma data AAAA-MM-DD e uma hora HH:mm do fuso
  `America/Sao_Paulo` para o instante ISO em UTC, descobrindo o deslocamento do fuso naquela data
  com `Intl.DateTimeFormat` (`timeZoneName: "longOffset"`). O caminho inverso (`dataLocal`,
  `horaLocal`) usa o mesmo fuso. Ficam em `src/i18n/datas.ts`, junto de `hoje()`.
- **Motivo**: `docs/spec.md`, seção 7: guardar em UTC, mostrar no fuso do usuário. Não depende de o
  fuso ter horário de verão ou não.

## 2. Conflitos (RN09)

- **Decisão**: um serviço `ServicoAgenda` cuida de blocos e compromissos juntos, porque a regra de
  conflito vale entre os dois:
  - `listarNoIntervalo(inicio, fim)`: blocos ativos (não arquivados, status `planejado` ou
    `realizado`) e compromissos não arquivados que tocam o intervalo.
  - `criarBloco`, `alterarBloco`, `criarCompromisso`, `alterarCompromisso` recebem
    `{ confirmarConflito?: boolean }`. Sem confirmação, uma sobreposição dá o erro novo
    `horario_ocupado` com `ocupantes` (tipo, id, título, início e fim).
  - Sobreposição: `a.inicio < b.fim && b.inicio < a.fim` (encostar não conflita).
- **Motivo**: o mesmo padrão de confirmação no serviço (`subtarefas_abertas`, `area_com_itens`), e a
  API da Parte 2 faz o mesmo com `confirmar_conflito`.

## 3. Geração de blocos das rotinas (RN28)

- **Decisão**: `rotinas.renovarBlocos(hoje)`: para cada rotina ativa com `tipo = horario`,
  `horaInicio` e `duracaoMin`, cria os blocos dos dias da semana escolhidos de hoje até hoje + 13,
  pulando os que já existem para a mesma rotina e o mesmo início. Não confere conflito.
- **Quando**: ao abrir o app (na moldura) e na virada do dia (`useHoje`).
- **Alterar ou arquivar**: `rotinas.alterar`/`excluir` removem os blocos daquela rotina com
  `inicio >= agora` e `status = planejado` e, se a rotina continuar ativa, geram de novo — tudo numa
  escrita. Blocos passados ou realizados ficam. Desfazer o arquivamento (`recuperar`) gera de novo.
- **Soma da meta**: `rotinas.totalDoDia(rotinaId, data)` soma os minutos dos blocos planejados e
  realizados da rotina naquele dia.

## 4. Telas

- **Agenda (`/agenda`)**: grade semanal feita à mão com CSS grid (como previsto no `docs/plan.md`,
  sem FullCalendar): 7 colunas, horas das 6h às 24h, 48 px por hora. Blocos e compromissos ficam
  posicionados por `top` e `height` em minutos. Itens sobrepostos dividem a largura da coluna.
  Semana no endereço (`?semana=AAAA-MM-DD`, a segunda-feira).
- **Criar**: clicar num horário vazio abre um diálogo com abas "Compromisso" e "Bloco", com o dia e a
  hora já preenchidos (meia hora arredondada). Conflito abre a confirmação com os ocupantes.
- **Detalhe**: clicar num item abre um popover/diálogo com as ações (editar compromisso, arquivar,
  marcar bloco como realizado, excluir bloco).
- **Rotinas (`/rotinas`)**: lista em duas seções, formulário em diálogo.

## 5. Testes

- Datas: `instanteLocal` e volta.
- Agenda: sobreposição, `horario_ocupado` com ocupantes, confirmação grava, encostar não conflita,
  validações (fim depois do início, mesmo dia, exatamente um alvo, tarefa aberta), listar no
  intervalo, marcar realizado.
- Rotinas: validações por tipo, renovar sem duplicar, 14 dias, dias da semana, alterar refaz só os
  futuros planejados, arquivar remove os futuros e recuperar gera de novo, total do dia da meta.
