"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendedorController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errorHandler_1 = require("../config/errorHandler");
exports.vendedorController = {
    async getDashboard(req, res) {
        var _a, _b, _c, _d;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const [totalProducts, lowStockProducts, totalCategories, recentSales] = await Promise.all([
                prisma_1.default.product.count({
                    where: { active: true }
                }),
                prisma_1.default.product.count({
                    where: {
                        active: true,
                        stockStatus: 'LOW_STOCK'
                    }
                }),
                prisma_1.default.category.count({
                    where: { active: true }
                }),
                prisma_1.default.sale.count({
                    where: {
                        userId: userId,
                        createdAt: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                })
            ]);
            res.json({
                success: true,
                data: {
                    totalProducts,
                    lowStockProducts,
                    totalCategories,
                    recentSales,
                    user: {
                        id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                        email: (_c = req.user) === null || _c === void 0 ? void 0 : _c.email,
                        role: (_d = req.user) === null || _d === void 0 ? void 0 : _d.role
                    }
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar dashboard do vendedor:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },
    async getProducts(req, res) {
        try {
            const { page = 1, limit = 10, search = '', category = '' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {
                active: true
            };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { barcode: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (category) {
                where.categoryId = category;
            }
            const [products, total] = await Promise.all([
                prisma_1.default.product.findMany({
                    where,
                    include: {
                        category: true,
                        supplier: true
                    },
                    orderBy: { name: 'asc' },
                    skip,
                    take: Number(limit)
                }),
                prisma_1.default.product.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },
    async getCategories(req, res) {
        try {
            const categories = await prisma_1.default.category.findMany({
                where: { active: true },
                orderBy: { name: 'asc' }
            });
            res.json({
                success: true,
                data: categories
            });
        }
        catch (error) {
            console.error('Erro ao buscar categorias:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },
    async getStock(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status = '' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {
                active: true
            };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { barcode: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                where.stockStatus = status;
            }
            const [products, total] = await Promise.all([
                prisma_1.default.product.findMany({
                    where,
                    include: {
                        category: true,
                        supplier: true
                    },
                    orderBy: { name: 'asc' },
                    skip,
                    take: Number(limit)
                }),
                prisma_1.default.product.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar estoque:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },
    async getSales(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { page = 1, limit = 10, status = '' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const where = {
                userId: userId
            };
            if (status) {
                where.status = status;
            }
            const [sales, total] = await Promise.all([
                prisma_1.default.sale.findMany({
                    where,
                    include: {
                        client: true,
                        paymentMethod: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma_1.default.sale.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    sales,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar vendas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },
    async createSale(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { items, clientId, paymentMethodId, total, discount = 0 } = req.body;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new errorHandler_1.AppError('Itens da venda são obrigatórios', 400);
            }
            for (const item of items) {
                const product = await prisma_1.default.product.findUnique({
                    where: { id: item.productId }
                });
                if (!product) {
                    throw new errorHandler_1.AppError(`Produto ${item.productId} não encontrado`, 400);
                }
                if (product.stock < item.quantity) {
                    throw new errorHandler_1.AppError(`Estoque insuficiente para o produto ${product.name}`, 400);
                }
            }
            const sale = await prisma_1.default.sale.create({
                data: {
                    userId,
                    clientId: clientId || null,
                    paymentMethodId: paymentMethodId || null,
                    total,
                    discount,
                    status: 'COMPLETED',
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            costPrice: item.costPrice || 0,
                            discount: item.discount || 0
                        }))
                    }
                },
                include: {
                    client: true,
                    paymentMethod: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            for (const item of items) {
                await prisma_1.default.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
                await prisma_1.default.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'out',
                        quantity: item.quantity,
                        unitCost: item.costPrice || 0,
                        totalCost: (item.costPrice || 0) * item.quantity,
                        origin: 'venda_pdv',
                        notes: `Venda realizada por vendedor ${userId}`
                    }
                });
            }
            res.status(201).json({
                success: true,
                data: sale
            });
        }
        catch (error) {
            console.error('Erro ao criar venda:', error);
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
};
