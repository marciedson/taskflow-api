const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'API de tarefas, projetos, usuarios e autenticacao do TaskFlow.',
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Credenciais: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 6 },
        },
      },
      NovoUsuario: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 6 },
        },
      },
      Projeto: {
        type: 'object',
        required: ['nome'],
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          usuario_id: { type: 'integer' },
        },
      },
      Tarefa: {
        type: 'object',
        required: ['titulo', 'projetoId'],
        properties: {
          id: { type: 'integer' },
          titulo: { type: 'string' },
          prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
          coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
          projetoId: { type: 'integer' },
          ordem: { type: 'integer' },
        },
      },
      Erro: {
        type: 'object',
        properties: {
          erro: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Verificar se a API esta ativa',
        responses: {
          200: { description: 'API ativa' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Verificar conexao com o banco de dados',
        responses: {
          200: { description: 'API e banco de dados disponiveis' },
          503: { description: 'Banco de dados indisponivel' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Autenticar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Credenciais' },
            },
          },
        },
        responses: {
          200: { description: 'Token JWT e dados publicos do usuario' },
          401: { description: 'Credenciais invalidas' },
        },
      },
    },
    '/usuarios': {
      get: {
        summary: 'Listar usuarios',
        responses: { 200: { description: 'Lista de usuarios sem senhas' } },
      },
      post: {
        summary: 'Cadastrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NovoUsuario' },
            },
          },
        },
        responses: {
          201: { description: 'Usuario cadastrado' },
          409: { description: 'E-mail ja cadastrado' },
        },
      },
    },
    '/usuarios/{id}': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      }],
      get: {
        summary: 'Buscar usuario',
        responses: { 200: { description: 'Usuario encontrado' }, 404: { description: 'Usuario nao encontrado' } },
      },
      put: {
        summary: 'Atualizar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NovoUsuario' },
            },
          },
        },
        responses: { 200: { description: 'Usuario atualizado' }, 404: { description: 'Usuario nao encontrado' } },
      },
      delete: {
        summary: 'Remover usuario',
        responses: { 200: { description: 'Usuario removido' }, 404: { description: 'Usuario nao encontrado' } },
      },
    },
    '/projetos': {
      get: {
        summary: 'Listar projetos do usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de projetos' }, 401: { description: 'Token ausente ou invalido' } },
      },
      post: {
        summary: 'Criar projeto para o usuario autenticado',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Projeto' },
            },
          },
        },
        responses: { 201: { description: 'Projeto criado' }, 401: { description: 'Token ausente ou invalido' } },
      },
    },
    '/projetos/{id}': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      }],
      get: {
        summary: 'Buscar projeto do usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Projeto encontrado' }, 404: { description: 'Projeto nao encontrado' } },
      },
      put: {
        summary: 'Atualizar projeto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Projeto' },
            },
          },
        },
        responses: { 200: { description: 'Projeto atualizado' }, 404: { description: 'Projeto nao encontrado' } },
      },
      delete: {
        summary: 'Remover projeto',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Projeto removido' }, 404: { description: 'Projeto nao encontrado' } },
      },
    },
    '/tarefas': {
      get: {
        summary: 'Listar tarefas do usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de tarefas' }, 401: { description: 'Token ausente ou invalido' } },
      },
      post: {
        summary: 'Criar tarefa',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Tarefa' },
            },
          },
        },
        responses: { 201: { description: 'Tarefa criada' }, 404: { description: 'Projeto nao encontrado' } },
      },
    },
    '/tarefas/estatisticas': {
      get: {
        summary: 'Obter estatisticas das tarefas',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Estatisticas' } },
      },
    },
    '/tarefas/estatisticas/resumo': {
      get: {
        summary: 'Obter resumo das estatisticas',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Resumo das estatisticas' } },
      },
    },
    '/tarefas/{id}': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      }],
      get: {
        summary: 'Buscar tarefa',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Tarefa encontrada' }, 404: { description: 'Tarefa nao encontrada' } },
      },
      put: {
        summary: 'Atualizar tarefa',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Tarefa' },
            },
          },
        },
        responses: { 200: { description: 'Tarefa atualizada' }, 404: { description: 'Tarefa nao encontrada' } },
      },
      delete: {
        summary: 'Remover tarefa',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Tarefa removida' }, 404: { description: 'Tarefa nao encontrada' } },
      },
    },
  },
};

module.exports = swaggerDocument;
