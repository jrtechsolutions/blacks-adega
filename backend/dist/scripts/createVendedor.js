"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function createVendedor() {
    try {
        const existingVendedor = await prisma.user.findFirst({
            where: { role: 'VENDEDOR' }
        });
        if (existingVendedor) {
            console.log('Vendedor já existe:', existingVendedor.email);
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash('vendedor123', 10);
        const vendedor = await prisma.user.create({
            data: {
                name: 'Vendedor Teste',
                email: 'vendedor@elementadega.com',
                cpf: '12345678901',
                password: hashedPassword,
                role: 'VENDEDOR',
                phone: '11999999999'
            }
        });
        console.log('Vendedor criado com sucesso:');
        console.log('Email:', vendedor.email);
        console.log('Senha: vendedor123');
        console.log('Role:', vendedor.role);
    }
    catch (error) {
        console.error('Erro ao criar vendedor:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createVendedor();
