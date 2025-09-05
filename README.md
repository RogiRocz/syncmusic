# API de Gerenciamento de Músicas e Playlists

Esta é uma API RESTful construída com Node.js, Express e Firebase para gerenciar dados de usuários, playlists, um catálogo de músicas e configurações da aplicação.

## Principais Tecnologias

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework para construção de APIs.
- **Firebase Admin SDK**: Para autenticação e acesso ao Firebase Realtime Database.
- **Joi**: Para validação de schemas de dados.
- **Winston**: Para um sistema de logging robusto.
- **http-status-codes**: Para uso de códigos de status HTTP sem "números mágicos".

## Estrutura do Projeto

```
/
|-- config/
|   |-- config.yaml       # Arquivo central de configurações da aplicação
|   |-- firebase.js       # Configuração e inicialização do Firebase Admin
|   |-- readConfig.js     # Script que lê o config.yaml e popula as variáveis de ambiente
|-- controllers/
|   |-- Config.js         # Lógica de requisição/resposta para Config
|   |-- Playlist.js       # Lógica de requisição/resposta para Playlists
|   |-- Track.js          # Lógica de requisição/resposta para Tracks
|   |-- User.js           # Lógica de requisição/resposta para Usuários
|-- logs/
|   |-- Logger.js         # Configuração da classe de Logging (Winston)
|   |-- app.log           # Arquivo de log gerado pela aplicação
|-- middlewares/
|   |-- Auth.js           # Middleware de autenticação e autorização
|   |-- checkOwnership.js # Middleware para verificar posse de recursos
|   |-- routesLogs.js     # Middleware para logar informações das rotas
|-- models/
|   |-- Playlist.js       # Schemas de validação para Playlists
|   |-- SyncJob.js        # Schemas de validação para SyncJobs
|   |-- Track.js          # Schemas de validação para Tracks
|   |-- User.js           # Schemas de validação para Usuários
|   |-- index.js          # Exportador central dos schemas
|-- routes/
|   |-- Config.js         # Definição das rotas de Config
|   |-- Playlist.js       # Definição das rotas de Playlists
|   |-- Track.js          # Definição das rotas de Tracks
|   |-- User.js           # Definição das rotas de Usuários
|-- services/
|   |-- Playlist.js       # Lógica de negócio para Playlists
|   |-- Track.js          # Lógica de negócio para Tracks
|   |-- User.js           # Lógica de negócio para Usuários
|-- .env.example          # Exemplo de variável de ambiente necessária
|-- .gitignore
|-- app.js                # Ponto de entrada e configuração do Express
|-- package.json
|-- README.md
```

## Funcionalidades Principais

- **Gerenciamento de Configuração Centralizado**: Utiliza um arquivo `config.yaml` para gerenciar as configurações da aplicação (porta, chaves de cliente, etc.), que são carregadas dinamicamente no ambiente de execução.
- **Autenticação Segura**: Utiliza tokens JWT do Firebase para proteger as rotas da v1.
- **Autorização Baseada em Papéis**: Sistema de permissões que distingue entre usuários (`user`) e administradores (`admin`).
- **Controle de Posse**: Middleware garante que usuários só possam acessar e modificar os próprios recursos.
- **CRUD Completo**: Para Usuários, Playlists e Tracks.
- **Configuração para o Cliente**: Uma rota pública fornece ao cliente as configurações necessárias para se conectar ao Firebase.

---

## Endpoints da API

**Autenticação**: Rotas que exigem autenticação são marcadas e esperam um `Bearer Token` no cabeçalho `Authorization`.

`Authorization: Bearer <seu-firebase-token>`

---

### Configuração (`/api/v1/config`)

Endpoints para obter configurações públicas da aplicação.

#### `GET /firebase-client`
- **Descrição**: Retorna o objeto de configuração do Firebase necessário para inicializar o SDK do Firebase no lado do cliente. Esta rota é pública e não requer autenticação.
- **Permissão**: Pública.

---

### Usuários (`/api/v1/users`)

Endpoints para gerenciar dados de usuários. **Requer Autenticação** para todas as rotas.

