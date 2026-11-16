 const criarErro = require('./criarErro');

function traduzirErroPrisma(erro, metodo) {
  if (erro.code === 'P2002') {
    const campos = erro.meta?.target;
    const detalhe = campos ? `Valor repetido em: ${campos.join(', ')}` : undefined;
    return criarErro(409, 'Já existe um registro com esse valor', detalhe ? [detalhe] : undefined);
  }

  if (erro.code === 'P2003') {
    if (metodo === 'DELETE') {
      return criarErro(409, 'Não é possível excluir: existem registros ligados a este');
    }
    return criarErro(400, 'Um dos ids informados não existe');
  }

  if (erro.code === 'P2025') {
    return criarErro(404, 'Registro não encontrado');
  }

  return erro;
}

module.exports = traduzirErroPrisma;