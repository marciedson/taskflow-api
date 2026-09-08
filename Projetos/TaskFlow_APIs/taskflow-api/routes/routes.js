const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');

router.get('/', tarefasController.listarTodas);
router.get('/:id', tarefasController.buscarPorId);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.deletar);

module.exports = router;