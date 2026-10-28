const prisma = require('../database/prisma');

const incluirRelacoes = {
  projetos: { select: { nome: true } },
  usuarios: { select: { nome: true } },
  prioridades: { select: { descricao: true } },
};

const prioridadePorDescricao = {
  alta: 'Alto',
  media: 'Medio',
  baixa: 'Baixo',
};

const descricaoPorPrioridade = {
  alto: 'alta',
  medio: 'media',
  baixo: 'baixa',
};

function formatarTarefa(tarefa) {
  if (!tarefa) return null;

  const { projetos, usuarios, prioridades, ...dados } = tarefa;
  const descricaoPrioridade = prioridades?.descricao?.toLocaleLowerCase('pt-BR');

  return {
    ...dados,
    titulo: dados.texto,
    prioridade: descricaoPorPrioridade[descricaoPrioridade] ?? prioridades?.descricao ?? null,
    projetoId: dados.projeto_id,
    usuarioId: dados.usuario_id,
    projeto: projetos?.nome,
    usuario: usuarios?.nome,
  };
}

function converterId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function buscarPrioridadeId(prioridade) {
  if (prioridade === undefined) return undefined;
  if (prioridade === null) return null;

  const descricao = prioridadePorDescricao[String(prioridade).toLocaleLowerCase('pt-BR')] ?? prioridade;
  const registro = await prisma.prioridades.findFirst({
    where: {
      descricao: {
        equals: descricao,
        mode: 'insensitive',
      },
    },
    select: { id: true },
    orderBy: { id: 'asc' },
  });

  if (!registro) {
    throw new Error(`Prioridade "${prioridade}" não encontrada`);
  }

  return registro.id;
}

const tarefaModel = {
  listar: async (usuarioId) => {
    const idUsuario = converterId(usuarioId);
    if (!idUsuario) throw new TypeError('usuarioId inválido');

    const tarefas = await prisma.tarefas.findMany({
      where: { usuario_id: idUsuario },
      include: incluirRelacoes,
      orderBy: { id: 'asc' },
    });

    return tarefas.map(formatarTarefa);
  },

  buscarPorId: async (id, usuarioId) => {
    const idTarefa = converterId(id);
    const idUsuario = converterId(usuarioId);
    if (!idTarefa || !idUsuario) return null;

    const tarefa = await prisma.tarefas.findFirst({
      where: { id: idTarefa, usuario_id: idUsuario },
      include: incluirRelacoes,
    });

    return formatarTarefa(tarefa);
  },

  adicionar: async (dados) => {
    const projetoId = converterId(dados.projetoId ?? dados.projeto_id);
    const usuarioId = converterId(dados.usuarioId ?? dados.usuario_id);
    if (!projetoId || !usuarioId) throw new TypeError('projetoId ou usuarioId inválido');

    const projeto = await prisma.projetos.findFirst({
      where: { id: projetoId, usuario_id: usuarioId },
      select: { id: true },
    });
    if (!projeto) return null;

    const data = {
      texto: dados.titulo ?? dados.texto,
      coluna: dados.coluna ?? 'afazer',
      ordem: dados.ordem ?? 0,
      projeto_id: projetoId,
      usuario_id: usuarioId,
    };

    const prioridadeId = await buscarPrioridadeId(dados.prioridade);
    if (prioridadeId !== undefined) data.id_prioridades = prioridadeId;

    const tarefa = await prisma.tarefas.create({
      data,
      include: incluirRelacoes,
    });

    return formatarTarefa(tarefa);
  },

  atualizar: async (id, usuarioId, dados) => {
    const idTarefa = converterId(id);
    const idUsuario = converterId(usuarioId);
    if (!idTarefa || !idUsuario) return null;

    const tarefaExistente = await prisma.tarefas.findFirst({
      where: { id: idTarefa, usuario_id: idUsuario },
      include: incluirRelacoes,
    });
    if (!tarefaExistente) return null;

    const data = {};
    if (dados.titulo !== undefined) data.texto = dados.titulo;
    if (dados.coluna !== undefined) data.coluna = dados.coluna;
    if (dados.ordem !== undefined) data.ordem = dados.ordem;

    const projetoIdInformado = dados.projetoId ?? dados.projeto_id;
    if (projetoIdInformado !== undefined) {
      const projetoId = converterId(projetoIdInformado);
      if (!projetoId) return null;

      const projeto = await prisma.projetos.findFirst({
        where: { id: projetoId, usuario_id: idUsuario },
        select: { id: true },
      });
      if (!projeto) return null;
      data.projeto_id = projetoId;
    }

    if (dados.prioridade !== undefined) {
      data.id_prioridades = await buscarPrioridadeId(dados.prioridade);
    }

    if (Object.keys(data).length === 0) return formatarTarefa(tarefaExistente);

    const resultado = await prisma.tarefas.updateMany({
      where: { id: idTarefa, usuario_id: idUsuario },
      data,
    });
    if (resultado.count === 0) return null;

    const tarefaAtualizada = await prisma.tarefas.findUnique({
      where: { id: idTarefa },
      include: incluirRelacoes,
    });

    return formatarTarefa(tarefaAtualizada);
  },

  remover: async (id, usuarioId) => {
    const idTarefa = converterId(id);
    const idUsuario = converterId(usuarioId);
    if (!idTarefa || !idUsuario) return false;

    const resultado = await prisma.tarefas.deleteMany({
      where: { id: idTarefa, usuario_id: idUsuario },
    });

    return resultado.count > 0;
  },
};

module.exports = tarefaModel;
