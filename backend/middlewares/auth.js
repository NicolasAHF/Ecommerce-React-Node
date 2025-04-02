const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - Verificar si el usuario está autenticado
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si existe el token en headers o cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtener token de la cabecera Authorization
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Obtener token de las cookies
    token = req.cookies.token;
  }

  // Verificar si el token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado para acceder a esta ruta'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el usuario correspondiente al token
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado para acceder a esta ruta'
    });
  }
};

// Verificar permisos según rol
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};