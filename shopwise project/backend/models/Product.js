import mongoose from 'mongoose';

// Review Schema
const reviewSchema = new mongoose. Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x400?text=No+Image',
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  rating: {
    type: Number,
    default: 4,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  reviews: [reviewSchema],
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
  features: [{
    type: String,
  }],
  warranty: {
    type: String,
    default: '1 Year Manufacturer Warranty',
  },
  returnPolicy: {
    type: String,
    default: '7 Days Return & Exchange',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  tags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this. updatedAt = Date.now();
  next();
});

// Virtual for product URL
productSchema. virtual('url').get(function() {
  return `/product/${this._id}`;
});

// Virtual for discount price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for low stock status
productSchema.virtual('lowStock').get(function() {
  return this.stock > 0 && this.stock < 10;
});

// Method to calculate average rating
productSchema.methods. calculateAverageRating = function() {
  if (this. reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return this.rating;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = (totalRating / this.reviews. length).toFixed(1);
  this.numReviews = this.reviews.length;
  
  return this.rating;
};

// Method to add a review
productSchema.methods. addReview = function(userId, userName, rating, comment) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(
    review => review.user.toString() === userId.toString()
  );

  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview. createdAt = Date.now();
  } else {
    // Add new review
    this.reviews. push({
      user: userId,
      name: userName,
      rating,
      comment,
    });
  }

  // Recalculate average rating
  this.calculateAverageRating();
};

// Method to remove a review
productSchema.methods. removeReview = function(userId) {
  this.reviews = this.reviews.filter(
    review => review.user.toString() !== userId.toString()
  );
  this.calculateAverageRating();
};

// Method to increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to update stock after purchase
productSchema.methods.updateStockAfterPurchase = function(quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    this.sold += quantity;
    return this.save();
  } else {
    throw new Error('Insufficient stock');
  }
};

// Static method to find products by brand
productSchema.statics.findByBrand = function(brand) {
  return this.find({ brand, isActive: true }). sort({ createdAt: -1 });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }). sort({ createdAt: -1 });
};

// Static method to find featured products
productSchema.statics. findFeatured = function(limit = 8) {
  return this.find({ isFeatured: true, isActive: true })
    . limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to find products on sale
productSchema.statics. findOnSale = function(limit = 20) {
  return this.find({ discount: { $gt: 0 }, isActive: true })
    . limit(limit)
    .sort({ discount: -1 });
};

// Static method to find low stock products
productSchema.statics.findLowStock = function(threshold = 10) {
  return this.find({ 
    stock: { $gt: 0, $lt: threshold }, 
    isActive: true 
  }). sort({ stock: 1 });
};

// Static method to get best sellers
productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ sold: -1, rating: -1 })
    . limit(limit);
};

// Static method to get top rated products
productSchema.statics. findTopRated = function(limit = 10) {
  return this.find({ isActive: true, numReviews: { $gte: 5 } })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);
};

// Static method to search products
productSchema.statics. searchProducts = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  }). sort({ score: { $meta: 'textScore' } });
};

// Static method to get all unique brands
productSchema.statics. getAllBrands = function() {
  return this.distinct('brand', { isActive: true });
};

// Static method to get all unique categories
productSchema.statics. getAllCategories = function() {
  return this.distinct('category', { isActive: true });
};

// Static method to get price range
productSchema.statics. getPriceRange = async function() {
  const result = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    }
  ]);
  
  return result[0] || { minPrice: 0, maxPrice: 200000 };
};

const Product = mongoose.model('Product', productSchema);

export default Product;