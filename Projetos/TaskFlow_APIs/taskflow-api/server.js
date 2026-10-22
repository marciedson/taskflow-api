require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const temporizador = require('./middlewares/logger');
const authRoutes = require('./routes/auth.routes');

const pool = require('./database/db');

pool.query('SELECT NOW()', (err, res) => {
   if (err) {
       console.error('Erro ao conectar ao banco de dados:', err.message);
   } else {
       console.log('Conectado ao banco de dados com sucesso!', res.rows[0].now);
   }
});

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
app.options(/(.*)/, cors());
app.use(express.json());
app.use(temporizador);

app.get('/', (req, res) => {
    res.json({ mensagem: 'TaskFlow API funcionando!' });
});

app.use('/tarefas', tarefasRoutes);
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