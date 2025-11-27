import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    console.log('🛒 Getting cart for user:', req.user._id);

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      });
    }

    console.log('✅ Cart found:', cart.items.length, 'items');

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, name, price, image, brand, quantity = 1 } = req.body;

    console.log('➕ Adding to cart:', { productId, name, price, quantity });

    // Validation
    if (!productId || !name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, name, price, image',
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity += quantity;
      console.log('✅ Updated existing item quantity');
    } else {
      // Add new product to cart
      cart.items.push({
        productId,
        name,
        price,
        image,
        brand,
        quantity,
      });
      console.log('✅ Added new item to cart');
    }

    await cart.save();

    console.log('✅ Cart saved:', cart.items.length, 'items');

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log('🔄 Updating cart item:', productId, 'quantity:', quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    console.log('✅ Cart item updated');

    res.json({
      success: true,
      data: cart,
      message: 'Cart updated',
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log('🗑️ Removing from cart:', productId);

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    console.log('✅ Item removed from cart');

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    console.log('🗑️ Clearing cart for user:', req.user._id);

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();

    console.log('✅ Cart cleared');

    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};