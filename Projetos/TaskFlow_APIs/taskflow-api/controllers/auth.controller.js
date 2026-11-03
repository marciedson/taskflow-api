const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const { hashPassword, verifyPassword } = require('../utils/password');

const authController = {
  async login(req, res) {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    try {
      const usuario = await usuarioModel.buscarPorEmail(email);
      if (!usuario || !(await verifyPassword(String(senha), usuario.senha_hash))) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      if (!usuario.senha_hash.startsWith('$2')) {
        await usuarioModel.atualizarSenha(usuario.id, await hashPassword(String(senha)));
      }

      const segredoJwt = process.env.JWT_SECRET || 'taskflow-local-secret';
      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email },
        segredoJwt,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
      );

      return res.json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao fazer login', detalhes: error.message });
    }
  }
};

module.exports = authController;