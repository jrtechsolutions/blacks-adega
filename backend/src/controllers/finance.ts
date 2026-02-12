import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { OrderStatus, PixPaymentStatus, SaleStatus, Prisma } from '@prisma/client';

interface DoseItemWithProduct {
  quantity: number;
  product: {
    costPrice: number;
    totalVolume?: number | null;
  };
}

interface DoseWithItems {
  items: DoseItemWithProduct[];
}

export const financeController = {
  report: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      // Ajustar filtro de datas para ignorar horário
      let start = startDate ? new Date(startDate as string) : undefined;
      let end = endDate ? new Date(endDate as string) : undefined;
      if (end) {
        // Adiciona 1 dia para pegar até o final do dia
        end.setDate(end.getDate() + 1);
      }
      const dateFilter2: any = {};
      if (start) dateFilter2.gte = start;
      if (end) dateFilter2.lt = end;

      // Buscar vendas do Sale (PDV/Admin) - status COMPLETED
      const salesData = await prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          ...(Object.keys(dateFilter2).length > 0 ? { createdAt: dateFilter2 } : {})
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }) as any[];
      
      // Filtrar itens com produtos nulos
      const safeSalesData = salesData.map(sale => ({
        ...sale,
        items: sale.items.filter((item: any) => item.product !== null)
      }));

      // Buscar vendas do Order (Delivery/App) - status DELIVERED
      const ordersData = await prisma.order.findMany({
        where: {
          status: 'DELIVERED',
          ...(Object.keys(dateFilter2).length > 0 ? { createdAt: dateFilter2 } : {})
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }) as any[];
      
      // Filtrar itens com produtos nulos
      const safeOrdersData = ordersData.map(order => ({
        ...order,
        items: order.items.filter((item: any) => item.product !== null)
      }));

      // Calcular total de vendas e custo
      let total_sales = 0;
      let total_cost = 0;

      const processItems = (items: any[], sourceId: string, sourceType: 'Sale' | 'Order') => {
        items.forEach((item: any) => {
          // Usa o preço de venda que foi salvo no item. Para combos, o preço total pode estar em um único item.
          const itemTotal = Number(item.price);
          let itemCost = 0;

          const quantity = Number(item.quantity) || 0;
          // costPrice no item é sempre o custo da GARRAFA inteira (para produto fracionado) ou custo unitário.
          const costAtTimeOfSale = Number(item.costPrice) || 0;

          const bottleVolume = Number(item.product?.unitVolume) || 1000; // Volume da garrafa em ml
          const isFractioned = !!(item.product?.isFractioned ?? item.isFractioned);
          // Sale tem isDoseItem; Order pode indicar dose por doseId
          const isDoseItem = !!item.isDoseItem || !!item.doseId;

          // Regra 1: Venda por DOSE → custo = (custo da garrafa / ml da garrafa) * ml vendido
          if (isFractioned && isDoseItem) {
            const costPerMl = bottleVolume > 0 ? costAtTimeOfSale / bottleVolume : 0;
            itemCost = costPerMl * quantity;

            console.log(`- Item: ${item.product.name} (Venda de Dose)`);
            console.log(`  Fonte: ${sourceType} ID: ${sourceId}`);
            console.log(`  isDoseItem: true, quantity (ml vendido): ${quantity}`);
            console.log(`  Preço Registrado: R$ ${itemTotal.toFixed(2)}`);
            console.log(`  Custo da Garrafa: R$ ${costAtTimeOfSale.toFixed(2)}`);
            console.log(`  Volume da Garrafa: ${bottleVolume}ml`);
            console.log(`  Custo por ml: R$ ${costPerMl.toFixed(4)}`);
            console.log(`  Custo Total do Item (${costPerMl.toFixed(4)} x ${quantity}ml): R$ ${itemCost.toFixed(2)}`);
          }
          // Regra 2: Produto fracionado vendido inteiro (Avulso, Combo, Promoção ou Oferta) → custo = custo da garrafa
          else if (isFractioned && !isDoseItem) {
            itemCost = costAtTimeOfSale;

            console.log(`- Item: ${item.product.name} (Garrafa inteira - Avulso/Combo/Promo/Oferta)`);
            console.log(`  Fonte: ${sourceType} ID: ${sourceId}`);
            console.log(`  isDoseItem: false, quantity registrado: ${quantity} (volume da garrafa em ml)`);
            console.log(`  Preço Registrado: R$ ${itemTotal.toFixed(2)}`);
            console.log(`  Custo da Garrafa Inteira: R$ ${costAtTimeOfSale.toFixed(2)}`);
            console.log(`  Custo Total do Item: R$ ${itemCost.toFixed(2)}`);
          }
          // Regra 3: Produto não fracionado → custo = custo unitário × quantidade
          else {
            itemCost = costAtTimeOfSale * quantity;

            console.log(`- Item: ${item.product.name} (Venda Normal)`);
            console.log(`  Fonte: ${sourceType} ID: ${sourceId}`);
            console.log(`  Preço Registrado: R$ ${itemTotal.toFixed(2)}`);
            console.log(`  Quantidade: ${quantity}`);
            console.log(`  Custo Unitário Salvo: R$ ${costAtTimeOfSale.toFixed(2)}`);
            console.log(`  Custo Total do Item: R$ ${itemCost.toFixed(2)}`);
          }

          total_sales += itemTotal;
          total_cost += itemCost;
        });
      };

      console.log('\n=== Detalhamento das Vendas (Sale) ===');
      // Processar vendas do Sale
      safeSalesData.forEach(sale => {
        console.log(`\nVenda ID: ${sale.id}`);
        processItems(sale.items, sale.id, 'Sale');
      });

      console.log('\n=== Detalhamento dos Pedidos (Order) ===');
      // Processar vendas do Order
      safeOrdersData.forEach(order => {
        console.log(`\nPedido ID: ${order.id}`);
        processItems(order.items, order.id, 'Order');
      });

      console.log('\n=== Resumo Financeiro ===');
      console.log(`Total de Vendas: R$ ${total_sales.toFixed(2)}`);
      console.log(`Total de Custos: R$ ${total_cost.toFixed(2)}`);

      const gross_profit = total_sales - total_cost;

      // Buscar despesas (accounts_payable)
      const expenses = await prisma.accountPayable.findMany({
        where: Object.keys(dateFilter2).length > 0 ? { createdAt: dateFilter2 } : {},
      });
      const total_expenses = expenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

      const net_profit = gross_profit - total_expenses;

      console.log('Filtro de datas recebido:', { startDate, endDate, dateFilter2 });
      console.log('Vendas (Sale) encontradas:', safeSalesData.length);
      console.log('Pedidos (Order) encontrados:', safeOrdersData.length);

      res.json({
        total_sales: Number(total_sales.toFixed(2)),
        total_cost: Number(total_cost.toFixed(2)),
        gross_profit: Number(gross_profit.toFixed(2)),
        total_expenses: Number(total_expenses.toFixed(2)),
        net_profit: Number(net_profit.toFixed(2))
      });
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
    }
  }
}; 