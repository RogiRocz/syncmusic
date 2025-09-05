import './config/readConfig.js';

import express from 'express';
import routesLogs from './middleware/routesLogs.js';
import userRoutes from './routes/User.js';
import playlistRoutes from './routes/Playlist.js';
import trackRoutes from './routes/Track.js';
import configRoutes from './routes/Config.js';
import { isAuthenticaded } from './middleware/Auth.js';

const app = express();

// Middlewares
app.use(express.json()); 
app.use(routesLogs); 
app.use(express.static('public')); 

// Rotas da API
app.use('/api/v1/users', isAuthenticaded, userRoutes);
app.use('/api/v1/playlists', isAuthenticaded, playlistRoutes);
app.use('/api/v1/tracks', isAuthenticaded, trackRoutes);
app.use('/api/v1/config', configRoutes);

// Rota de Teste
app.get('/', (req, res) => {
  res.send('<h1>API is running</h1><p>Acesse /index.html para testar o login.</p>');
});

const port = parseInt(process.env.SERVER_PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
