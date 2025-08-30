require('dotenv').config()

import express from 'express';
const app = express();


const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});