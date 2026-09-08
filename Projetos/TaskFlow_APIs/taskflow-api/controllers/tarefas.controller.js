const Tarefa = require('../models/tarefa.model');

exports.listarTodas = (req, res) => {
    try {
        const tarefas = Tarefa.listar();
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefas', detalhes: error.message });
    }
};

exports.buscarPorId = (req, res) => {
    try {
        const { id } = req.params;
        const tarefa = Tarefa.buscarPorId(id);

        if (!tarefa) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        res.status(200).json(tarefa);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefa', detalhes: error.message });
    }
};

exports.criar = (req, res) => {
    try {
        const { titulo, descricao, projetoId, usuarioId } = req.body;

        if (!titulo) {
            return res.status(400).json({ erro: 'O título da tarefa é obrigatório' });
        }

        const novaTarefa = Tarefa.criar({
            titulo,
            descricao: descricao || '',
            status: 'pendente',
            projetoId: projetoId || null,
            usuarioId: usuarioId || null
        });

        res.status(201).json({ mensagem: 'Tarefa criada com sucesso!', tarefa: novaTarefa });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar tarefa', detalhes: error.message });
    }
};

exports.atualizar = (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, status, projetoId, usuarioId } = req.body;

        const tarefaExistente = Tarefa.buscarPorId(id);
        if (!tarefaExistente) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        const tarefaAtualizada = Tarefa.atualizar(id, { titulo, descricao, status, projetoId, usuarioId });
        res.status(200).json({ mensagem: 'Tarefa atualizada com sucesso!', tarefa: tarefaAtualizada });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar tarefa', detalhes: error.message });
    }
};
exports.deletar = (req, res) => {
    try {
        const { id } = req.params;

        const tarefaExistente = Tarefa.buscarPorId(id);
        if (!tarefaExistente) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        Tarefa.deletar(id);
        res.status(200).json({ mensagem: 'Tarefa removida com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar tarefa', detalhes: error.message });
    }
};