# API de Gerenciamento de Usuários

Esta é uma API RESTful construída com Node.js, Express e Firebase Admin SDK para gerenciar dados de usuários, incluindo informações básicas, preferências e tokens de acesso para outras plataformas.

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
|   |-- firebase.js       # Configuração e inicialização do Firebase Admin
|-- controllers/
|   |-- User.js           # Lógica de requisição/resposta (Controllers)
|-- logs/
|   |-- Logger.js         # Configuração da classe de Logging (Winston)
|   |-- app.log           # Arquivo de log (se configurado)
|-- middlewares/
|   |-- Auth.js           # Middleware de autenticação com Firebase
|-- models/
|   |-- User.js           # Schemas de validação (Joi)
|-- routes/
|   |-- User.js           # Definição das rotas da API
|-- services/
|   |-- User.js           # Lógica de negócio e interação com o banco de dados
|-- .env.example          # Exemplo de arquivo de variáveis de ambiente
|-- .gitignore
|-- index.js              # Ponto de entrada da aplicação
|-- package.json
|-- README.md
```

## Funcionalidades Principais

- **Autenticação Segura**: Utiliza tokens JWT do Firebase para proteger as rotas.
- **Autorização Baseada em Papéis**: Distingue entre usuários comuns e administradores. Um usuário só pode acessar ou modificar seus próprios dados, a menos que seja um administrador.
- **Operações CRUD Completas**: Suporte para criar, ler, atualizar (parcial e total) e deletar usuários.
- **Gerenciamento de Sub-recursos**: Endpoints específicos para gerenciar preferências e tokens de acesso de plataformas de terceiros.
- **Validação de Dados**: Garante a integridade dos dados recebidos através de schemas de validação.
- **Logging Detalhado**: Registra informações, avisos e erros, incluindo stack traces para depuração facilitada.
- **Timestamps Automáticos**: Os campos `createdAt` e `updatedAt` são gerenciados automaticamente pelo servidor em todas as operações de escrita, garantindo um rastreamento preciso das alterações.
- **Respostas de API Consistentes**: Operações de atualização (`PUT`, `PATCH`) retornam o objeto de usuário completo e atualizado, simplificando a sincronização de estado no lado do cliente.

---

## Endpoints da API

**Autenticação**: Todas as rotas (exceto as de health check) exigem um `Bearer Token` no cabeçalho `Authorization`.

`Authorization: Bearer <seu-firebase-token>`

---

### Usuários (`/api/users`)

#### `POST /api/users`
- **Descrição**: Cria um novo usuário no banco de dados. A função é acionada após o primeiro login bem-sucedido de um usuário Firebase, usando o `uid` e `email` do token.
- **Resposta (201 CREATED)**: O objeto do novo usuário, incluindo `createdAt` e `updatedAt`.
```json
{
  "id": "firebase-uid-123",
  "email": "user@example.com",
  "createdAt": 1678886400000,
  "updatedAt": 1678886400000
}
```

#### `GET /api/users`
- **Descrição**: **(Admin)** Retorna uma lista paginada de todos os usuários.
- **Resposta (200 OK)**:
```json
{
  "users": [
    {
      "id": "firebase-uid-123",
      "email": "user1@example.com",
      "name": "User One"
    }
  ],
  "nextCursor": "firebase-uid-124"
}
```

#### `GET /api/users/:id`
- **Descrição**: Retorna os dados de um usuário específico.
- **Permissão**: Admin ou o próprio usuário.
- **Resposta (200 OK)**: O objeto do usuário (sem os tokens de acesso).

#### `PUT /api/users/:id`
- **Descrição**: **Substitui completamente** todos os dados de um usuário. Campos não fornecidos no corpo da requisição serão removidos (ou definidos como `null`).
- **Permissão**: Admin ou o próprio usuário.
- **Corpo da Requisição**: Um objeto JSON com **todos** os campos do usuário.
- **Resposta (200 OK)**: O objeto de usuário completo e atualizado.

#### `PATCH /api/users/:id`
- **Descrição**: **Atualiza parcialmente** os dados de um usuário. Apenas os campos fornecidos no corpo da requisição serão alterados.
- **Permissão**: Admin ou o próprio usuário.
- **Corpo da Requisição**: Um objeto JSON com os campos a serem atualizados.
- **Resposta (200 OK)**: O objeto de usuário completo e atualizado.

#### `DELETE /api/users/:id`
- **Descrição**: Deleta um usuário do banco de dados.
- **Permissão**: Admin ou o próprio usuário.
- **Resposta**: `204 No Content`.

---

### Sub-Recursos do Usuário

#### `GET /api/users/:id/tokens`
- **Descrição**: Retorna todos os tokens de acesso de plataformas de terceiros para um usuário específico.
- **Permissão**: Admin ou o próprio usuário.
- **Resposta (200 OK)**:
```json
{
  "spotify": { "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 },
  "deezer": { "accessToken": "...", "expiresIn": 3600 }
}
```

#### `PUT /api/users/:id/tokens/:platformName`
- **Descrição**: Cria ou atualiza (`upsert`) o token de acesso para uma plataforma específica.
- **Permissão**: Admin ou o próprio usuário.
- **Corpo da Requisição**: Objeto do token. Ex: `{"accessToken": "...", "expiresIn": 3600}`
- **Resposta (200 OK)**: O objeto de usuário completo e atualizado, refletindo o `updatedAt`.

#### `GET /api/users/:id/preferences`
- **Descrição**: Retorna as preferências de um usuário.
- **Permissão**: Admin ou o próprio usuário.
- **Resposta (200 OK)**: O objeto de preferências.

#### `PATCH /api/users/:id/preferences`
- **Descrição**: Atualiza parcialmente as preferências de um usuário.
- **Permissão**: Admin ou o próprio usuário.
- **Corpo da Requisição**: Objeto com as preferências a serem atualizadas.
- **Resposta (200 OK)**: O objeto de usuário completo e atualizado.

## Tratamento de Erros

A API utiliza códigos de status HTTP padrão para comunicar o resultado das operações:

- `200 OK`: Requisição bem-sucedida.
- `201 Created`: Recurso criado com sucesso.
- `204 No Content`: Requisição bem-sucedida, sem conteúdo para retornar (ex: após um `DELETE`).
- `400 Bad Request`: Erro de validação ou requisição malformada.
- `401 Unauthorized`: Token de autenticação ausente ou inválido.
- `403 Forbidden`: O usuário está autenticado, mas não tem permissão para acessar o recurso.
- `404 Not Found`: O recurso solicitado não foi encontrado.
- `409 Conflict`: Conflito de estado, como tentar criar um usuário que já existe.
- `500 Internal Server Error`: Ocorreu um erro inesperado no servidor. Os detalhes são registrados no log para depuração.

## Como Executar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-repositorio>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`.
    - Adicione as credenciais do seu projeto Firebase (geralmente como uma string JSON codificada em Base64).
    - Configure a porta e o caminho para o arquivo de log.

    ```env
    PORT=3000
    FIREBASE_SERVICE_ACCOUNT_BASE64=...
    LOGGING_PATH=./logs/app.log
    ```

4.  **Inicie o servidor:**
    ```bash
    npm start
    ```

A API estará disponível em `http://localhost:3000`.
