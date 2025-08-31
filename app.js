import loadConfig from './config/readConfig.js';
import express from 'express';
import Logger from './logs/Logger.js';

loadConfig();

const app = express();

app.get('/', (req, res) => {
  res.json(req.query);
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});