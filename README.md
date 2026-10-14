# Chat Offline

Aplicação de chat local que permite criar e alternar entre várias conversas durante a sessão. Cada conversa tem seu próprio histórico e um contato fictício. As respostas do Robô são geradas no navegador, sem backend ou chamadas a serviços externos.

## Funcionalidades

- Criar várias conversas e alternar entre elas sem misturar os históricos.
- Gerar para cada conversa um contato fictício com telefone brasileiro e nome. O gênero alterna entre mulher e homem a cada criação.
- Salvar um nome personalizado para o contato; o nome salvo substitui o telefone na lista.
- Exibir na lista a mensagem mais recente quando houver mensagens.
- Manter o identificador interno da conversa fora da interface.
- Exibir um estado inicial sem conversa e desabilitar o composer até uma conversa ser criada.
- Enviar mensagens como Usuário ou Robô; mensagens do Usuário recebem resposta automática local.
- Manter rascunho e modo do composer ao alternar conversas.
- Continuar uma resposta pendente na conversa que a iniciou, mesmo após alternar para outra.
- Usar sidebar fixa em telas maiores e menu sobreposto em dispositivos móveis.
- Excluir conversas com confirmação e renomear/salvar contato.
- Manter os dados apenas em memória: recarregar a página inicia uma sessão vazia.
- Adaptar a interface a diferentes tamanhos de tela e permitir navegação por teclado nos controles principais.

> Os nomes e telefones são dados fictícios gerados localmente. Os botões de anexo e câmera são apenas visuais e ainda não executam essas ações.

## Tecnologias

- React 19 e TypeScript
- Vite
- Tailwind CSS 4
- Zustand para estado compartilhado das conversas
- Vitest, Testing Library e jsdom para testes
- ESLint

## Requisitos

- Node.js compatível com a versão do Vite usada pelo projeto.
- npm.

## Como executar

Na pasta do projeto, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra no navegador a URL local informada pelo Vite no terminal.

## Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor local com atualização durante o desenvolvimento. |
| `npm run test` | Executa os testes automatizados uma vez. |
| `npm run lint` | Analisa o código com ESLint. |
| `npm run build` | Verifica os tipos TypeScript e gera a versão de produção em `dist/`. |
| `npm run preview` | Abre localmente uma prévia da versão de produção. |

Antes de enviar alteracoes, rode `npm run test`, `npm run lint` e `npm run build`.

## Estrutura do projeto

```text
src/
  components/
    ChatComposer.tsx          Campo para escrever e enviar mensagens
    ChatSidebar.tsx           Lista e ações das conversas
    EmptyState.tsx            Estado vazio de uma conversa
    MessageBubble.tsx         Apresentação de uma mensagem
    MessageList.tsx           Histórico da conversa ativa
    NoConversationState.tsx   Tela sem conversa selecionada
  services/
    generateBotResponse.ts    Respostas locais do Robo
    generateContact.ts        Geração local de telefone e nome fictícios
  stores/
    useChatStore.ts           Conversas, mensagens e seleção ativa
  types/
    chat.ts                   Tipos de mensagem e persona
    chatStore.ts              Contrato da store Zustand
    conversation.ts           Dados de conversa e contato
  test/
    setup.ts                  Configuração dos testes
  App.tsx                     Composição da aplicação e fluxo de mensagens
```

Os testes de componentes e store ficam junto dos arquivos testados, com a extensão `.test.ts` ou `.test.tsx`.

## Como funciona o chat

1. Ao abrir a aplicação, nenhuma conversa está selecionada.
2. Escolha **Nova conversa**. A aplicação gera um contato fictício, cria uma conversa vazia e a seleciona.
3. Escreva uma mensagem e envie pelo botão ou com `Enter`. Use `Shift + Enter` para inserir uma quebra de linha.
4. O modo Usuário gera uma resposta automática local do Robô; o modo Robô envia uma mensagem sem disparar outra resposta automática.
5. Use a lista lateral para trocar de conversa. Cada histórico permanece separado durante a sessão.
6. Use **Salvar contato** para definir um nome personalizado. Esse nome passa a ser o rótulo principal no lugar do telefone.

## Dados e privacidade

O aplicativo não usa servidor, banco de dados, login ou API externa. Conversas, mensagens e contatos existem somente na memória da aba e desaparecem quando a página é recarregada ou fechada. O ID usado internamente para identificar cada conversa não é mostrado na interface.

## Documentação

O [PRD da funcionalidade de conversas múltiplas](.docs/features/multi-chat/prd.md) descreve requisitos, critérios de aceite e fases de implementação.
