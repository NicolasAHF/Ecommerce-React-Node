const express = require('express');
const router = express.Router();

// Middleware de protección y autorización
const { protect, authorize } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories');

// Rutas públicas
router.get('/', getCategories);
router.get('/:id', getCategory);

// Rutas protegidas para administradores
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;