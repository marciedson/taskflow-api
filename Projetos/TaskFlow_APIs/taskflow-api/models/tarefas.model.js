const pool = require('../database/db');

const camposTarefa = `
  t.id,
  t.texto AS titulo,
  t.coluna,
  t.ordem,
  t.projeto_id AS "projetoId",
  t.usuario_id AS "usuarioId",
  t.criado_em AS "criadoEm",
  CASE lower(p.descricao)
    WHEN 'alto' THEN 'alta'
    WHEN 'medio' THEN 'media'
    WHEN 'baixo' THEN 'baixa'
    ELSE lower(p.descricao)
  END AS prioridade`;

async function buscarPrioridadeId(prioridade) {
  if (prioridade === undefined || prioridade === null || prioridade === '') return null;

  const nomesPrioridade = { alta: 'alto', media: 'medio', baixa: 'baixo' };
  const descricao = nomesPrioridade[String(prioridade).toLowerCase()];
  if (!descricao) throw new Error('Prioridade inválida');

  const { rows } = await pool.query(
    'SELECT MIN(id) AS id FROM prioridades WHERE lower(descricao) = $1',
    [descricao]
  );

  if (!rows[0] || !rows[0].id) throw new Error(`Prioridade '${prioridade}' não encontrada no banco`);
  return rows[0].id;
}

async function listar(usuarioId) {
  const { rows } = await pool.query(`
    SELECT ${camposTarefa}
    FROM tarefas t
    LEFT JOIN prioridades p ON p.id = t.id_prioridades
    WHERE t.usuario_id = $1
    ORDER BY t.ordem, t.id
  `, [usuarioId]);

  return rows;
}

async function buscarPorId(id, usuarioId) {
  const { rows } = await pool.query(`
    SELECT ${camposTarefa}
    FROM tarefas t
    LEFT JOIN prioridades p ON p.id = t.id_prioridades
    WHERE t.id = $1 AND t.usuario_id = $2
  `, [id, usuarioId]);

  return rows[0] || null;
}

async function adicionar({ titulo, coluna, ordem, projetoId, usuarioId, prioridade }) {
  const prioridadeId = await buscarPrioridadeId(prioridade || 'media');

  const { rows } = await pool.query(`
    INSERT INTO tarefas (texto, coluna, ordem, projeto_id, usuario_id, id_prioridades)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [titulo, coluna || 'afazer', ordem || 0, projetoId, usuarioId, prioridadeId]);

  return await buscarPorId(rows[0].id, usuarioId);
}

async function atualizar(id, usuarioId, { titulo, coluna, ordem, projetoId, prioridade }) {
  let prioridadeId = null;
  if (prioridade) {
    prioridadeId = await buscarPrioridadeId(prioridade);
  }

  const { rows } = await pool.query(`
    UPDATE tarefas
    SET texto = COALESCE($1, texto),
        coluna = COALESCE($2, coluna),
        ordem = COALESCE($3, ordem),
        projeto_id = COALESCE($4, projeto_id),
        id_prioridades = COALESCE($5, id_prioridades)
    WHERE id = $6 AND usuario_id = $7
    RETURNING id
  `, [titulo, coluna, ordem, projetoId, prioridadeId, id, usuarioId]);

  if (rows.length === 0) return null;

  return await buscarPorId(id, usuarioId);
}

async function remover(id, usuarioId) {
  const { rows } = await pool.query(`
    DELETE FROM tarefas
    WHERE id = $1 AND usuario_id = $2
    RETURNING id
  `, [id, usuarioId]);

  return rows[0] || null;
}

module.exports = {
  listar,
  buscarPorId,
  adicionar,
  atualizar,
  remover
};