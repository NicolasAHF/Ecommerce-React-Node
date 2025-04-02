const express = require('express');
const router = express.Router();

// Middleware de protección y autorización
const { protect, authorize } = require('../middlewares/auth');

// Controlador ficticio (a implementar más adelante)
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

// Rutas que solo pueden acceder los administradores
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;