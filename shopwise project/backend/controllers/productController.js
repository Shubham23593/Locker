import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { brand, category, search, sort, limit = 100 } = req.query;

    // Build filter object
    const filter = {};

    if (brand) {
      filter.brand = brand;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Build sort object
    let sortOption = {};
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit));

    console.log(`📦 Returning ${products.length} products`); // Debug log

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Keep all other exports the same...
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(10);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');

    res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      price,
      image,
      brand,
      category,
      stock,
    } = req.body;

    const existingProduct = await Product.findOne({ productId });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    const product = await Product.create({
      productId,
      name,
      description,
      price,
      image,
      brand,
      category,
      stock,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { productId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findOneAndDelete({ productId: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Invalid products data' });
    }

    const createdProducts = await Product.insertMany(
      products.map((p) => ({
        productId: p.id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        brand: p.brand,
        category: p.category || 'Electronics',
        description: p.description || '',
        stock: p.stock || 100,
      })),
      { ordered: false }
    );

    res.status(201).json({
      success: true,
      count: createdProducts.length,
      message: 'Products seeded successfully',
      data: createdProducts,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.json({
        success: true,
        message: 'Some products already exist, others added successfully',
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};