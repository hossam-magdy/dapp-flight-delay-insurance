import cors from 'cors';
import express from 'express';
import { flights } from './data';

const PORT = process.env.PORT || '3000';

// STEP: send harcoded flight numbers and timestamps for the DAPP
const api = express()
  .use(cors())
  .get('/api', (_req, res) => {
    res.send({ flights });
  });

const apiStart = () =>
  api.listen(PORT, () => {
    console.log(`- Started listening at port: ${PORT}`);
    console.log(`- Check: http://localhost:${PORT}/api`);
  });

export { api, apiStart };