- `POST /`: **Cria um novo usuário**. Acionado no primeiro login, extrai `uid` e `email` do token.
- `GET /`: (**Admin**) Lista todos os usuários com paginação.
- `GET /:id`: (**Admin ou Próprio Usuário**) Retorna um usuário específico.
- `PUT /:id`: (**Admin ou Próprio Usuário**) Substitui dados de um usuário.
- `PATCH /:id`: (**Admin ou Próprio Usuário**) Atualiza dados de um usuário.
- `DELETE /:id`: (**Admin ou Próprio Usuário**) Deleta um usuário.
- Sub-recursos: `/:id/tokens` e `/:id/preferences`.

---

### Playlists (`/api/v1/playlists`)

Endpoints para gerenciar as playlists dos usuários. **Requer Autenticação** para todas as rotas.

- `GET /`: Retorna as playlists do usuário autenticado, com suporte a filtros e paginação.
- `POST /`: Cria uma nova playlist.
- `GET /all`: (**Admin**) Retorna uma lista paginada de **todas** as playlists no sistema.
- `GET /:id`: Retorna uma playlist específica (propriedade verificada).
- `PUT /:id`: Substitui uma playlist (propriedade verificada).
- `PATCH /:id`: Atualiza uma playlist (propriedade verificada).
- `DELETE /:id`: Deleta uma playlist (propriedade verificada).
- `POST /:id/tracks`: Adiciona uma faixa a uma playlist.
- `DELETE /:id/tracks/:trackId`: Remove uma faixa de uma playlist.

---

### Tracks (`/api/v1/tracks`)

Endpoints para gerenciar o catálogo global de músicas. **Requer Autenticação de Administrador** para todas as rotas.

- `GET /`: Lista todas as músicas com paginação.
- `POST /`: Adiciona uma nova música ao catálogo.
- `GET /:id`: Retorna uma música específica.
- `PATCH /:id`: Atualiza parcialmente uma música.
- `DELETE /:id`: Deleta uma música.

---

## Tratamento de Erros

A API utiliza códigos de status HTTP padrão para comunicar o resultado das operações (200, 201, 204, 400, 401, 403, 404, 500).

## Como Executar Localmente

Esta seção explica a abordagem de configuração híbrida do projeto para execução local.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma conta Google para acessar o [Firebase](https://firebase.google.com/).

### Passo 1: Configurar a Credencial de Serviço (Variável de Ambiente)

A única credencial que deve ser gerenciada como uma variável de ambiente tradicional é a chave de serviço do Firebase Admin, por motivos de segurança.

1.  Acesse seu projeto no [Firebase Console](https://console.firebase.google.com/).
2.  Vá para **Configurações do projeto** > **Contas de serviço**.
3.  Clique em **"Gerar nova chave privada"** para baixar o arquivo JSON.
4.  Converta o conteúdo deste arquivo para uma string **Base64**.
    -   **macOS**: `cat seu-arquivo.json | base64 | pbcopy`
    -   **Linux**: `cat seu-arquivo.json | base64 | xclip -selection clipboard`
5.  **Defina a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_BASE64`**. Antes de iniciar a aplicação, você precisa exportar esta variável no seu terminal:
    ```bash
    # Exemplo para Linux/macOS
    export FIREBASE_SERVICE_ACCOUNT_BASE64="SUA_STRING_LONGA_EM_BASE64..."
    ```

### Passo 2: Configurar a Aplicação (Arquivo YAML)

Todas as outras configurações são gerenciadas no arquivo `config/config.yaml`.

1.  **Configuração do Cliente Firebase**: No Firebase Console, vá para as configurações do seu projeto e, na aba "Geral", crie um **Aplicativo da Web** (`</>`). O Firebase fornecerá um objeto de configuração.
2.  **Atualize o `config.yaml`**: Abra o arquivo e cole as informações do cliente Firebase e defina a porta do servidor sob a seção `development`:
    ```yaml
    development:
      server:
        port: 3000
      firebase:
        client:
          apiKey: "AIza..."
          authDomain: "seu-projeto.firebaseapp.com"
          # ... etc
    production:
      # ...
    ```

### Passo 3: Instale e Execute

1.  Instale as dependências: `npm install`
2.  Execute o servidor (após exportar a variável de ambiente): `npm start`

A aplicação será iniciada na porta definida em seu `config.yaml`.