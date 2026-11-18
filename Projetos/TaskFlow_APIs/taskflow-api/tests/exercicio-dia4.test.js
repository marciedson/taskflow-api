const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Exercicios do Dia 4 para validar', () => {
  test('email invalido retorna 400 e nao chama next', () => {
    const middleware = validar(schemas.usuario);
    const req = { body: { nome: 'Ana', email: 'ana@', senha: '123456' } };
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: ["O campo 'email' deve ser um email válido"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('nome e senha abaixo do minimo retornam dois detalhes na ordem', () => {
    const middleware = validar(schemas.usuario);
    const req = { body: { nome: 'Al', email: 'ana@example.com', senha: '123' } };
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: [
        "O campo 'nome' deve ter ao menos 3 caracteres",
        "O campo 'senha' deve ter ao menos 6 caracteres",
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('descricao do projeto acima de 200 caracteres retorna erro', () => {
    const middleware = validar(schemas.projeto);
    const req = { body: { nome: 'TaskFlow', descricao: 'a'.repeat(201) } };
    const res = criarRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erros: ["O campo 'descricao' deve ter no máximo 200 caracteres"],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
