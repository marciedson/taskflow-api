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

    if (!rows[0].id) throw new Error(`Prioridade '${prioridade}' não encontrada no banco`);
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

async function criar(tarefa) {
    const prioridadeId = await buscarPrioridadeId(tarefa.prioridade);
    const { rows } = await pool.query(`
        WITH nova AS (
            INSERT INTO tarefas (texto, coluna, projeto_id, usuario_id, id_prioridades)
            SELECT $1, $2, $3, $4, $5
            WHERE EXISTS (
                SELECT 1 FROM projetos
                WHERE id = $3 AND usuario_id = $4
            )
            RETURNING *
        )
        SELECT ${camposTarefa}
        FROM nova t
        LEFT JOIN prioridades p ON p.id = t.id_prioridades
    `, [tarefa.titulo, tarefa.coluna || 'afazer', tarefa.projetoId, tarefa.usuarioId, prioridadeId]);

    return rows[0] || null;
}

async function atualizar(id, tarefaAtualizada, usuarioId) {
    const campos = [];
    const valores = [];
    const adicionarCampo = (coluna, valor) => {
        valores.push(valor);
        campos.push(`${coluna} = $${valores.length}`);
    };

    if (Object.hasOwn(tarefaAtualizada, 'titulo')) adicionarCampo('texto', tarefaAtualizada.titulo);
    if (Object.hasOwn(tarefaAtualizada, 'coluna')) adicionarCampo('coluna', tarefaAtualizada.coluna);
    if (Object.hasOwn(tarefaAtualizada, 'projetoId')) adicionarCampo('projeto_id', tarefaAtualizada.projetoId);
    if (Object.hasOwn(tarefaAtualizada, 'prioridade')) {
        adicionarCampo('id_prioridades', await buscarPrioridadeId(tarefaAtualizada.prioridade));
    }

    if (campos.length === 0) return buscarPorId(id, usuarioId);

    valores.push(id, usuarioId);
    const idParametro = valores.length - 1;
    const usuarioParametro = valores.length;
    const projetoAtualizado = Object.hasOwn(tarefaAtualizada, 'projetoId');
    const filtroProjeto = projetoAtualizado
        ? `AND EXISTS (
            SELECT 1 FROM projetos
            WHERE id = $${campos.findIndex(campo => campo.startsWith('projeto_id =')) + 1}
                AND usuario_id = $${usuarioParametro}
        )`
        : '';

    const { rows } = await pool.query(`
        WITH atualizada AS (
            UPDATE tarefas
            SET ${campos.join(', ')}
            WHERE id = $${idParametro} AND usuario_id = $${usuarioParametro}
            ${filtroProjeto}
            RETURNING *
        )
        SELECT ${camposTarefa}
        FROM atualizada t
        LEFT JOIN prioridades p ON p.id = t.id_prioridades
    `, valores);

    return rows[0] || null;
}

async function deletar(id, usuarioId) {
    const { rows } = await pool.query(
        'DELETE FROM tarefas WHERE id = $1 AND usuario_id = $2 RETURNING id',
        [id, usuarioId]
    );

    return rows[0] || null;
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };