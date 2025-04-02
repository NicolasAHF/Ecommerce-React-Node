const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Obtener todas las reseñas
// @route   GET /api/reviews
// @access  Private/Admin
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'product',
        select: 'name'
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener reseñas de un producto
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      approved: true
    }).populate({
      path: 'user',
      select: 'name'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener una reseña
// @route   GET /api/reviews/:id
// @access  Private
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'product',
        select: 'name'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    // Solo el usuario que creó la reseña o admin puede verla si no está aprobada
    if (!review.approved && 
        review.user._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para ver esta reseña'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Añadir reseña
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    // Agregar usuario a la reseña
    req.body.user = req.user.id;

    // Verificar si el producto existe
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar si el usuario ya ha hecho una reseña para este producto
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: req.body.product
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Ya has realizado una reseña para este producto'
      });
    }

    // Crear la reseña
    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar reseña
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    // Verificar si el usuario es el dueño de la reseña
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar esta reseña'
      });
    }

    // Si es admin, puede actualizar approved, si no, no se permite cambiar ese campo
    if (req.user.role !== 'admin' && req.body.approved !== undefined) {
      delete req.body.approved;
    }

    // Actualizar reseña
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar reseña
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    // Verificar si el usuario es el dueño de la reseña
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para eliminar esta reseña'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};