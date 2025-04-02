const express = require('express');
const router = express.Router();

// Middleware de protección
const { protect } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cart');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;