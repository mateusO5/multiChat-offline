# PRD: Conversas multiplas

## 1. Visao geral

O Chat Offline hoje oferece uma unica conversa em memoria. Esta funcionalidade amplia o produto para permitir criar, alternar, renomear e excluir varias conversas independentes, cada uma com seu proprio historico. O gerenciamento do estado compartilhado sera feito com Zustand, em uma store dentro de `src/stores`.

A aplicacao continuara offline e sem persistencia: conversas e mensagens existem apenas durante a sessao atual e sao removidas ao recarregar a pagina.

## 2. Objetivo

Permitir que a pessoa organize conversas separadas sem perder o historico ao alternar entre elas, mantendo a experiencia atual de mensagens e respostas locais do Robo.

## 3. Usuarios e necessidade

A pessoa que usa o Chat Offline precisa iniciar conversas independentes, voltar a uma conversa anterior durante a mesma sessao e identificar cada conversa pela lista lateral.

## 4. Escopo do MVP

### Incluido

- Estado global com Zustand, mantido em `src/stores`.
- Criacao de uma conversa vazia, ativada imediatamente.
- Navegacao entre conversas por uma sidebar.
- Identificacao por ID gerado para cada conversa; conversas renomeadas mostram o nome como rotulo principal e mantem o ID disponivel como identificador secundario.
- Renomeacao e exclusao de conversas.
- Historico independente por conversa, preservando todos os campos existentes de `ChatMessage`.
- Estado inicial sem conversa selecionada e sem conversas criadas.
- Sidebar fixa no desktop e retratil em telas pequenas.
- Composer desabilitado quando nao houver conversa ativa.
- Respostas automaticas do Robo associadas a conversa que originou a mensagem.
- Conversas ordenadas da mais recentemente atualizada para a menos recente.
- Dados mantidos somente em memoria durante a sessao.

### Fora do escopo

- Login, multiplos usuarios, sincronizacao ou compartilhamento.
- Persistencia em `localStorage`, cookies, IndexedDB ou backend.
- Busca, filtros, pastas, fixacao ou arquivamento de conversas.
- Edicao, exclusao ou reenvio de mensagens individuais.
- Exportacao ou importacao de conversas.
- Geracao de IDs ou nomes definidos manualmente pela pessoa usuaria.

## 5. Premissas e decisoes de produto

- Ao abrir ou recarregar o site, nao ha conversa ativa e os dados em memoria estao vazios.
- Criar conversa gera um ID unico e a ativa imediatamente.
- A lista mostra as conversas mais recentemente atualizadas primeiro. Uma nova conversa passa a ser a primeira da lista; uma conversa vai para o topo quando seu historico muda ou seu nome e atualizado.
- Conversas sem nome exibem o ID completo. Conversas renomeadas exibem o nome e conservam o ID como informacao secundaria.
- A renomeacao nao pode salvar um nome vazio ou composto apenas por espacos. Cancelar a edicao ou pressionar Escape descarta as alteracoes; confirmar salva o nome normalizado.
- Excluir uma conversa requer confirmacao. Ao excluir a conversa ativa, a conversa mais recente restante e ativada; se nao houver outra, a aplicacao volta ao estado sem conversa ativa.
- No celular, a sidebar aparece como painel sobreposto. O botao hamburguer abre e fecha o painel; selecionar uma conversa fecha o painel. Escape e clique fora tambem fecham o painel.
- O rascunho do composer e o modo User/Robot permanecem globais e nao mudam ao alternar de conversa.
- Respostas pendentes do Robo pertencem a conversa em que a mensagem foi enviada. Alternar de conversa nao cancela a resposta. Se a conversa for excluida antes da resposta, o resultado pendente deve ser descartado e nao pode recriar a conversa.

## 6. Requisitos funcionais

### RF01. Iniciar sem conversa ativa

Ao carregar a aplicacao, nao deve haver conversa ativa. A area principal deve apresentar um estado vazio que convide a criar uma conversa, e o composer deve estar desabilitado.

### RF02. Criar conversa

A sidebar deve oferecer um controle acessivel para criar conversa. Ao aciona-lo, o sistema deve criar uma conversa vazia com ID unico, seleciona-la e mostrar seu estado vazio individual.

### RF03. Listar e selecionar conversas

