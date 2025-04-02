const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre de producto'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    maxlength: [2000, 'La descripción no puede tener más de 2000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'Por favor ingrese un precio'],
    min: [0, 'El precio debe ser mayor a 0']
  },
  discountPrice: {
    type: Number,
    min: [0, 'El precio con descuento debe ser mayor a 0']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Por favor seleccione una categoría']
  },
  stock: {
    type: Number,
    required: [true, 'Por favor ingrese la cantidad en stock'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  attributes: {
    type: Map,
    of: String
  },
  variants: [
    {
      name: String,
      options: [
        {
          name: String,
          stock: Number,
          price: Number
        }
      ]
    }
  ],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'La calificación mínima es 0'],
    max: [5, 'La calificación máxima es 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsqueda
ProductSchema.index({ name: 'text', description: 'text' });

// Actualizar fecha al modificar
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);