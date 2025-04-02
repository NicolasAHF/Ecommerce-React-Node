const Product = require('../models/Product');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments({ active: true });

    // Filtros
    let query = { active: true };

    // Filtrar por categoría
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filtrar por precio
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Búsqueda por texto
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Ordenación
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      // Ordenación por defecto
      sort = { createdAt: -1 };
    }

    // Ejecutar consulta
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Crear objeto de paginación
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un producto
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'createdBy',
        select: 'name'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear un producto
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    // Agregar createdBy desde el usuario autenticado
    req.body.createdBy = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Actualizar producto
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Subir imágenes de producto
// @route   PUT /api/products/:id/images
// @access  Private (Admin)
exports.uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar si hay archivos
    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: 'Por favor suba archivos'
      });
    }

    // Array de imágenes
    const images = [];

    // En una aplicación real, aquí subirías las imágenes a un servicio como Cloudinary
    // y guardarías las URLs y public_ids

    // Mock de imágenes subidas
    if (Array.isArray(req.files.files)) {
      // Multiple files
      req.files.files.forEach((file, index) => {
        images.push({
          public_id: `product-${product._id}-${Date.now()}-${index}`,
          url: `https://example.com/uploads/${file.name}`
        });
      });
    } else {
      // Single file
      images.push({
        public_id: `product-${product._id}-${Date.now()}`,
        url: `https://example.com/uploads/${req.files.files.name}`
      });
    }

    // Actualizar imágenes del producto
    product.images = [...product.images, ...images];
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};