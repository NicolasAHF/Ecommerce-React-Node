const Order = require('../models/Order');
const Product = require('../models/Product');

// Nota: En una implementación real, cargaríamos Stripe y usaríamos su API
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Procesar checkout
// @route   POST /api/checkout
// @access  Private
exports.processCheckout = async (req, res, next) => {
  try {
    // Obtener datos del carrito desde la sesión
    const cart = req.session?.cart;
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Carrito vacío'
      });
    }
    
    const { 
      shippingAddress, 
      paymentMethod 
    } = req.body;
    
    // Verificar stock actualizado
    for (const item of cart.items) {
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
    }
    
    // Calcular precios
    const itemsPrice = cart.total;
    const taxPrice = itemsPrice * 0.15; // 15% de impuesto (ejemplo)
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Envío gratis para compras mayores a $100
    const totalPrice = itemsPrice + taxPrice + shippingPrice;
    
    // En una implementación real, aquí crearíamos una sesión de Stripe
    // const session = await stripe.checkout.sessions.create({...});
    
    // Simular sesión de pago
    const paymentSession = {
      id: `sess_${Date.now()}`,
      amount_total: totalPrice * 100, // En centavos para Stripe
      payment_status: 'unpaid',
      url: 'https://example.com/checkout/success' // URL de redirección
    };
    
    // Guardar la información de sesión para recuperarla más tarde
    req.session.checkoutSession = paymentSession;
    req.session.checkoutData = {
      cart,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    };
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: paymentSession.id,
        url: paymentSession.url
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener sesión de checkout
// @route   GET /api/checkout/session/:id
// @access  Private
exports.getCheckoutSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    
    // En una implementación real, obtendríamos la sesión de Stripe
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Simular sesión de pago
    const session = req.session.checkoutSession;
    
    if (!session || session.id !== sessionId) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada'
      });
    }
    
    // Si el pago se ha completado, crear la orden
    if (req.query.success === 'true') {
      // Actualizar estado de la sesión
      session.payment_status = 'paid';
      
      // Obtener datos guardados
      const { 
        cart, 
        shippingAddress, 
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      } = req.session.checkoutData;
      
      // Crear la orden
      const order = await Order.create({
        user: req.user.id,
        items: cart.items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: Date.now(),
        status: 'pagado'
      });
      
      // Actualizar stock de productos
      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
      
      // Limpiar carrito y datos de checkout
      req.session.cart = { items: [], total: 0 };
      req.session.checkoutData = null;
      
      return res.status(200).json({
        success: true,
        data: {
          order: {
            id: order._id,
            total: order.totalPrice
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook para procesar eventos de Stripe
// @route   POST /api/checkout/webhook
// @access  Public
exports.webhookHandler = async (req, res, next) => {
  try {
    // En una implementación real, verificaríamos la firma del webhook
    // const signature = req.headers['stripe-signature'];
    // let event;
    // try {
    //   event = stripe.webhooks.constructEvent(
    //     req.body,
    //     signature,
    //     process.env.STRIPE_WEBHOOK_SECRET
    //   );
    // } catch (err) {
    //   return res.status(400).send(`Webhook Error: ${err.message}`);
    // }
    
    // Simular evento de webhook
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: req.body.id,
          customer: req.body.customer,
          payment_status: 'paid'
        }
      }
    };
    
    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        // Aquí buscaríamos la orden asociada y la marcaríamos como pagada
        // const session = event.data.object;
        // await updateOrderStatus(session);
        console.log('Pago completado para la sesión:', event.data.object.id);
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};