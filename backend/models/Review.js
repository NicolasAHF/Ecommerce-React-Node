const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Por favor ingrese una calificación'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Por favor ingrese un título para la reseña'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  comment: {
    type: String,
    required: [true, 'Por favor ingrese un comentario'],
    maxlength: [1000, 'El comentario no puede tener más de 1000 caracteres']
  },
  approved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Un usuario solo puede hacer una reseña por producto
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Método estático para calcular la calificación promedio y actualizar el producto
ReviewSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    // Actualizar el producto con la calificación promedio
    if (obj[0]) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: obj[0].averageRating.toFixed(1),
        numReviews: obj[0].numReviews
      });
    } else {
      // Si no hay reseñas, restablecer a valores por defecto
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Llamar a getAverageRating después de guardar
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.product);
});

// Llamar a getAverageRating después de eliminar
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);