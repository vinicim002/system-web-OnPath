# Plano de implementação: Base do front-end

**Branch**: `docs/versionar-documentos` | **Data**: 2026-11-05 | **Especificação**: [spec.md](./spec.md)

**Entrada**: especificação em `specs/001-base-front-end/spec.md`

## Resumo

A Etapa 0 cria o app web para computador (React com Vite), com:

- um menu lateral fixo e 9 telas vazias, com rotas próprias;
- um tema em preto e branco e um arquivo central de textos em português;
- uma camada de dados tipada.

As telas só conhecem os **contratos dos serviços**. A implementação local guarda cada coleção no
armazenamento do navegador e valida tudo com esquemas. Na Parte 2, ela será trocada por uma
implementação que chama a API, sem tocar nas telas.

No primeiro uso, os dados iniciais da seção 5 de `docs/spec.md` são criados uma única vez. Uma
trava entre abas e uma marca de controle impedem que sejam criados de novo. A tela Ajustes
exporta e importa uma cópia completa em JSON, que é validada por inteiro antes de substituir os
dados.

## Contexto técnico

**Linguagem/versão**: TypeScript em modo estrito, na versão estável atual.

> 2026-11-05: a primeira versão usou Expo. A interface foi refeita em React com Vite
> (constituição 1.1.0, `research.md`, item 13). A camada de dados, os textos, o tema e os testes
> foram mantidos. Depois, o estilo passou para Tailwind CSS com shadcn/ui (constituição 1.2.0,
> `research.md`, item 14).

**Dependências principais**:

| Dependência | Uso |
|---|---|
| React e Vite | O app e o servidor de desenvolvimento |
| React Router | Rotas, com endereço próprio para cada tela |
| TanStack Query | Cache e atualização das telas a partir dos serviços |
| Zod | Esquemas das entidades e validação da cópia de dados |
| `@fontsource/inter` | Fonte Inter, servida pelo próprio app |
| Tailwind CSS | Estilo, com a paleta do tema e sem a paleta padrão |
| shadcn/ui e lucide-react | Componentes acessíveis (botão, diálogo e outros) e ícones |

As versões são as estáveis no momento da instalação (`docs/plan.md`, seção 1).

**Armazenamento**: `localStorage` do navegador, por meio de um adaptador de armazenamento isolado.
O adaptador usa uma chave por coleção e uma chave de controle.

**Testes**: Vitest com o ambiente `jsdom`, para os serviços locais, os dados iniciais e a cópia
de dados. As telas são validadas pelos cenários de aceite e pelo `quickstart.md`.

**Plataforma-alvo**: navegadores atuais de computador, rodando em `http://localhost:8081`.

**Tipo de projeto**: app web de página única, com front-end apenas. O sistema web fica
preparado para a pasta `system-onPath-web-back/` da Parte 2.

**Metas de desempenho**: a troca de tela parece imediata (menos de 100 ms, sem recarregar a
página). Exportar e importar centenas de registros leva menos de 1 s.

**Restrições**:

- Não há API, banco nem login (constituição, princípio III).
- Toda leitura e escrita passa pelos serviços (princípio IV).
- Nenhum texto fica escrito nos componentes (princípio I).
- Nenhuma cor fica fora do tema (princípio V).
- O acesso direto às APIs do navegador (arquivos e travas) fica isolado em `src/plataforma/`.

**Escala/escopo**: 1 usuário, 9 telas e 16 entidades. O volume esperado é de milhares de
registros, abaixo do limite de cerca de 5 MB do armazenamento do navegador.

## Verificação da constituição

*Gate antes da Fase 0, verificado de novo depois da Fase 1.*

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Os artefatos estão em português. Todo texto de tela e de erro fica em `src/i18n/pt-BR.ts`, com chaves tipadas. Nomes de entidades e campos também são em português, como no `docs/plan.md` | ✅ |
| II. `docs/` como fonte oficial | As propostas confirmadas aqui e a pasta `src/dados/` são registradas no `docs/plan.md` antes do código (ver "Mudanças em `docs/`") | ✅ |
| III. Front-end primeiro | Não há API, banco nem login. A pasta `src/api/` não é criada nesta etapa | ✅ |
| IV. Serviços tipados | As telas usam só `useServicos()` e os hooks de consulta. Os contratos ficam em `src/dados/contratos.ts`, e a implementação local é injetada por um provedor | ✅ |
| V. Visual da seção 7 | As cores vêm de `src/theme/`: preto, branco e cinza, com o roxo reservado ao logo. A paleta padrão do Tailwind fica desligada. A fonte é a Inter | ✅ |

