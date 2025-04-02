const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages
} = require('../controllers/products');

const router = express.Router();

// Middleware de protección y autorización
const { protect, authorize } = require('../middlewares/auth');

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/images').put(protect, authorize('admin'), uploadProductImages);

module.exports = router;