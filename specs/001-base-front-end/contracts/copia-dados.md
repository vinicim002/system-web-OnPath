# Contrato: arquivo de cópia dos dados

O arquivo é gerado pela exportação (FR-020) e lido pela importação (FR-021). Na T047, ele também
será lido para levar os dados ao PostgreSQL. Por isso, o formato é versionado.

## Nome do arquivo

`onpath-copia-AAAA-MM-DD.json`, com a data local da exportação.

## Formato (versão 1)

```json
{
  "formato": "onpath-copia",
  "versao": 1,
  "exportadoEm": "2026-11-05T18:30:00.000Z",
  "colecoes": {
    "areas": [
      {
        "id": "4f1c…",
        "nome": "Trabalho",
        "cor": "#525252",
        "ordem": 1,
        "criadoEm": "2026-11-05T15:00:00.000Z",
        "atualizadoEm": "2026-11-05T15:00:00.000Z",
        "arquivadoEm": null
      }
    ],
    "metas": [],
    "grupos": [],
    "projetos": [],
    "colunas": [],
    "tarefas": [],
    "itensCaixa": [],
    "itensDia": [],
    "rotinas": [],
    "compromissos": [],
    "blocosTempo": [],
    "materias": [],
    "topicos": [],
    "materiais": [],
    "sessoesEstudo": []
  }
}
```

## Regras

- `formato` precisa ser exatamente `"onpath-copia"`.
- `versao` precisa ser um inteiro de 1 até a versão atual. Uma versão antiga é convertida antes
  de importar, e uma versão mais nova é recusada.
- As 15 coleções precisam existir, mesmo vazias.
- Cada registro segue o esquema da sua entidade em `data-model.md`, inclusive os arquivados.
- Todas as referências entre registros apontam para um `id` presente na própria cópia.
- A importação é tudo ou nada: se alguma regra falhar, nenhum dado é alterado.
- Depois de importar, a chave de controle recebe `dadosIniciaisEm` com a data da importação.
  Assim, os dados iniciais não são criados por cima (FR-023).
