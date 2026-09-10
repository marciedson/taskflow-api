const assert = require('assert');

const tarefasController = require('../controllers/tarefas.controller');
const usuarioController = require('../controllers/usuarios.controller');
const projetoController = require('../controllers/projetos.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

assert.strictEqual(typeof tarefasController.listarTodas, 'function');
assert.strictEqual(typeof tarefasController.estatisticas, 'function');
assert.strictEqual(typeof tarefasController.estatisticasResumo, 'function');
assert.strictEqual(typeof usuarioController.listarTodos, 'function');
assert.strictEqual(typeof projetoController.listarTodos, 'function');
assert.strictEqual(typeof validar, 'function');
assert.strictEqual(typeof schemas, 'object');
assert.strictEqual(typeof schemas.tarefa, 'object');
assert.strictEqual(typeof schemas.usuario, 'object');
assert.strictEqual(typeof schemas.projeto, 'object');

require('../routes/tarefas.routes');
require('../routes/usuarios.routes');
require('../routes/projetos.routes');

console.log('smoke test ok');
