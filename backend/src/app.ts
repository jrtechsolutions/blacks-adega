/**
 * Exporta o app Express configurado para uso em testes e server
 */
import express from 'express';
import { initializeExpress } from './config/express';

const app = express();
initializeExpress(app);

export default app;
