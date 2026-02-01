"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendedorOrAdminMiddleware = exports.vendedorMiddleware = void 0;
const vendedorMiddleware = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'VENDEDOR') {
        return res.status(403).json({ error: 'Acesso negado. Apenas vendedores podem acessar este recurso.' });
    }
    return next();
};
exports.vendedorMiddleware = vendedorMiddleware;
const vendedorOrAdminMiddleware = (req, res, next) => {
    var _a, _b;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'VENDEDOR' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas vendedores ou administradores podem acessar este recurso.' });
    }
    return next();
};
exports.vendedorOrAdminMiddleware = vendedorOrAdminMiddleware;
