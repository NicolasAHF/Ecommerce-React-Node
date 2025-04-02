const express = require('express');
const router = express.Router();

// Middleware de protección
const { protect } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  processCheckout,
  getCheckoutSession,
  webhookHandler
} = require('../controllers/checkout');

// Ruta pública para webhooks de Stripe
router.post('/webhook', webhookHandler);

// Rutas protegidas
router.use(protect);

router.route('/')
  .post(processCheckout);

router.route('/session/:id')
  .get(getCheckoutSession);

module.exports = router;