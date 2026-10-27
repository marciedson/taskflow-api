const prisma = require('../database/prisma');

// Relações com SELECT apenas do campo nome (evita vazar senhas/dados extras)[cite: 20, 22]
const incluirNomes = {
  projetos: { select: { nome: true } },
  usuarios: { select: { nome: true } },
};

// Mantém o contrato do JSON que o front-end espera[cite: 21, 23]
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  const { projetos, usuarios, ...resto } = tarefa;
  return {
    ...resto,
    projeto: projetos?.nome,
    usuario: usuarios?.nome,
  };
}

const tarefaModel = {
  // 1. LISTAR: Busca todas as tarefas ordenadas por ID[cite: 22]
  listar: async () => {
    const lista = await prisma.tarefas.findMany({
      include: incluirNomes,
      orderBy: { id: 'asc' },
    });
    return lista.map(formatarTarefa);
  },

  // 2. BUSCAR POR ID: Busca uma tarefa específica pela chave primária[cite: 24]
  buscar: async (id) => {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: parseInt(id) },
      include: incluirNomes,
    });
    return formatarTarefa(tarefa);
  },

  // 3. CRIAR: Insere uma nova tarefa no banco
  criar: async (dados) => {
    const novaTarefa = await prisma.tarefas.create({
      data: {
        texto: dados.texto,
        coluna: dados.coluna,
        ordem: dados.ordem ?? 0,
        projeto_id: parseInt(dados.projeto_id),
        usuario_id: parseInt(dados.usuario_id),
        idprioridade: parseInt(dados.idprioridade),
      },
      include: incluirNomes,
    });
    return formatarTarefa(novaTarefa);
  },

  // 4. ATUALIZAR: Atualiza os dados de uma tarefa existente
  atualizar: async (id, dados) => {
    const tarefaAtualizada = await prisma.tarefas.update({
      where: { id: parseInt(id) },
      data: {
        ...(dados.texto !== undefined && { texto: dados.texto }),
        ...(dados.coluna !== undefined && { coluna: dados.coluna }),
        ...(dados.ordem !== undefined && { ordem: dados.ordem }),
        ...(dados.projeto_id !== undefined && { projeto_id: parseInt(dados.projeto_id) }),
        ...(dados.usuario_id !== undefined && { usuario_id: parseInt(dados.usuario_id) }),
        ...(dados.idprioridade !== undefined && { idprioridade: parseInt(dados.idprioridade) }),
        ...(dados.iniciada_em !== undefined && { iniciada_em: dados.iniciada_em }),
        ...(dados.concluida_em !== undefined && { concluida_em: dados.concluida_em }),
      },
      include: incluirNomes,
    });
    return formatarTarefa(tarefaAtualizada);
  },

  // 5. DELETAR: Remove uma tarefa pelo ID
  deletar: async (id) => {
    return await prisma.tarefas.delete({
      where: { id: parseInt(id) },
    });
  },
};

module.exports = tarefaModel;