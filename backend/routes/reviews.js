const express = require('express');
const router = express.Router();

// Middleware de protección y autorización
const { protect, authorize } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  getProductReviews
} = require('../controllers/reviews');

// Rutas públicas
router.route('/product/:productId').get(getProductReviews);

// Rutas protegidas para usuarios
router.use(protect);

router.route('/').post(addReview);
router
  .route('/:id')
  .get(getReview)
  .put(updateReview)
  .delete(deleteReview);

// Ruta solo para administradores
router.route('/').get(authorize('admin'), getReviews);

module.exports = router;