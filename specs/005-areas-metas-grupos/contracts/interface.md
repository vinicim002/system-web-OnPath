# Contrato: interface de Áreas e metas

## Tela (`/areas`)

```text
┌──────────────────────────────┬──────────────────────────────────────────────┐
│ Áreas e metas  [+ Nova área] │ ● Trabalho                    [Arquivar área] │
│ ⠿ ● Faculdade   2 metas · 3  │ Nome [Trabalho______]  Tom ● ● ● ● ● ●  Salvar│
│ ⠿ ● Trabalho    1 meta  · 8  │                                              │
│ ⠿ ● Estudos                  │ Metas                         [+ Nova meta]   │
│ ⠿ ● Saúde                    │ ○ Fechar 3 clientes   até 30 de nov.         │
│ …                            │ ✓ Certificação (concluída)                   │
│ ▸ Arquivadas (1)             │                                              │
│                              │ Grupos                        [+ Novo grupo]  │
│                              │ Servioeste     1 de 1 ativo   [Editar]       │
│                              │ Zona Sul       1 de 1 ativo   [Editar]       │
│                              │ Coronel        0 de 1 ativo   [Editar]       │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Lista de áreas | Círculo do tom, nome e resumo (metas ativas e tarefas abertas). Alça para arrastar, também pelo teclado. Clique abre a área (`?area=id`). Sem área escolhida, abre a primeira |
| Nova área | Formulário com nome e tom; a área criada fica escolhida |
| Arquivadas | Seção recolhida no fim, com "Recuperar" |
| Área | Formulário de nome e tom, e "Arquivar área". Com itens ativos, um `AlertDialog` mostra as contagens. A última área mostra o erro |
| Metas | Lista na ordem do serviço; "Atrasada" quando for o caso. Clique edita (título, descrição, prazo). Menu de status: Concluir, Cancelar ou Reativar. Excluir com Desfazer |
| Grupos | Nome, "{ativos} de {limite} ativos" e "Acima do limite" quando for o caso. Editar nome e limite. Arquivar (recusado com projetos) |

## Textos (`src/i18n/pt-BR.ts`)

Chaves novas em `areas.*` (lista, formulário, tons, arquivar, confirmação com contagens,
arquivadas), `metas.*` (campos, status, atrasada, ações, avisos) e `grupos.*` (campos, vagas,
acima do limite, ações). Erros novos em `erros.*`.
