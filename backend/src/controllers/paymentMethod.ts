import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const paymentMethodController = {
  list: async (req: Request, res: Response) => {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
    res.json(methods);
  },
  create: async (req: Request, res: Response) => {
    try {
      const { name, active } = req.body;
      console.log('[Pagamento] POST /payment-methods - recebido', { name, active });
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Nome do método é obrigatório.' });
      }
      const method = await prisma.paymentMethod.create({
        data: { name: name.trim(), active: active !== false }
      });
      console.log('[Pagamento] Método criado com sucesso', { id: method.id, name: method.name });
      return res.status(201).json(method);
    } catch (error: any) {
      console.error('[Pagamento] Erro ao criar método:', error);
      if (error?.code === 'P2002') {
        return res.status(400).json({ error: 'Já existe um método de pagamento com esse nome.' });
      }
      return res.status(500).json({ error: 'Erro ao cadastrar método de pagamento.' });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, active } = req.body;
      console.log('[Pagamento] PUT /payment-methods/:id - recebido', { id, name, active });
      const method = await prisma.paymentMethod.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: typeof name === 'string' ? name.trim() : name }),
          ...(active !== undefined && { active })
        }
      });
      console.log('[Pagamento] Método atualizado com sucesso', { id: method.id });
      return res.json(method);
    } catch (error: any) {
      console.error('[Pagamento] Erro ao atualizar método:', error);
      if (error?.code === 'P2002') {
        return res.status(400).json({ error: 'Já existe um método de pagamento com esse nome.' });
      }
      return res.status(500).json({ error: 'Erro ao atualizar método de pagamento.' });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log('[Pagamento] DELETE /payment-methods/:id - recebido', { id });
      await prisma.paymentMethod.delete({ where: { id } });
      console.log('[Pagamento] Método removido com sucesso', { id });
      return res.json({ success: true });
    } catch (error: any) {
      console.error('[Pagamento] Erro ao remover método:', error);
      return res.status(500).json({ error: 'Erro ao remover método de pagamento.' });
    }
  },
  get: async (req: Request, res: Response) => {
    const { id } = req.params;
    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    res.json(method);
  },
}; 