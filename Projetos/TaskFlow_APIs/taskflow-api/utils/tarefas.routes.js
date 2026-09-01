const express = require('express');
const router = express.Router();

let tarefas = [
    { id: 1, texto: 'Estudar Express', prioridade: 'alta', coluna: 'fazer', cidade: 'Natal' },
    { id: 2, texto: 'Criar rotas API', prioridade: 'media', coluna: 'em andamento', cidade: 'Ceará-Mirim' },
    { id: 3, texto: 'Testar com Postman', prioridade: 'baixa', coluna: 'fazer', cidade: 'Parnamirim' }
];
let proximoId = 4;

router.get('/', (req, res) => {
    const { coluna } = req.query;
    let resultado = tarefas;

    if (coluna) {
        resultado = tarefas.filter(t => t.coluna === coluna);
    }
    res.json(resultado);
});


router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const tarefa = tarefas.find(t => t.id === id);

    if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa nao encontrada' });
    }
    res.json(tarefa);
});