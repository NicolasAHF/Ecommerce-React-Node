const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar express
const app = express();

// Configurar limitador de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});

// Middlewares
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: false })); // Para parsear application/x-www-form-urlencoded
app.use(cookieParser()); // Para parsear cookies
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Habilitar CORS
app.use(morgan('dev')); // Logging
app.use(limiter); // Aplicar limitador a todas las rutas

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/checkout', require('./routes/checkout'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Error del servidor'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejar rechazos de promesas no capturadas
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Cerrar servidor y salir del proceso
  server.close(() => process.exit(1));
});