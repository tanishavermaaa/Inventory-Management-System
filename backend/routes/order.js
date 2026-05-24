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
const { authMiddleware, adminMiddleware, supplierMiddleware } = require('../middleware/authMiddleware');
const { placeOrder, cancelOrder, getMyOrders, getAllOrders, getSupplierOrders } = require('../controllers/orderController');
const Order = require('../models/Order');

router.post('/place',       authMiddleware,                    placeOrder);
router.put('/:id/cancel',   authMiddleware,                    cancelOrder);
router.get('/mine',         authMiddleware,                    getMyOrders);
router.get('/all',          authMiddleware, adminMiddleware,   getAllOrders);
router.get('/supplier',     authMiddleware, supplierMiddleware, getSupplierOrders);

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

// Supplier approve/reject admin orders
router.put('/:id/supplier-status', authMiddleware, supplierMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify product belongs to this supplier
    const Product = require('../models/Product');
    const product = await Product.findById(order.productId);
    if (!product || product.supplier !== req.user.name) {
      return res.status(403).json({ message: 'Not authorized to manage this order' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: `Order already ${order.status}` });
    }

    order.status = status;
    await order.save();

    // If approved, increment stock of the product!
    let updatedProduct = product;
    if (status === 'Approved') {
      if (product.addedBySupplier) {
        const adminId = order.distributor_id || order.orderedBy;
        let adminProduct = await Product.findOne({
          name: { $regex: new RegExp("^" + product.name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
          category: { $regex: new RegExp("^" + product.category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
          distributor_id: adminId,
          addedBySupplier: { $ne: true }
        });

        if (adminProduct) {
          adminProduct.stock += order.quantity;
          await adminProduct.save();
          updatedProduct = adminProduct;
        } else {
          adminProduct = await Product.create({
            name: product.name,
            category: product.category,
            supplier: product.supplier,
            price: product.price,
            stock: order.quantity,
            minThreshold: product.minThreshold || 25,
            addedBySupplier: false,
            distributor_id: adminId
          });
          updatedProduct = adminProduct;
        }

        // Ensure category is created automatically for the admin
        const CategoryModel = require('../models/Category');
        const categoryFilter = {
          categoryName: { $regex: new RegExp("^" + product.category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
          $or: [
            { distributor_id: adminId },
            { distributor_id: null },
            { distributor_id: { $exists: false } }
          ]
        };
        const categoryExists = await CategoryModel.findOne(categoryFilter);
        if (!categoryExists) {
          const newCat = await CategoryModel.create({
            categoryName: product.category,
            categoryDescription: `Category created automatically for restocked product: ${product.name}`,
            distributor_id: adminId
          });
          const io = req.app.get('io');
          if (io) io.emit('category:added', newCat);
        }

        // Decrement supplier inventory stock!
        product.stock = Math.max(0, product.stock - order.quantity);
        await product.save();

        // Emit updated supplier product event so the supplier dashboard reflects the decremented stock in real-time!
        const io = req.app.get('io');
        if (io) {
          io.emit('product:updated', product);
        }
      } else {
        updatedProduct = await Product.findByIdAndUpdate(
          order.productId,
          { $inc: { stock: order.quantity } },
          { new: true, lean: true }
        );
      }
    }

    const io = req.app.get('io');
    if (io) {
      if (status === 'Approved') {
        io.emit('product:updated', updatedProduct);
      }

      // Notify the admin who placed the order
      io.emit(`order:status:${order.orderedBy.toString()}`, {
        message: `Your restock order for ${order.productName} (x${order.quantity}) has been ${status}!`,
        orderId: order._id,
        status,
        productName: order.productName,
      });

      io.emit('order:updated', order);
    }

    res.json({ message: `Order ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;