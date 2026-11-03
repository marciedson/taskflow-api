const prisma = require('../database/prisma');

const incluirDono = {
  usuarios: { select: { nome: true } },
};

function formatarProjeto(projeto) {
  if (!projeto) return null;

  const { usuarios, ...dados } = projeto;
  return {
    ...dados,
    usuarioId: dados.usuario_id,
    usuarioNome: usuarios?.nome,
  };
}

function converterId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const projetoModel = {
  listar: async () => {
    const projetos = await prisma.projetos.findMany({
      include: incluirDono,
      orderBy: { id: 'asc' },
    });
    return projetos.map(formatarProjeto);
  },

  buscarPorId: async (valor) => {
    const id = converterId(valor);
    if (!id) return null;

    return formatarProjeto(await prisma.projetos.findUnique({
      where: { id },
      include: incluirDono,
    }));
  },

  criar: async (projeto, usuarioId) => formatarProjeto(await prisma.projetos.create({
    data: {
      nome: projeto.nome,
      descricao: projeto.descricao,
      usuario_id: usuarioId,
    },
    include: incluirDono,
  })),

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
    return projetoModel.buscarPorId(id);
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