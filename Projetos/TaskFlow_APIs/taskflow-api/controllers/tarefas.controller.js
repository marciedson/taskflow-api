const Tarefa = require('../models/tarefas.model');

exports.listarTodas = async (req, res) => {
    try {
        const tarefas = await Tarefa.listar(req.usuario.id);
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefas', detalhes: error.message });
    }
};

exports.buscarPorId = async (req, res) => {
    try {
        const tarefa = await Tarefa.buscarPorId(req.params.id, req.usuario.id);

        if (!tarefa) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        res.status(200).json(tarefa);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefa', detalhes: error.message });
    }
};

exports.criar = async (req, res) => {
    try {
        const { titulo, prioridade, coluna } = req.body;
        const projetoIdInformado = req.body.projetoId ?? req.body.projeto_id;
        const projetoId = Number(projetoIdInformado);

        if (!Number.isInteger(projetoId) || projetoId <= 0) {
            return res.status(400).json({ erro: 'Um projetoId válido é obrigatório para criar uma tarefa' });
        }

        const tarefa = await Tarefa.criar({
            titulo,
            prioridade,
            coluna: coluna || 'afazer',
            projetoId,
            usuarioId: req.usuario.id
        });

        if (!tarefa) {
            return res.status(404).json({ erro: 'Projeto não encontrado para este usuário' });
        }

        res.status(201).json({ mensagem: 'Tarefa criada com sucesso!', tarefa });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar tarefa', detalhes: error.message });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const atualizacao = {};
        for (const campo of ['titulo', 'prioridade', 'coluna']) {
            if (Object.hasOwn(req.body, campo)) atualizacao[campo] = req.body[campo];
        }

        const projetoIdInformado = req.body.projetoId ?? req.body.projeto_id;
        if (projetoIdInformado !== undefined) {
            const projetoId = Number(projetoIdInformado);
            if (!Number.isInteger(projetoId) || projetoId <= 0) {
                return res.status(400).json({ erro: 'O projetoId deve ser um número válido' });
            }
            atualizacao.projetoId = projetoId;
        }

        const tarefa = await Tarefa.atualizar(req.params.id, atualizacao, req.usuario.id);
        if (!tarefa) {
            return res.status(404).json({ erro: 'Tarefa ou projeto não encontrado para este usuário' });
        }

        res.status(200).json({ mensagem: 'Tarefa atualizada com sucesso!', tarefa });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar tarefa', detalhes: error.message });
    }
};

exports.deletar = async (req, res) => {
    try {
        const removida = await Tarefa.deletar(req.params.id, req.usuario.id);
        if (!removida) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        res.status(200).json({ mensagem: 'Tarefa removida com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar tarefa', detalhes: error.message });
    }
};

exports.estatisticas = async (req, res) => {
    try {
        const tarefas = await Tarefa.listar(req.usuario.id);
        res.status(200).json({
            total: tarefas.length,
            concluidas: tarefas.filter(t => t.coluna === 'concluido').length,
            pendentes: tarefas.filter(t => t.coluna === 'afazer').length
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar estatísticas', detalhes: error.message });
    }
};

exports.estatisticasResumo = async (req, res) => {
    try {
        const tarefas = await Tarefa.listar(req.usuario.id);
        const resumo = {
            total: tarefas.length,
            concluidas: tarefas.filter(t => t.coluna === 'concluido').length,
            pendentes: tarefas.filter(t => t.coluna === 'afazer').length,
            emAndamento: tarefas.filter(t => t.coluna === 'andamento').length
        };

        res.status(200).json({ resumo });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar resumo de estatísticas', detalhes: error.message });
    }
};