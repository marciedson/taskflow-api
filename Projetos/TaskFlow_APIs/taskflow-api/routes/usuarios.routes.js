const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.get('/', usuariosController.listarTodos);
router.post('/', usuariosController.criar);
router.put('/:id', usuariosController.atualizar);
router.delete('/:id', usuariosController.deletar);
router.get('/:id', usuariosController.buscarPorId);

module.exports = router;