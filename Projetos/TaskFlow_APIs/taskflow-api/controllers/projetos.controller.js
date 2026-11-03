const Projeto = require('../models/projeto.model');
exports.listarTodos = async (req, res) => {
    try {
        const projetos = await Projeto.listar(req.usuario.id);
        res.status(200).json(projetos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar projetos', detalhes: error.message });
    }
};

exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const projeto = await Projeto.buscarPorId(id, req.usuario.id);

        if (!projeto) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }

        res.status(200).json(projeto);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar projeto', detalhes: error.message });
    }
};

exports.criar = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: 'O campo nome é obrigatório' });
        }

        const novoProjeto = await Projeto.criar({ nome, descricao }, req.usuario.id);
        res.status(201).json({ mensagem: 'Projeto criado com sucesso!', projeto: novoProjeto });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar projeto', detalhes: error.message });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        const projetoAtualizado = await Projeto.atualizar(id, req.usuario.id, { nome, descricao });
        if (!projetoAtualizado) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }
        res.status(200).json({ mensagem: 'Projeto atualizado com sucesso!', projeto: projetoAtualizado });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar projeto', detalhes: error.message });
    }
};
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;

        const removido = await Projeto.deletar(id, req.usuario.id);
        if (!removido) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }

        res.status(200).json({ mensagem: 'Projeto removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar projeto', detalhes: error.message });
    }
};