A sidebar deve listar as conversas em ordem decrescente de atualizacao. Cada item deve ser selecionavel por mouse e teclado, indicar claramente qual conversa esta ativa e exibir o ID (ou nome e ID secundario, se renomeada). Ao selecionar um item, a area principal deve exibir somente o historico daquela conversa.

### RF04. Manter historicos independentes

Cada conversa deve manter sua propria lista de mensagens com todos os campos do tipo `ChatMessage` atual: `id`, `role`, `content` e `createdAt`. Alternar entre conversas nao pode misturar, apagar ou duplicar mensagens.

### RF05. Renomear conversa

A pessoa usuaria deve conseguir atribuir ou alterar o nome de uma conversa. O nome deve ser validado e o ID original deve permanecer associado a conversa. O nome salvo deve ser refletido na sidebar.

### RF06. Excluir conversa

A pessoa usuaria deve conseguir excluir uma conversa a partir da sidebar, apos confirmar a acao. Se a conversa excluida for a ativa, deve ser selecionada a conversa mais recente restante; sem outras conversas, deve ser exibido o estado inicial sem conversa ativa. A exclusao deve remover tambem quaisquer respostas pendentes associadas a conversa.

### RF07. Enviar mensagens na conversa ativa

O composer deve enviar mensagens apenas para a conversa ativa, preservando as regras existentes de envio, personas, validacao e resposta automatica. Quando nao houver conversa ativa, textarea, toggle e botao de envio devem estar desabilitados e nao devem responder a interacoes.

### RF08. Manter respostas na conversa de origem

Uma resposta automatica iniciada por uma mensagem deve ser adicionada a mesma conversa, mesmo se a pessoa alternar para outra antes da conclusao. O indicador de processamento deve ser associado a conversa que esta aguardando a resposta e nao deve aparecer incorretamente em outra conversa.

### RF09. Preservar rascunho e modo

Alternar entre conversas deve preservar o texto nao enviado e o modo atual do composer (User ou Robot), conforme o comportamento global ja definido para o campo de entrada.

### RF10. Tratar estados vazios

Distinguir os estados: (a) nenhuma conversa criada, com convite para criar uma; (b) conversa selecionada sem mensagens, com convite para enviar a primeira mensagem. O segundo estado deve manter o composer habilitado.

### RF11. Persistencia da sessao

A store deve ser apenas em memoria. Recarregar ou abrir uma nova sessao deve limpar conversas, historicos, selecao e respostas pendentes.

## 7. Requisitos visuais, responsividade e acessibilidade

- A sidebar deve ocupar o lado esquerdo no desktop; a area de conversa ocupa o restante do espaco disponivel.
- A sidebar deve apresentar titulo ou contexto, acao de nova conversa e lista de conversas.
- O ID completo deve permanecer legivel; nomes longos podem ser truncados visualmente sem causar overflow.
- A conversa ativa deve ter estado visual distinto.
- No celular, a sidebar deve ser retratil por botao hamburguer no canto superior esquerdo e abrir como painel sobreposto, com controle de fechamento acessivel.
- O fundo sobreposto deve permitir fechar a sidebar; ao selecionar conversa, o painel deve se fechar.
- Quando nao houver conversa ativa, o composer inteiro (toggle, campo e envio) deve ter opacidade de 50%, controles desabilitados e sem acao por teclado ou ponteiro.
- Quando houver conversa ativa, o composer continua acessivel na parte inferior conforme o layout atual.
- Controles de criar, renomear, excluir, alternar conversa e fechar sidebar devem ter nomes acessiveis, foco visivel e operacao por teclado.
- Dialogo de confirmacao de exclusao deve ser acessivel por teclado, anunciar seu proposito e devolver o foco a um controle valido ao fechar.
- O layout deve evitar overflow horizontal em telas pequenas e manter dimensoes de toque adequadas.

## 8. Modelo de dados e estado

A store em `src/stores` deve representar, no minimo:

- Colecao de conversas identificadas por ID.
- Para cada conversa: ID, nome opcional, historico de `ChatMessage` e metadado de ultima atualizacao usado para ordenar a sidebar.
- ID da conversa ativa, ou `null` quando nenhuma estiver selecionada.

A store deve oferecer operacoes coerentes para criar, selecionar, renomear, excluir e adicionar mensagens a uma conversa especifica. Respostas assincronas devem sempre indicar a conversa de destino, evitando depender apenas da selecao ativa no momento em que terminam.

