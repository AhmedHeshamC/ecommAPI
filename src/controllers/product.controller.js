const Product = require('../models/product.model');
const { ApiError } = require('../utils/error.util');

// Get all products with pagination and filtering
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filter object from query params
    const filters = {};
    if (req.query.name) filters.name = req.query.name;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.minPrice) filters.minPrice = req.query.minPrice;
    if (req.query.maxPrice) filters.maxPrice = req.query.maxPrice;
    
    const products = await Product.getAll(limit, offset, filters);
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page,
        limit
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
exports.createProduct = async (req, res, next) => {
  try {
    // Create product
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    product = await Product.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    await Product.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
