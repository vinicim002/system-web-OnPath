# Guia de validação: Base do front-end

Roteiro para provar que a Etapa 0 funciona de ponta a ponta. Os detalhes estão em
[data-model.md](./data-model.md) e em [contracts/](./contracts/).

## Pré-requisitos

- Node.js LTS (testado com a 24) e npm.
- Um navegador atual no computador.

## Rodar

```bash
cd system-onPath-web-front
npm install
npm run web        # abre http://localhost:8081
npm test           # testes dos serviços locais
npm run typecheck  # TypeScript sem erros
```

## Cenários

### 1. Navegação (história 1, SC-001)

1. Abra `http://localhost:8081`. A tela Hoje aparece, marcada no menu.
2. Clique em cada um dos 9 itens. A tela certa abre, sem recarregar a página.
3. Digite `http://localhost:8081/rotinas`. A tela Rotinas abre direto.
4. Digite `http://localhost:8081/nao-existe`. A página de não encontrada aparece, com link para
   Hoje.
5. Confira o visual: só preto, branco e cinza, com a fonte Inter.

### 2. Dados iniciais (história 2, SC-003)

1. Em uma janela anônima, abra o app.
2. No console do navegador, rode
   `Object.keys(localStorage).filter(k => k.startsWith('onpath:'))`. Aparecem as chaves das
   coleções e a `onpath:v1:meta`.
3. Confira as quantidades: 6 áreas, 5 grupos, 10 projetos e 12 rotinas, como no `data-model.md`.
   Os testes automáticos também conferem.
4. Recarregue 10 vezes e abra uma segunda aba. As quantidades não mudam.

### 3. Cópia dos dados (história 3, SC-004, SC-005 e SC-007)

1. Em Ajustes, clique em **Exportar**. O arquivo `onpath-copia-AAAA-MM-DD.json` é baixado.
2. Abra outra janela anônima, vá a Ajustes, clique em **Importar** e escolha o arquivo. Confirme
   a substituição. Os dados ficam iguais aos exportados.
3. Tente importar um arquivo `.json` qualquer, como o `package.json`. A importação é recusada
   com uma mensagem clara, e os dados continuam iguais.

### 4. Regras da constituição (SC-002 e SC-006)

```bash
cd system-onPath-web-front
# Nenhuma tela importa a implementação local diretamente:
grep -rn "dados/local" app/ src/components src/features   # sem resultado
# Nenhuma cor literal fora do tema:
grep -rnE "#[0-9a-fA-F]{3,6}" app/ src/components src/features   # sem resultado
```

Os textos visíveis vêm de `src/i18n/pt-BR.ts`. Isso é conferido na revisão do código.

## Resultado esperado

Todos os cenários passam, os testes passam e o TypeScript não acusa erros.
