const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');
const autenticar = require('../middlewares/autenticar');

router.get('/', autenticar, usuariosController.listarTodos);
router.post('/', validar(schemas.usuario), usuariosController.criar);
router.put('/:id', autenticar, validar(schemas.usuario), usuariosController.atualizar);
router.delete('/:id', autenticar, usuariosController.deletar);
router.get('/:id', autenticar, usuariosController.buscarPorId);

module.exports = router;