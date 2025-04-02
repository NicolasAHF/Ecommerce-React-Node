const express = require('express');
const router = express.Router();

// Middleware de protección y autorización
const { protect, authorize } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  getOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orders');

// Rutas protegidas para usuarios
router.use(protect);

// Rutas para cualquier usuario autenticado
router.route('/myorders').get(getMyOrders);
router.route('/').post(createOrder);

// Rutas solo para administradores
router.route('/').get(authorize('admin'), getOrders);
router
  .route('/:id')
  .get(getOrder)
  .put(authorize('admin'), updateOrderStatus)
  .delete(authorize('admin'), deleteOrder);

module.exports = router;