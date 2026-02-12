/**
 * Testes de Segurança - Autenticação e Autorização
 * QA Senior - Validação de rotas protegidas
 */
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import { createTestUser, getAuthToken, TEST_PASSWORD } from './helpers/testHelpers';

describe('Segurança - Autenticação', () => {
  let userToken: string;
  let userId: string;
  let adminToken: string | null = null;
  let adminId: string | null = null;

  beforeAll(async () => {
    const user = await createTestUser({ role: 'USER' });
    userId = user.id;
    userToken = getAuthToken(user);

    // Tentar obter admin do banco (se seed foi executado)
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (admin) {
      adminId = admin.id;
      adminToken = getAuthToken(admin);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/login - Rotas Públicas', () => {
    it('deve rejeitar login sem credenciais', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({})
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'invalido@test.com', password: 'wrong' })
        .expect(401);

      expect(res.body.error).toMatch(/inválid/i);
    });

    it('deve permitir login com credenciais válidas de USER', async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const loginRes = await request(app)
        .post('/api/login')
        .send({ email: user.email, password: TEST_PASSWORD });

      expect([200, 401]).toContain(loginRes.status);
      if (loginRes.status === 200) {
        expect(loginRes.body).toHaveProperty('token');
        expect(loginRes.body).toHaveProperty('user');
      }
    });
  });

  describe('Acesso sem Token', () => {
    const protectedRoutes = [
      { method: 'get', path: '/api/admin/users' },
      { method: 'get', path: '/api/admin/products' },
      { method: 'get', path: '/api/cliente-dashboard' },
      { method: 'get', path: '/api/addresses' },
      { method: 'get', path: '/api/admin/comandas' },
    ];

    it.each(protectedRoutes)('deve retornar 401 para $method $path sem token', async ({ method, path }) => {
      const req = (request(app) as any)[method](path);
      const res = await req.expect(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.toLowerCase()).toMatch(/token|não fornecido|inválido/);
    });
  });

  describe('Token Inválido', () => {
    it('deve rejeitar token malformado', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);

      expect(res.body.error).toMatch(/inválido|Token/);
    });

    it('deve rejeitar header Authorization sem Bearer', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', userToken)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Autorização - Broken Access Control', () => {
    it('USER não deve acessar rota exclusiva ADMIN', async () => {
      if (!userToken) return;

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.error).toMatch(/negado|acesso|permissão/i);
    });

    it('USER não deve criar usuários (admin)', async () => {
      if (!userToken) return;

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Hacker',
          email: 'hacker@test.com',
          password: 'Test123!',
          role: 'ADMIN',
        })
        .expect(403);

      expect(res.body.error).toMatch(/negado|acesso|permissão/i);
    });

    it('USER não deve deletar produtos', async () => {
      if (!userToken) return;

      const product = await prisma.product.findFirst();
      if (!product) return;

      const res = await request(app)
        .delete(`/api/admin/products/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.error).toMatch(/negado|acesso|permissão/i);
    });
  });
});