**Depois da Fase 1**: o design mantém todos os itens. Não há violação, por isso a seção de
complexidade foi removida.

## Mudanças em `docs/`

Aplicadas no `docs/plan.md` antes de qualquer código:

- **Seção 1:** TypeScript e TanStack Query passam de "Proposta" para "Decidido". Entram Zod para
  a validação na interface. Depois, com a troca de stack, entram React com Vite, React Router e
  Vitest no lugar de Expo, Expo Router e Jest.
- **Seção 4:** entram as pastas `src/dados/` e `src/plataforma/`. A pasta `src/api/` passa a ser a
  implementação dos contratos que chama a API, a partir da Parte 2.

## Estrutura do projeto

### Documentação (desta funcionalidade)

```text
specs/001-base-front-end/
├── plan.md              # Este arquivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   ├── servicos.md      # Contrato dos serviços usados pelas telas
│   ├── copia-dados.md   # Formato do arquivo exportado
│   └── rotas.md         # Telas, endereços e menu
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Código (`system-web-onPath/`)

```text
system-onPath-web-front/      # React com Vite
├── index.html
├── public/                   # Favicon
├── src/
│   ├── main.tsx              # Fonte, tema, provedores e rotas
│   ├── rotas.tsx             # Endereços das telas (React Router)
│   ├── telas/                # Hoje, Caixa, Tarefas, ..., Ajustes e NaoEncontrada
│   ├── components/           # Moldura, MenuLateral, TelaBase, Logo e PreparoPrimeiroUso
│   │   └── ui/               # Componentes do shadcn/ui (button, alert-dialog)
│   ├── lib/utils.ts          # cn(), que junta classes do Tailwind
│   ├── features/
│   │   └── ajustes/          # Exportar e importar (T005)
│   ├── dados/
│   │   ├── tipos.ts          # Esquemas Zod e tipos inferidos das entidades
│   │   ├── erros.ts          # ErroOnPath com código, mensagem e detalhes
│   │   ├── contratos.ts      # Interfaces dos serviços
│   │   ├── ServicosProvider.tsx
│   │   ├── consultas.ts      # Hooks do TanStack Query sobre os serviços
│   │   ├── iniciais.ts       # Dados da seção 5 do docs/spec.md
│   │   └── local/
│   │       ├── armazenamento.ts  # Adaptador sobre o localStorage
│   │       ├── colecao.ts        # CRUD genérico com arquivamento (RN31)
│   │       ├── servicos.ts       # Implementação local dos contratos
│   │       ├── carga.ts          # Criação única dos dados iniciais
│   │       └── copia.ts          # Exportação e importação
│   ├── plataforma/           # APIs do navegador: arquivos, trava entre abas e id
│   ├── i18n/
│   │   └── pt-BR.ts
│   └── theme/
│       ├── index.ts          # Cores usadas no código (logo e cores das áreas)
│       └── tema.css          # Tema do Tailwind: cores, fonte, tamanhos e espaçamento
├── __tests__/                # Testes Vitest dos serviços locais
├── vite.config.ts            # Vite e Vitest
├── package.json
└── tsconfig.json
```

**Decisão de estrutura**: segue a seção 4 de `docs/plan.md`. Dentro do repositório, a pasta
`system-web-onPath/` reúne o sistema web: documentos, Spec Kit, `system-onPath-web-front/` e
`system-onPath-web-back/`. O back, `scripts/` e o `docker-compose.yml` só ganham conteúdo na Parte 2.
Dentro de `system-onPath-web-front/src/`, a camada de dados fica em `dados/`, com os contratos separados da implementação
`local/`. Na T046, uma implementação `src/api/` cumpre os mesmos contratos e é trocada só no
`ServicosProvider`.
