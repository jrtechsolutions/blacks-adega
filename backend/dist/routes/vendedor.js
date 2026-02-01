"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendedor_1 = require("../controllers/vendedor");
const vendedor_2 = require("../middlewares/vendedor");
const router = express_1.default.Router();
router.use(vendedor_2.vendedorMiddleware);
router.get('/dashboard', vendedor_1.vendedorController.getDashboard);
router.get('/products', vendedor_1.vendedorController.getProducts);
router.get('/categories', vendedor_1.vendedorController.getCategories);
router.get('/stock', vendedor_1.vendedorController.getStock);
router.get('/sales', vendedor_1.vendedorController.getSales);
router.post('/sales', vendedor_1.vendedorController.createSale);
exports.default = router;
