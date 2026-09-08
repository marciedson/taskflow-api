const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');

router.get('/', tarefasController.listar);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);
router.get('/:estatisticas', tarefasController.estatisticas);
router.get('/estatisticas/resumo', tarefasController.estatisticasResumo);
router.get('/:id', tarefasController.buscarPorId);

module.exports = router;