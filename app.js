import './config/readConfig.js';

import express from 'express';
import routesLogs from './middleware/routesLogs.js';
import userRoutes from './routes/User.js';
import configRoutes from './routes/Config.js';

const app = express();

// Middlewares
app.use(express.json()); 
app.use(routesLogs); 
app.use(express.static('public')); 

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);

// Rota de Teste
app.get('/', (req, res) => {
  res.send('<h1>API is running</h1><p>Acesse /index.html para testar o login.</p>');
});

const port = parseInt(process.env.SERVER_PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
