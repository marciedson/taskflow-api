const express = require('express');
const app = express();
const PORTA = 3000;

app.use(express.json());


let tarefas = [
    { id: 1, texto: 'Estudar Express', prioridade: 'alta', coluna: 'fazer', cidade: 'SP' },
    { id: 2, texto: 'Criar rotas API', prioridade: 'media', coluna: 'em andamento', cidade: 'RJ' },
    { id: 3, texto: 'Testar com Postman', prioridade: 'baixa', coluna: 'fazer', cidade: 'SP' }
];
let proximoId = 4;


let usuarios = [
    { id: 1, nome: 'admin', email: 'admin@taskflow.com', senha: '1234' }
];
let proximoIdUsuario = 2;


app.get('/', (req, res) => {
    res.json({ mensagem: 'TaskFlow API funcionando!', status: 'ok' });
});


app.get('/ok', (req, res) => res.json({ status: 'ok', dados: [1, 2, 3] }));
app.get('/criado', (req, res) => res.status(201).json({ mensagem: 'Criado com sucesso!' }));
app.get('/erro', (req, res) => res.status(400).json({ erro: 'Dados inválidos' }));
app.get('/texto', (req, res) => res.send('Resposta em texto simples'));


// --- ROTAS DE TAREFAS ---

app.get('/tarefas', (req, res) => {
    const { coluna, prioridade } = req.query;
    let resultado = tarefas;

    if (coluna) {
        resultado = resultado.filter(t => t.coluna === coluna);
    }
    if (prioridade) {
        resultado = resultado.filter(t => t.prioridade === prioridade);
    }

    res.json(resultado);
});

app.get('/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    const tarefa = tarefas.find(t => t.id === id);

    if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json(tarefa);
});

app.post('/tarefas', (req, res) => {
    const { texto, prioridade, coluna, cidade } = req.body;

    if (!texto) {
        return res.status(400).json({ erro: 'O campo "texto" é obrigatório.' });
    }

    const novaTarefa = {
        id: proximoId++,
        texto,
        prioridade: prioridade || 'media',
        coluna: coluna || 'a fazer',
        cidade: cidade || ''
    };

    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

app.put('/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    const { texto, prioridade, coluna, cidade } = req.body;

    const indice = tarefas.findIndex(t => t.id === id);
    if (indice === -1) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    const tarefaAtualizada = {
        id,
        texto: texto !== undefined ? texto : tarefas[indice].texto,
        prioridade: prioridade || tarefas[indice].prioridade,
        coluna: coluna || tarefas[indice].coluna,
        cidade: cidade || tarefas[indice].cidade
    };

    tarefas[indice] = tarefaAtualizada;
    res.json(tarefaAtualizada);
});

app.delete('/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    const indice = tarefas.findIndex(t => t.id === id);

    if (indice === -1) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    tarefas.splice(indice, 1);
    res.json({ mensagem: 'Tarefa removida', id });
});



app.get('/usuarios', (req, res) => {
    res.json(usuarios);
});


app.get('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
});


app.post('/usuarios', (req, res) => {
    const { nome, email, senha } = req.body;

    const emailExiste = usuarios.some(u => u.email === email);
    if (emailExiste) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    const novoUsuario = {
        id: proximoIdUsuario++,
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);
    res.status(201).json(novoUsuario);
});

app.put('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nome, email, senha } = req.body;

    const indice = usuarios.findIndex(u => u.id === id);

    if (indice === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuarioAtualizado = {
        id,
        nome: nome !== undefined ? nome : usuarios[indice].nome,
        email: email !== undefined ? email : usuarios[indice].email,
        senha: senha !== undefined ? senha : usuarios[indice].senha
    };

    usuarios[indice] = usuarioAtualizado;
    res.json(usuarioAtualizado);
});


app.delete('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const indice = usuarios.findIndex(u => u.id === id);

    if (indice === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuarios.splice(indice, 1);
    res.json({ mensagem: 'Usuário removido', id });
});



app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        metodo: req.method,
        caminho: req.url
    });
});




app.listen(PORTA, () => {
    console.log(`TaskFlow API — ouvindo na porta ${PORTA}`);
});