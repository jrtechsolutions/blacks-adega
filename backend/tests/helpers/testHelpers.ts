/**
 * Helpers para testes - geração de tokens e dados de teste
 */
import { generateToken } from '../../src/config/jwt';
import { hashPassword } from '../../src/config/bcrypt';
import prisma from '../../src/config/prisma';

export const TEST_PASSWORD = 'TestPassword123!';

export const createTestUser = async (overrides?: Partial<{
  email: string;
  name: string;
  password: string;
  role: string;
}>) => {
  const email = overrides?.email || `test-${Date.now()}@test.com`;
  const hashedPassword = await hashPassword(overrides?.password || TEST_PASSWORD);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: overrides?.name || 'Test User',
      password: hashedPassword,
      cpf: `0000000${(Date.now() % 100000).toString().padStart(5, '0')}`,
      role: (overrides?.role as any) || 'USER',
      active: true,
    },
    update: { password: hashedPassword, role: (overrides?.role as any) || 'USER' },
  });
  return user;
};

export const getAuthToken = (user: { id: string; email: string; role: string }) => {
  return generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};
