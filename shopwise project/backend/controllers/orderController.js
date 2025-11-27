import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
      return res.status(400).json({ 
        success: false,
        message: 'Shipping address is required with address, city, and zip' 
      });
    }

    // Get user cart
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }

    // Use cart.totalPrice instead of cart.totalAmount
    const totalAmount = cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log('Creating order with totalAmount:', totalAmount);

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: cart.items,
      shippingAddress,
      totalAmount,
    });

    console.log('Order created successfully:', order._id);

    // Clear cart after order
    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ 
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('Get order by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};