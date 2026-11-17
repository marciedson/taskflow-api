const express = require('express');
const router = express.Router();
const prioridadesController = require('../controllers/prioridades.controller');
const autenticar = require('../middlewares/autenticar');

router.use(autenticar);
router.get('/', prioridadesController.listarTodas);

module.exports = router;
