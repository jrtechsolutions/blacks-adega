/**
 * Setup global para testes
 * Define NODE_ENV=test para evitar inicialização de cron, socket, sentry
 */
process.env.NODE_ENV = 'test';
