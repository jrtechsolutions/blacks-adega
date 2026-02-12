import express, { Express } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { env } from './env';
import { errorHandler } from './errorHandler';
import { sanitizeRequest } from './sanitizer';
import { swaggerSpec } from './swagger';
import logger from './logger';
import routes from '../routes';

export const initializeExpress = (app: Express) => {
  // Configurações básicas
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ];

  // Permite múltiplos domínios em FRONTEND_URL separados por vírgula
  if (env.frontendUrl) {
    env.frontendUrl.split(',').forEach((url: string) => {
      const trimmed = url.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  // Log das origens permitidas (sempre, para debug)
  console.log('🌐 CORS - Origens permitidas:', allowedOrigins);
  console.log('🌐 CORS - FRONTEND_URL configurada:', env.frontendUrl);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permite requisições sem origin (ex: Postman, mobile apps)
      if (!origin) {
        console.log('🌐 CORS - Requisição sem origin, permitindo');
        return callback(null, true);
      }

      // Log da origin recebida
      console.log('🌐 CORS - Origin recebida:', origin);

      // Verifica se a origin está na lista de permitidas
      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS - Origin permitida:', origin);
        return callback(null, true);
      }

      // Log de origem bloqueada
      console.warn('⚠️ CORS - Origem bloqueada:', origin);
      console.warn('📋 Origens permitidas:', allowedOrigins);

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200, // Para compatibilidade com alguns navegadores
    preflightContinue: false,
  };

  app.use(cors(corsOptions));

  // Tratamento específico para requisições OPTIONS (preflight)
  app.options('*', cors(corsOptions));

  // Helmet
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // Rate Limiter - Proteção contra DDoS e brute force (desabilitado em testes)
  if (env.nodeEnv !== 'test') {
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limite de 100 requisições por IP
      message: 'Muitas requisições deste IP, tente novamente mais tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api', apiLimiter);
  }

  // Compression
  app.use(compression());

  // Morgan
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));

  // Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Sanitização
  app.use(sanitizeRequest);

  // Log de todas as requisições recebidas
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });

  // Rotas básicas
  app.get('/', (req, res) => {
    res.json({ message: 'API do Sistema PDV - Adega Flow' });
  });

  // Registrando as rotas
  app.use('/api', routes);

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static('uploads'));

  // Error Handler
  app.use(errorHandler);
}; 