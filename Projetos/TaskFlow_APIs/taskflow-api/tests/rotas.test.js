const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const prisma = require('../database/prisma');

const USUARIO_ID = 1;
const PROJETO_ID = 1;
const PRIORIDADE_ID = 1;
const token = jwt.sign({ id: USUARIO_ID }, process.env.JWT_SECRET);
const autorizacao = { Authorization: `Bearer ${token}` };

let tarefaExercicioId;

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Rotas da API', () => {
  test('Teste 7: lista prioridades', async () => {
    const resposta = await request(app)
      .get('/prioridades')
      .set(autorizacao);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  test('Teste 8: cria e remove uma tarefa', async () => {
    let tarefaId;
    try {
      const criada = await request(app)
        .post('/tarefas')
        .set(autorizacao)
        .send({
          texto: 'Tarefa criada pelo teste',
          coluna: 'afazer',
          usuario_id: USUARIO_ID,
          projeto_id: PROJETO_ID,
          idprioridade: PRIORIDADE_ID,
        });

      tarefaId = criada.body.id;
      expect(criada.status).toBe(201);
      expect(criada.body).toHaveProperty('id');

      const removida = await request(app)
        .delete(`/tarefas/${tarefaId}`)
        .set(autorizacao);

      expect(removida.status).toBe(200);
      tarefaId = undefined;
    } finally {
      if (tarefaId) {
        await request(app)
          .delete(`/tarefas/${tarefaId}`)
          .set(autorizacao);
      }
    }
  });

  test('Teste 9: retorna 404 para uma tarefa inexistente', async () => {
    const resposta = await request(app)
      .get('/tarefas/999999')
      .set(autorizacao);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Tarefa não encontrada');
  });

  test('Exercício 1: lista tarefas', async () => {
    const resposta = await request(app)
      .get('/tarefas')
      .set(autorizacao);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  test('Exercício 2: lista projetos', async () => {
    const resposta = await request(app)
      .get('/projetos')
      .set(autorizacao);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  test('Exercício 3: cria, busca e remove uma tarefa', async () => {
    let tarefaId;
    try {
      const criada = await request(app)
        .post('/tarefas')
        .set(autorizacao)
        .send({
          texto: 'Tarefa do exercício de rotas',
          coluna: 'afazer',
          usuario_id: USUARIO_ID,
          projeto_id: PROJETO_ID,
          idprioridade: PRIORIDADE_ID,
        });

      expect(criada.status).toBe(201);
      tarefaId = criada.body.id;
      tarefaExercicioId = tarefaId;

      const encontrada = await request(app)
        .get(`/tarefas/${tarefaId}`)
        .set(autorizacao);

      expect(encontrada.status).toBe(200);
      expect(encontrada.body.texto).toBe('Tarefa do exercício de rotas');

      const removida = await request(app)
        .delete(`/tarefas/${tarefaId}`)
        .set(autorizacao);

      expect(removida.status).toBe(200);
      tarefaId = undefined;
    } finally {
      if (tarefaId) {
        await request(app)
          .delete(`/tarefas/${tarefaId}`)
          .set(autorizacao);
      }
    }
  });

  test('Exercício 4: retorna 404 para a tarefa removida', async () => {
    expect(tarefaExercicioId).toBeDefined();
    const resposta = await request(app)
      .get(`/tarefas/${tarefaExercicioId}`)
      .set(autorizacao);

    expect(resposta.status).toBe(404);
  });
});
