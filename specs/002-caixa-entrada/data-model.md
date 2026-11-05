# Modelo de dados: Caixa de entrada

Esta etapa não cria entidades nem campos. Ela usa a coleção `itensCaixa`, que já existe desde a
feature 001 (`src/dados/tipos.ts` e `docs/plan.md`, seção 6).

## Item da caixa (`itensCaixa`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | Gerado ao criar |
| `conteudo` | texto | Obrigatório. Os espaços nas pontas são removidos, e texto vazio é recusado (FR-004). Quebras de linha são mantidas |
| `status` | `novo`, `processado` ou `descartado` | Começa em `novo` |
| `criadoEm` | data e hora (UTC) | Define a ordem da lista principal |
| `atualizadoEm` | data e hora (UTC) | Muda em toda alteração |
| `arquivadoEm` | data e hora (UTC) ou vazio | Preenchido só quando descartado. É a data do descarte |

Não há campos de data, área ou prioridade (RN03 e RN24).

## Situações

```text
          capturar
             │
             ▼
   ┌──────────────────┐   descartar (ou excluir)   ┌──────────────────────┐
   │ novo             │ ─────────────────────────▶ │ descartado           │
   │ arquivadoEm: —   │ ◀───────────────────────── │ arquivadoEm: data    │
   └──────────────────┘   recuperar (ou desfazer)  └──────────────────────┘
             │
             ▼ (T010, fora desta etapa)
        processado
```

- **Invariante**: `status = descartado` se, e somente se, `arquivadoEm` estiver preenchido.
  O serviço grava os dois campos na mesma escrita.
- Descartar um item já descartado, ou recuperar um item novo, não muda nada e não dá erro.
- Editar o texto só é oferecido na tela para itens novos.

## Listas

| Lista | Itens | Ordem |
|---|---|---|
| Caixa (principal) | `status = novo` e `arquivadoEm` vazio | `criadoEm`, do mais novo para o mais antigo |
| Descartados | `status = descartado` | `arquivadoEm`, do mais recente para o mais antigo |
| Contador do menu | o mesmo da lista principal | — |

Como a ordem da lista principal segue a data de criação, um item que volta da lista de
descartados (ou por "Desfazer") reaparece na mesma posição de antes (história 2, cenário 2).

## Cópia de dados

Nada muda na cópia: os itens descartados já entram nela, por serem registros arquivados da
coleção (FR-015 e FR-020 da feature 001).
