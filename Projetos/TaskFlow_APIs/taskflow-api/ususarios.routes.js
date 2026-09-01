const express = require('express');
const router = express.Router();

let usuarios = [];
let proximoId = 1;

router.get('/', (req, res) => {
  res.json(usuarios);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  res.json(usuario);
});

router.post('/', (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ mensagem: 'Nome e e-mail são obrigatórios' });
  }

  const emailExiste = usuarios.some(u => u.email === email);
  if (emailExiste) {
    return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
  }

  const novoUsuario = {
    id: proximoId++,
    nome,
    email
  };

  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email } = req.body;

  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  if (nome) usuario.nome = nome;
  if (email) {
    const emailExiste = usuarios.some(u => u.email === email && u.id !== id);
    if (emailExiste) {
      return res.status(400).json({ mensagem: 'E-mail já está em uso por outro usuário' });
    }
    usuario.email = email;
  }

  res.json(usuario);
});


router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  usuarios.splice(index, 1);
  res.status(204).send();
});

module.exports = router;