const prisma = require('../database/prisma');

function converterId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const projetoModel = {
  listar: (usuarioId) => prisma.projetos.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { id: 'asc' },
  }),

  buscarPorId: (valor, usuarioId) => {
    const id = converterId(valor);
    if (!id) return null;

    return prisma.projetos.findFirst({
      where: { id, usuario_id: usuarioId },
    });
  },

  criar: (projeto, usuarioId) => prisma.projetos.create({
    data: {
      nome: projeto.nome,
      descricao: projeto.descricao,
      usuario_id: usuarioId,
    },
  }),

  atualizar: async (valor, usuarioId, dados) => {
    const id = converterId(valor);
    if (!id) return null;

    const resultado = await prisma.projetos.updateMany({
      where: { id, usuario_id: usuarioId },
      data: {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.descricao !== undefined && { descricao: dados.descricao }),
      },
    });
    if (!resultado.count) return null;
    return projetoModel.buscarPorId(id, usuarioId);
  },

  deletar: async (valor, usuarioId) => {
    const id = converterId(valor);
    if (!id) return false;

    const resultado = await prisma.projetos.deleteMany({
      where: { id, usuario_id: usuarioId },
    });
    return resultado.count > 0;
  },
};

module.exports = projetoModel;