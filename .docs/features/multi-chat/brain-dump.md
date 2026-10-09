## Features: Single-chat to multi-chat

Preciso transformar o chat de de conversa única para multiplas conversas.

### Aspectos Tecnicos

Vamos usar a biblioteca do zustend para gerenciamento de estado.

Store na biblioteca Zustend armazenando 2 informações:
    - Histórico de cada conversa individualmente ( com todas as informações do type Messege)
    - Qual chat está ativo ( com um ID).

A Store do zustend deve ficar no src/stores.    

### Fluxo de informações

Ao abrir o site não estará em nenhuma conversa(empty state).

### Aspectos Visuais

No sidebar teremos a lista de conversas e um botão para criar uma nova conversa.

A identificação do chat no sidebar é exibindo o proprio ID dele.

O input fica desabilitado quando não há conversas ativas (opacidade 50% e botões não funcionam)

O sidebar ficará do lado esquerdo, sendo retrátil no celular (botão hamburguer no canto superior esquerdo)