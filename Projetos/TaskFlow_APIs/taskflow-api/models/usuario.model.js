const prisma = require('../database/prisma');
const { hashPassword } = require('../utils/password');

const camposPublicos = {
  id: true,
  nome: true,
  email: true,
  criado_em: true,
};

function converterId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const usuarioModel = {
  listar: () => prisma.usuarios.findMany({
    select: camposPublicos,
    orderBy: { id: 'asc' },
  }),

  buscarPorId: (valor) => {
    const id = converterId(valor);
    if (!id) return null;

    return prisma.usuarios.findUnique({
      where: { id },
      select: camposPublicos,
    });
  },

  buscarPorEmail: (email) => prisma.usuarios.findFirst({
    where: {
      email: {
        equals: String(email).trim(),
        mode: 'insensitive',
      },
    },
  }),

  atualizarSenha: (id, senha_hash) => prisma.usuarios.update({
    where: { id },
    data: { senha_hash },
  }),

  criar: async ({ nome, email, senha }) => prisma.usuarios.create({
    data: {
      nome,
      email: email.trim().toLowerCase(),
      senha_hash: await hashPassword(senha),
    },
    select: camposPublicos,
  }),

  atualizar: async (valor, dados) => {
    const id = converterId(valor);
    if (!id) return null;

    const data = {};
    if (dados.nome !== undefined) data.nome = dados.nome;
    if (dados.email !== undefined) data.email = dados.email.trim().toLowerCase();
    if (dados.senha !== undefined) data.senha_hash = await hashPassword(dados.senha);
    if (Object.keys(data).length === 0) return usuarioModel.buscarPorId(id);

    const resultado = await prisma.usuarios.updateMany({
      where: { id },
      data,
    });
    if (!resultado.count) return null;
    return usuarioModel.buscarPorId(id);
  },

  deletar: async (valor) => {
    const id = converterId(valor);
    if (!id) return false;

    const resultado = await prisma.usuarios.deleteMany({ where: { id } });
    return resultado.count > 0;
  },
};

module.exports = usuarioModel;