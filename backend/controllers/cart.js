const User = require('../models/User');
const Product = require('../models/Product');

// Nota: En una implementación real probablemente se crearía un modelo de Cart
// Para esta demo, usaremos un enfoque más sencillo almacenando el carrito en la sesión

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    // Simular obtención del carrito
    // En una implementación real, obtendríamos esto de la base de datos
    const cart = req.session?.cart || { items: [], total: 0 };
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Añadir producto al carrito
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, variant } = req.body;
    
    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Verificar stock
    let availableStock = product.stock;
    
    // Si hay variante, buscar el stock específico
    if (variant && variant.name && variant.option) {
      const variantData = product.variants.find(v => v.name === variant.name);
      if (variantData) {
        const optionData = variantData.options.find(o => o.name === variant.option);
        if (optionData) {
          availableStock = optionData.stock;
        }
      }
    }
    
    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Stock insuficiente'
      });
    }
    
    // Inicializar carrito si no existe
    if (!req.session.cart) {
      req.session.cart = {
        items: [],
        total: 0
      };
    }
    
    const cart = req.session.cart;
    
    // Verificar si el producto ya está en el carrito
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (itemIndex > -1) {
      // Si ya existe, actualizar cantidad
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Si no existe, añadir nuevo item
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity,
        variant,
        image: product.images.length > 0 ? product.images[0].url : null
      });
    }
    
    // Recalcular total
    cart.total = cart.items.reduce((acc, item) => 
      acc + item.price * item.quantity, 0);
    
    // Guardar carrito en sesión
    req.session.cart = cart;
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar item del carrito
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;
    
    if (!req.session.cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrito no encontrado'
      });
    }
    
    const cart = req.session.cart;
    const itemIndex = cart.items.findIndex(item => item.product.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado en el carrito'
      });
    }
    
    // Verificar stock
    const product = await Product.findById(itemId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    let availableStock = product.stock;
    const variant = cart.items[itemIndex].variant;
    
    // Si hay variante, buscar el stock específico
    if (variant && variant.name && variant.option) {
      const variantData = product.variants.find(v => v.name === variant.name);
      if (variantData) {
        const optionData = variantData.options.find(o => o.name === variant.option);
        if (optionData) {
          availableStock = optionData.stock;
        }
      }
    }
    
    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Stock insuficiente'
      });
    }
    
    // Actualizar cantidad
    cart.items[itemIndex].quantity = quantity;
    
    // Recalcular total
    cart.total = cart.items.reduce((acc, item) => 
      acc + item.price * item.quantity, 0);
    
    // Guardar carrito en sesión
    req.session.cart = cart;
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar producto del carrito
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    
    if (!req.session.cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrito no encontrado'
      });
    }
    
    const cart = req.session.cart;
    
    // Filtrar items para eliminar el producto
    cart.items = cart.items.filter(item => item.product.toString() !== itemId);
    
    // Recalcular total
    cart.total = cart.items.reduce((acc, item) => 
      acc + item.price * item.quantity, 0);
    
    // Guardar carrito en sesión
    req.session.cart = cart;
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vaciar carrito
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    // Reiniciar carrito
    req.session.cart = {
      items: [],
      total: 0
    };
    
    res.status(200).json({
      success: true,
      data: req.session.cart
    });
  } catch (error) {
    next(error);
  }
};