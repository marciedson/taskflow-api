const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const usuarioModel = require('../models/usuario.model');

const authController = {
  async login(req, res) {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    try {
      const { rows } = await pool.query(
        `SELECT id, nome, email, senha_hash
         FROM usuarios
         WHERE lower(email) = lower($1)
         LIMIT 1`,
        [String(email).trim()]
      );

      const usuarioBanco = rows[0];
      const usuarioJson = usuarioBanco
        ? null
        : usuarioModel.listar().find(
            usuario => String(usuario.email).toLowerCase() === String(email).trim().toLowerCase()
          );
      const usuario = usuarioBanco || usuarioJson;

      if (!usuario || (usuarioBanco
        ? usuarioBanco.senha_hash !== senha
        : usuarioJson.senha !== senha)) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
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