const criarErro = require('../utils/criarErro');

describe('criarErro', () => {
  test('deve criar um erro com a mensagem fornecida', () => {
    const mensagem = 'Erro de teste';
    const erro = criarErro(500, mensagem);

    expect(erro).toBeInstanceOf(Error);
    expect(erro.message).toBe(mensagem);
  });

  test('deve definir o status informado', () => {
    const erro = criarErro(404, 'Não encontrado');

    expect(erro.status).toBe(404);
  });

  test('deve manter os detalhes informados', () => {
    const detalhes = ['campo inválido'];
    const erro = criarErro(400, 'Requisição inválida', detalhes);

    expect(erro.detalhes).toBe(detalhes);
  });
});