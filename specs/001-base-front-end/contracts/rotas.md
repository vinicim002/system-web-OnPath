# Contrato: telas, endereços e menu

O menu lateral mostra os itens nesta ordem (FR-003). Os rótulos vêm de `src/i18n/pt-BR.ts`, e os
endereços são definidos em `system-onPath-web-front/src/rotas.tsx`.

| Ordem | Rótulo | Endereço | Tela |
|---|---|---|---|
| 1 | Hoje | `/` | `system-onPath-web-front/src/telas/Hoje.tsx` |
| 2 | Caixa de entrada | `/caixa` | `system-onPath-web-front/src/telas/Caixa.tsx` |
| 3 | Tarefas | `/tarefas` | `system-onPath-web-front/src/telas/Tarefas.tsx` |
| 4 | Projetos | `/projetos` | `system-onPath-web-front/src/telas/Projetos.tsx` |
| 5 | Áreas e metas | `/areas` | `system-onPath-web-front/src/telas/Areas.tsx` |
| 6 | Agenda | `/agenda` | `system-onPath-web-front/src/telas/Agenda.tsx` |
| 7 | Rotinas | `/rotinas` | `system-onPath-web-front/src/telas/Rotinas.tsx` |
| 8 | Estudos | `/estudos` | `system-onPath-web-front/src/telas/Estudos.tsx` |
| 9 | Ajustes | `/ajustes` | `system-onPath-web-front/src/telas/Ajustes.tsx` |
| — | Página não encontrada | qualquer outro | `system-onPath-web-front/src/telas/NaoEncontrada.tsx` |

## Comportamento

- O menu fica fixo à esquerda em todas as telas e marca a tela atual (FR-006).
- Trocar de tela não recarrega a página.
- Cada tela mostra o próprio título. Nesta etapa, só a tela Ajustes tem conteúdo: a seção
  "Cópia dos dados", com os botões Exportar e Importar (FR-024).
- A página não encontrada mostra uma mensagem e um link para Hoje (FR-007).
- Enquanto o primeiro uso é preparado, uma tela de carregamento aparece no lugar do conteúdo. Se
  o armazenamento falhar, aparece a mensagem de erro com o que fazer.
- As rotas de detalhe, como `/projetos/[id]` e `/estudos/[id]`, entram nas etapas próprias.
