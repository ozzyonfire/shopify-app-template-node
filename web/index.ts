import express from 'express';
import next from 'next';

const app = express();
const nextApp = next({
  dev: process.env.NODE_ENV !== 'production',
  dir: './frontend',
});

const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  app.get('*', (req, res) => handle(req, res));

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
});