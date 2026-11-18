const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validar', () => {
  test('chama next quando os dados da tarefa sao validos', () => {
    const middleware = validar(schemas.tarefa);
    const req = {
      body: {
        titulo: 'Tarefa valida',
        prioridade: 'alta',
        coluna: 'afazer',
        usuarioId: 1,
      },
    };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('aceita texto como alternativa ao titulo obrigatorio', () => {
    const middleware = validar(schemas.tarefa);
    const req = { body: { texto: 'Tarefa valida' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('body ausente retorna 400 com o campo obrigatorio', () => {
    const middleware = validar(schemas.tarefa);
    const req = {};
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: ["O campo 'titulo' é obrigatório"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('coluna invalida retorna os valores aceitos', () => {
    const middleware = validar(schemas.tarefa);
    const req = { body: { titulo: 'Tarefa', coluna: 'feito' } };
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: ["O campo 'coluna' deve ser um de: afazer, andamento, concluido"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('usuarioId deve ser numerico', () => {
    const middleware = validar(schemas.tarefa);
    const req = { body: { titulo: 'Tarefa', usuarioId: '7' } };
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: ["O campo 'usuarioId' deve ser do tipo number"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('descricao opcional ausente nao impede a validacao do projeto', () => {
    const middleware = validar(schemas.projeto);
    const req = { body: { nome: 'TaskFlow' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('aceita descricao do projeto com exatamente 200 caracteres', () => {
    const middleware = validar(schemas.projeto);
    const req = { body: { nome: 'TaskFlow', descricao: 'a'.repeat(200) } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('aceita nome e senha nos comprimentos minimos', () => {
    const middleware = validar(schemas.usuario);
    const req = {
      body: { nome: 'Ana', email: 'ana@example.com', senha: '123456' },
    };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
