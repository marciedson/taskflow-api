const criarErro = require('../utils/criarErro');
const traduzirErroPrisma = require('../utils/traduzirErroprisma');

describe('Tratamento de erros e códigos do Prisma', () => {
  test('criarErro(500, "Erro interno no servidor") define status 500 e detalhes undefined', () => {
    const erro = criarErro(500, 'Erro interno no servidor');

    expect(erro.status).toBe(500);
    expect(erro.detalhes).toBeUndefined();
  });

  test('P2003 ao atualizar (PUT) retorna status 400 e mensagem específica', () => {
    const erroPrisma = { code: 'P2003' };
    const resultado = traduzirErroPrisma(erroPrisma, 'PUT');

    expect(resultado.status).toBe(400);
    expect(resultado.message).toBe('Um dos ids informados não existe');
  });

  test('P2025 retorna a mensagem "Registro não encontrado"', () => {
    const erroPrisma = { code: 'P2025' };
    const resultado = traduzirErroPrisma(erroPrisma);

    expect(resultado.message).toBe('Registro não encontrado');
  });

  test('P2003 ao excluir (DELETE) retorna mensagem de registros vinculados', () => {
    const erroPrisma = { code: 'P2003' };
    const resultado = traduzirErroPrisma(erroPrisma, 'DELETE');

    expect(resultado.message).toBe('Não é possível excluir: existem registros ligados a este');
  });
});
