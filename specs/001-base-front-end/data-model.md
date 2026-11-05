# Modelo de dados: Base do front-end

Segue a seção 6 de `docs/plan.md`, com os nomes em camelCase (ver `research.md`, item 9). Nesta
etapa, os serviços locais cobrem as 15 entidades de dados abaixo (a tabela `usuarios` fica para a
Parte 2), além da chave de controle.

## Campos comuns

Todo registro tem:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | Gerado pelo serviço |
| `criadoEm` | data ISO em UTC | Definido na criação |
| `atualizadoEm` | data ISO em UTC | Atualizado em toda alteração |
| `arquivadoEm` | data ISO em UTC ou `null` | Preenchido ao excluir (RN31). As listagens ignoram o item por padrão |

## Entidades

Campos com `?` são opcionais (`null`).

| Entidade (coleção) | Campos |
|---|---|
| Área (`areas`) | `nome`, `cor`, `ordem` |
| Meta (`metas`) | `areaId`, `titulo`, `descricao?`, `prazo?`, `status` |
| Grupo (`grupos`) | `areaId`, `nome`, `limiteAtivos` |
| Projeto (`projetos`) | `areaId`, `grupoId`, `metaId?`, `nome`, `descricao?`, `prazo?`, `prioridade`, `status`, `posicaoFila` |
| Coluna (`colunas`) | `projetoId`, `nome`, `ordem`, `final` |
| Tarefa (`tarefas`) | `areaId`, `projetoId?`, `materiaId?`, `colunaId?`, `tarefaPaiId?`, `titulo`, `prioridade`, `tempoEstimadoMin?`, `prazo?`, `status`, `concluidaEm?` |
| Item da caixa (`itensCaixa`) | `conteudo`, `status` |
| Item do dia (`itensDia`) | `tarefaId`, `data`, `ordem`, `resultado` |
| Rotina (`rotinas`) | `areaId`, `nome`, `tipo`, `diasSemana`, `horaInicio?`, `duracaoMin?`, `metaMin?` |
| Compromisso (`compromissos`) | `areaId`, `titulo`, `inicio`, `fim`, `local?` |
| Bloco de tempo (`blocosTempo`) | `tarefaId?`, `rotinaId?`, `sessaoEstudoId?`, `inicio`, `fim`, `status` |
| Matéria (`materias`) | `areaId`, `nome`, `descricao?`, `status` |
| Tópico (`topicos`) | `materiaId`, `nome`, `ordem` |
| Material (`materiais`) | `materiaId`, `topicoId?`, `tipo`, `titulo`, `conteudo?`, `url?` |
| Sessão de estudo (`sessoesEstudo`) | `materiaId`, `topicoId?`, `duracaoPlanejadaMin`, `duracaoRealMin?`, `anotacoes?`, `status` |

Os valores permitidos de `status`, `prioridade`, `tipo` e `resultado` são os da seção 6 de
`docs/plan.md`. Os formatos são estes:

- `diasSemana`: lista de números de 0 (domingo) a 6 (sábado).
- `horaInicio`: texto `HH:mm`.
- `data`: texto `AAAA-MM-DD`.

### Status das metas e matérias

Estes valores foram definidos neste plano e já estão registrados no `docs/plan.md`:

- metas: `ativa`, `concluida`, `cancelada`;
- matérias: `ativa`, `pausada`, `concluida`.

Eles podem mudar nas etapas 4 e 8, mas qualquer mudança vai primeiro para o `docs/plan.md`.

## Validações desta etapa

O esquema de cada entidade é validado em toda gravação e importação:

- Tipos e valores permitidos de cada campo.
- Referências (`areaId`, `grupoId` e as demais) apontam para registros existentes. A checagem é
  feita na importação.
- `projetos.areaId` é igual ao `areaId` do grupo (RN01). Por isso, o serviço preenche o
  `areaId` do projeto a partir do grupo.
- `grupos.limiteAtivos` é maior ou igual a 0.

As regras dos módulos (RN02, RN06 a RN08, RN09, RN24 e outras) entram nas tarefas próprias, a
partir da T007.

## Chave de controle (`meta`)

| Campo | Tipo | Uso |
|---|---|---|
| `versaoEsquema` | número | Versão do formato guardado (começa em 1) |
| `dadosIniciaisEm` | data ISO ou `null` | Quando os dados iniciais foram criados ou uma cópia foi importada. Se estiver preenchido, a carga não roda |
| `ultimaExportacaoEm` | data ISO ou `null` | Permite lembrar o usuário de exportar |

## Dados iniciais

Os dados vêm da seção 5 de `docs/spec.md`.

**Áreas** (`ordem` de 0 a 5, cada uma com um tom de cinza): Faculdade, Trabalho, Estudos, Saúde,
Pessoal e Finanças.

**Grupos**:

| Grupo | Área | Limite |
|---|---|---|
| Servioeste | Trabalho | 1 |
| Faculdade | Faculdade | 1 |
| Zona Sul | Trabalho | 1 |
| Coronel | Trabalho | 1 |
| Pessoal | Pessoal | 2 |

**Projetos**: a área de cada projeto vem do seu grupo. A prioridade é `media`, exceto a do Zona
Sul, que é `alta`. Nos projetos em `fila`, a `posicaoFila` segue a ordem da tabela dentro de cada
grupo: App do Edu é 1, App do Matheus é 2, App do RH é 3, CRO é 1 e App de seminário é 2. Nos
ativos, a `posicaoFila` é 0.

**Rotinas**: todas são do tipo `horario`, exceto a última.

| Nome | Área | Dias | Início | Duração |
|---|---|---|---|---|
| Acordar | Pessoal | seg a sex | 07:30 | — |
| Trabalho (manhã) | Trabalho | seg e qua | 08:00 | 240 min |
| Trabalho (manhã) | Trabalho | ter e qui | 09:00 | 180 min |
| Aula | Faculdade | sex | 08:00 | 240 min |
| Almoço | Saúde | seg a sex | 12:00 | 60 min |
| Trabalho (tarde) | Trabalho | seg a sex | 13:00 | 120 min |
| Academia | Saúde | seg a sex | 15:00 | 90 min |
| Trabalho (fim do dia) | Trabalho | seg e qua | 16:30 | 150 min |
| Trabalho (fim do dia) | Trabalho | ter e qui | 16:30 | 210 min |
| Trabalho (fim do dia) | Trabalho | sex | 16:30 | 240 min |
| Sono | Saúde | seg a sex | 23:00 | — |
| Estudo por conta própria | Estudos | seg a qui | — | meta em branco (`tipo` = `meta_horas`) |

Cada rotina guarda um único horário. Por isso, a grade de trabalho vira uma rotina para cada
combinação de horário e duração. As durações de Almoço e Academia vêm do intervalo até a
atividade seguinte. O fim de semana fica de fora, porque ainda está em aberto no `docs/spec.md`.
