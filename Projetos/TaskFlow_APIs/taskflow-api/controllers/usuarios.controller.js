const Usuario = require('../models/usuario.model');
exports.listarTodos = async (req, res) => {
    try {
        const usuarios = await Usuario.listar();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: error.message });
    }
};

exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: error.message });
    }
};
exports.criar = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
        }

        const novoUsuario = await Usuario.criar({ nome, email, senha });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: novoUsuario });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
        }
        res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: error.message });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        if (Number(id) !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode atualizar seus próprios dados' });
        }
        const { nome, email, senha } = req.body;

        const usuarioExistente = await Usuario.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        const usuarioAtualizado = await Usuario.atualizar(id, { nome, email, senha });
        if (!usuarioAtualizado) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
        }
        res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: error.message });
    }
};
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        if (Number(id) !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode remover sua própria conta' });
        }

        const removido = await Usuario.deletar(id);
        if (!removido) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.status(200).json({ mensagem: 'Usuário removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar usuário', detalhes: error.message });
    }
};