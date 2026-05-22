// const Order   = require('../models/Order');
// const Product = require('../models/Product');

// const placeOrder = async (req, res) => {
//   const { productId, quantity } = req.body;
//   try {
//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     if (product.stock < quantity)
//       return res.status(400).json({ message: 'Insufficient stock' });

//     const order = await Order.create({
//       productId,
//       productName:   product.name,
//       category:      product.category,
//       price:         product.price,
//       quantity,
//       totalPrice:    product.price * quantity,
//       orderedBy:     req.user.id,
//       orderedByName: req.user.name || 'Employee',
//     });

//     // Reduce stock
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { $inc: { stock: -quantity } },
//       { new: true, lean: true }    // lean:true = plain JS object, no Mongoose overhead
//     );

//     // Emit to ALL clients
//     const io = req.app.get('io');
//     if (io) {
//       console.log('📤 Emitting product:updated:', updatedProduct.name, 'stock:', updatedProduct.stock);
//       io.emit('product:updated', updatedProduct);
//     } else {
//       console.log('❌ io not found on app');
//     }

//     res.status(201).json({ message: 'Order placed successfully!', order });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ orderedBy: req.user.id }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = { placeOrder, getMyOrders, getAllOrders };

const Order   = require('../models/Order');
const Product = require('../models/Product');

const placeOrder = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity)
      return res.status(400).json({ message: 'Insufficient stock' });

    const order = await Order.create({
      productId,
      productName:   product.name,
      category:      product.category,
      price:         product.price,
      quantity,
      totalPrice:    product.price * quantity,
      orderedBy:     req.user.id,
      orderedByName: req.user.name || 'Employee',
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true, lean: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('product:updated', updatedProduct);

      // Notify all admins of new order
      io.emit('order:new', {
        message: `New order from ${req.user.name}`,
        productName: product.name,
        quantity,
        orderedBy: req.user.name,
        orderId: order._id,
        createdAt: order.createdAt,
      });
    }

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only order owner can cancel
    if (order.orderedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock
    await Product.findByIdAndUpdate(order.productId, {
      $inc: { stock: order.quantity }
    });

    const io = req.app.get('io');
    if (io) io.emit('product:updated', await Product.findById(order.productId).lean());

    res.json({ message: 'Order cancelled successfully!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { placeOrder, cancelOrder, getMyOrders, getAllOrders };