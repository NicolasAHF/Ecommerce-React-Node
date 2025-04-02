const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1']
      },
      price: {
        type: Number,
        required: true
      },
      variant: {
        name: String,
        option: String
      },
      image: String
    }
  ],
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Por favor ingrese la dirección']
    },
    city: {
      type: String,
      required: [true, 'Por favor ingrese la ciudad']
    },
    state: {
      type: String,
      required: [true, 'Por favor ingrese el estado/provincia']
    },
    zipCode: {
      type: String,
      required: [true, 'Por favor ingrese el código postal']
    },
    country: {
      type: String,
      required: [true, 'Por favor ingrese el país']
    },
    phone: String
  },
  paymentMethod: {
    type: String,
    required: [true, 'Por favor ingrese el método de pago'],
    enum: ['creditCard', 'paypal', 'transferencia', 'contraentrega']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    required: true,
    enum: ['pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: Date,
  trackingNumber: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar fecha al modificar
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);