O rascunho do composer e o modo de persona permanecem como estado global da interface; nao precisam ser copiados para cada conversa. A store nao deve ser configurada com middleware de persistencia.

O tipo atual `ChatMessage` deve ser reutilizado sem perda ou alteracao dos seus campos. Tipos novos devem seguir a organizacao existente em `src/types`.

## 9. Criterios de aceite

1. Ao abrir ou recarregar a aplicacao, nao ha conversa ativa ou mensagens; o composer aparece desabilitado com 50% de opacidade.
2. Criar conversa gera um ID unico, ativa a conversa e habilita o composer.
3. Criar varias conversas e alternar entre elas mantem os historicos separados e intactos.
4. A sidebar ordena conversas por atualizacao mais recente, mostra o ID completo quando nao ha nome e preserva o ID como dado secundario quando ha nome.
5. Renomear atualiza o rotulo da sidebar, nao altera o ID e impede salvar nomes vazios.
6. Excluir requer confirmacao; excluir a ativa seleciona a mais recente restante, ou retorna ao estado sem conversa quando nao restam conversas.
7. Excluir uma conversa com resposta pendente impede que a resposta seja adicionada posteriormente ou que a conversa reapareca.
8. Uma resposta automatica iniciada em uma conversa e adicionada a essa conversa mesmo depois de alternar para outra.
9. O status de resposta pendente e apresentado somente na conversa correspondente.
10. O rascunho e o modo de persona permanecem iguais depois de alternar entre conversas.
11. O estado de uma conversa vazia e diferente do estado sem conversas; somente o primeiro permite enviar mensagens.
12. Em celular, o menu hamburguer abre/fecha a sidebar sobreposta; selecionar uma conversa, pressionar Escape ou clicar fora fecha o painel.
13. Acionar controles do composer sem conversa ativa nao envia mensagem nem altera o modo, inclusive por teclado.
14. Recarregar a pagina limpa conversas, nomes, historicos e selecao, sem chamadas de rede ou escrita em armazenamento persistente.
15. Layout, foco, rotulos acessiveis e interacoes funcionam sem overflow horizontal em desktop e mobile.

## 10. Plano de implementacao

### Fase 1: Estado e dependencias

1. [x] Adicionar Zustand como dependencia do projeto.
2. [x] Definir os tipos de conversa e estado em `src/types`, preservando `ChatMessage`.
3. [x] Criar a store em `src/stores` com operacoes para criar, selecionar, renomear, excluir e atualizar mensagens.
4. [x] Manter metadados de atualizacao e protecao contra atualizacoes tardias de conversas removidas.

### Fase 2: Integracao do chat

5. [x] Substituir o historico unico da aplicacao pela conversa ativa obtida da store.
6. [x] Direcionar envio e respostas automaticas ao ID da conversa de origem.
7. [x] Manter rascunho e modo do composer globais.
8. [x] Separar o estado vazio global do estado vazio de uma conversa.

### Fase 3: Sidebar e responsividade

9. [x] Implementar a sidebar, lista ordenada, selecao e criacao de conversa.
10. [x] Implementar renomeacao, confirmacao de exclusao e comportamento ao excluir a conversa ativa.
11. [x] Implementar sidebar mobile sobreposta, botao hamburguer e interacoes de fechamento.
12. [x] Desabilitar o composer sem conversa ativa, incluindo interacoes por teclado (implementado na fase 2).

### Fase 4: Validacao

13. Validar store, isolamento de historicos, atualizacoes assincronas e ciclo de vida de conversas.
14. Validar acessibilidade e estados responsivos em larguras desktop e mobile.
15. Executar os scripts existentes de lint e build; adicionar testes automatizados se a infraestrutura de testes do projeto for configurada.

## 11. Dependencias e riscos

- Zustand foi adicionado como dependencia na fase 1.
- O projeto atual expoe scripts de lint e build, mas nao possui um script de testes automatizados configurado. Testes de store e componentes exigirao incluir/configurar uma infraestrutura apropriada ou validar manualmente nesta entrega.
- Respostas assincronas podem terminar apos uma troca ou exclusao de conversa; cada resposta deve carregar o ID de origem e ser descartada se a conversa nao existir mais.
- A coexistencia do estado global do composer com a navegacao deve ser testada para evitar perda de rascunho ou alteracao acidental da persona.
