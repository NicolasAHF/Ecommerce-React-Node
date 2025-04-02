const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Obtener todas las órdenes
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener órdenes del usuario actual
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener una orden
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price images'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Asegurarse que el usuario solo pueda ver sus propias órdenes o sea admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para ver esta orden'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear una nueva orden
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay items en la orden'
      });
    }

    // Verificar stock y obtener información actualizada de los productos
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Producto no encontrado: ${item.product}`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para el producto: ${product.name}`
        });
      }
      
      // Agregar item con información actualizada
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.discountPrice || product.price,
        image: product.images.length > 0 ? product.images[0].url : '',
        variant: item.variant
      });
      
      // Actualizar stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Crear la orden
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar estado de una orden
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Actualizar estado
    order.status = status || order.status;
    
    // Si se marca como pagada, actualizar isPaid y paidAt
    if (status === 'pagado' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
    
    // Si se marca como enviada, actualizar isDelivered y deliveredAt
    if (status === 'enviado' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    // Si se proporciona número de seguimiento
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar una orden
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    await order.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};