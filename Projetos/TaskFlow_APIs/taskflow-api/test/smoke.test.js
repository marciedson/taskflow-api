const assert = require('assert');

const tarefasController = require('../controllers/tarefas.controller');
const usuarioController = require('../controllers/usuarios.controller');
const projetoController = require('../controllers/projetos.controller');

assert.strictEqual(typeof tarefasController.listarTodas, 'function');
assert.strictEqual(typeof tarefasController.estatisticas, 'function');
assert.strictEqual(typeof tarefasController.estatisticasResumo, 'function');
assert.strictEqual(typeof usuarioController.listarTodos, 'function');
assert.strictEqual(typeof projetoController.listarTodos, 'function');

require('../routes/tarefas.routes');
require('../routes/usuarios.routes');
require('../routes/projetos.routes');

console.log('smoke test ok');
