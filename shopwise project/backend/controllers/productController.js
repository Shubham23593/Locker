import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    console.log('📥 GET /api/products - Fetching all products');

    const { search, category, brand, minPrice, maxPrice, sort } = req.query;

    // Build query
    let query = { isActive: true };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Brand filter
    if (brand) {
      query. brand = brand;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'name-az') {
      sortOption = { name: 1 };
    } else if (sort === 'name-za') {
      sortOption = { name: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query). sort(sortOption);

    console.log(`✅ Found ${products.length} products`);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console. error('❌ Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    console. log('📥 GET /api/products/:id - Fetching product:', req.params.id);

    const product = await Product. findById(req.params.id);

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    console.log('✅ Product found:', product.name);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('❌ Get product by ID error:', error);
    res. status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    console.log('📥 POST /api/products - Creating product');

    const product = await Product.create(req.body);

    console.log('✅ Product created:', product.name);

    res.status(201). json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    console.log('📥 PUT /api/products/:id - Updating product:', req.params.id);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    console.log('✅ Product updated:', product.name);

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error. message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    console.log('📥 DELETE /api/products/:id - Deleting product:', req.params.id);

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    console.log('✅ Product deleted:', product.name);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error. message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product. find({ isFeatured: true, isActive: true })
      .limit(8)
      . sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
    });
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res. status(500).json({
      success: false,
      message: 'Failed to fetch brands',
    });
  }
};

// @desc    Seed products
// @route   POST /api/products/seed
// @access  Public (for development)
export const seedProducts = async (req, res) => {
  try {
    const { products } = req.body;

    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(products);

    res.status(201). json({
      success: true,
      data: createdProducts,
      message: `${createdProducts.length} products seeded successfully`,
    });
  } catch (error) {
    console.error('Seed products error:', error);
    res. status(500).json({
      success: false,
      message: 'Failed to seed products',
    });
  }
};