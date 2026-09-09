const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');

router.get('/', tarefasController.listarTodas);
router.post('/', tarefasController.criar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/estatisticas/resumo', tarefasController.estatisticasResumo);
router.get('/:id', tarefasController.buscarPorId);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.deletar);

module.exports = router;