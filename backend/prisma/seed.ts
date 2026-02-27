/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // Log das tabelas existentes
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tabelas existentes no banco:', tables.map(t => t.table_name));

 /* // Apagar todas as tabelas do banco (exceto _prisma_migrations)
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations') LOOP
        EXECUTE 'TRUNCATE TABLE \"' || r.tablename || '\" CASCADE;';
      END LOOP;
    END $$;
  `);
  console.log('Tabelas apagadas com sucesso!');

  // Criar usuário admin
  const adminEmail = 'pauloesjr2@gmail.com';
  const adminPassword = 'Paulo1308**';

  // Verificar se já existe um admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Criar admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        cpf: '00000000000', // CPF padrão para admin
        active: true,
      },
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nome:', admin.name);
  } else {
    console.log('ℹ️ Admin já existe, pulando criação...');
  }

  // Adicionar categorias
  const categorias = [
    'Refrigerantes',
    'Energéticos',
    'GIN',
    'Vinhos',
    'Drinks',
    'Gelos',
    'Cervejas',
    'Whiskys',
    'Descartáveis',
    'Doses',
    'Combos',
    'Salgadinhos',
    'Churrasco',
    'Essências',
    'Carvão',
    'Alumínio',
    'Cigarros',
    'Destilados'
    
  ];
  // Verificar e criar categorias (evitar duplicatas)
  for (const name of categorias) {
    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: { name, active: true },
      });
    }
  }
  console.log('✅ Categorias verificadas/criadas com sucesso!');

*/
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {}; 