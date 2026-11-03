require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const temporizador = require('./middlewares/logger');
const authRoutes = require('./routes/auth.routes');
const prisma = require('./database/prisma');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const app = express();
const PORTA = process.env.PORT || 3000;
const origensPermitidas = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.CORS_ORIGIN || '')
        .split(',')
        .map(origem => origem.trim())
        .filter(Boolean)
]);

app.use(cors({
    origin: (origem, callback) => {
        if (!origem || origensPermitidas.has(origem)) {
            callback(null, true);
            return;
        }

        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(temporizador);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
});

app.get('/', (req, res) => {
    res.json({ mensagem: 'TaskFlow API funcionando!' });
});

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', banco: 'conectado' });
    } catch (error) {
        console.error('Erro na verificacao do banco de dados:', error.message);
        res.status(503).json({ status: 'indisponivel', banco: 'desconectado' });
    }
});

app.use('/tarefas', tarefasRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

if (require.main === module) {
    app.listen(PORTA, () => {
        console.log(`Servidor rodando em http://localhost:${PORTA}`);
    });
}

module.exports = app;