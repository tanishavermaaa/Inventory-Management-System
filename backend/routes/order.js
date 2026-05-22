// // const express = require('express');
// // const router  = express.Router();
// // const authMiddleware = require('../middleware/authMiddleware');
// // const { placeOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');

// // router.post('/place',   authMiddleware, placeOrder);
// // router.get('/mine',     authMiddleware, getMyOrders);
// // router.get('/all',      authMiddleware, getAllOrders);

// // module.exports = router;

// const express = require('express');
// const router  = express.Router();
// const { authMiddleware } = require('../middleware/authMiddleware');
// const { placeOrder, cancelOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');

// router.post('/place',       authMiddleware, placeOrder);
// router.put('/:id/cancel',   authMiddleware, cancelOrder);
// router.get('/mine',         authMiddleware, getMyOrders);
// router.get('/all',          authMiddleware, getAllOrders);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { placeOrder, cancelOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const Order = require('../models/Order');

router.post('/place',       authMiddleware,                    placeOrder);
router.put('/:id/cancel',   authMiddleware,                    cancelOrder);
router.get('/mine',         authMiddleware,                    getMyOrders);
router.get('/all',          authMiddleware, adminMiddleware,   getAllOrders);

// Admin approve/reject
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the order first instead of updating immediately
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If the order is being rejected and wasn't already rejected or cancelled
    if (status === 'Rejected' && order.status !== 'Rejected' && order.status !== 'Cancelled') {
      const Product = require('../models/Product');
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: order.quantity }
      });
      
      const io = req.app.get('io');
      if (io) {
        const updatedProduct = await Product.findById(order.productId).lean();
        io.emit('product:updated', updatedProduct);
      }
    }

    order.status = status;
    await order.save();

    // Emit live notifications and status update event
    const io = req.app.get('io');
    if (io) {
      // Emit live user-specific order status update notification
      io.emit(`order:status:${order.orderedBy.toString()}`, {
        message: `Your order for ${order.productName} (x${order.quantity}) has been ${status}!`,
        orderId: order._id,
        status,
        productName: order.productName,
      });

      // Emit general order status update event (for real-time dashboard updates)
      io.emit('order:updated', order);
    }

    res.json({ message: `Order ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;