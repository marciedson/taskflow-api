const express = require('express');
const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const temporizador = require('./controllers/middlewares/logger');
const corsMiddleware = require('./controllers/middlewares/cors');

const app = express();
app.use(temporizador);
const PORTA = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'TaskFlow API funcionando!' });
});

app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(corsMiddleware);

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});