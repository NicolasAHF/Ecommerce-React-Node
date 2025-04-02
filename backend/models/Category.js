const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre para la categoría'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  slug: String,
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    public_id: String,
    url: String
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Crear slug a partir del nombre
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);