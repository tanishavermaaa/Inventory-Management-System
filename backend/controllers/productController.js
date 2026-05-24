const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const filter = {
      name: { $regex: search, $options: 'i' }
    };

    if (req.query.includeSupplierProducts === 'true') {
      // Products added by suppliers should be visible to all admins
      filter.addedBySupplier = true;
    } else {
      filter.addedBySupplier = { $ne: true };
      // If the logged-in user is an admin, filter products by their distributor_id
      if (req.user?.role === 'admin') {
        filter.distributor_id = req.user.id;
      }
    }

    const products = await Product.find(filter)
      .populate('distributor_id')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addProduct = async (req, res) => {
  const { name, category, supplier, price, stock, minThreshold } = req.body;
  try {
    const isSupplier = req.user?.role === 'supplier';
    const finalSupplier = supplier || 'HP Group';

    const filter = {
      name: { $regex: new RegExp("^" + name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      category: { $regex: new RegExp("^" + category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
    };
    if (isSupplier) {
      filter.addedBySupplier = true;
      filter.supplier = req.user.name;
    } else {
      filter.addedBySupplier = { $ne: true };
      if (req.user?.role === 'admin') {
        filter.distributor_id = req.user.id;
      }
    }

    const existingProduct = await Product.findOne(filter);
    if (existingProduct) {
      existingProduct.stock += Number(stock || 0);
      if (price) existingProduct.price = Number(price);
      if (minThreshold) existingProduct.minThreshold = Number(minThreshold);
      if (!isSupplier) {
        existingProduct.supplier = finalSupplier;
      }
      
      await existingProduct.save();

      // ── Check if Category exists, if not, create it automatically! ──
      const CategoryModel = require('../models/Category');
      const categoryFilter = {
        categoryName: { $regex: new RegExp("^" + category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      };
      if (req.user?.role === 'admin') {
        categoryFilter.$or = [
          { distributor_id: req.user.id },
          { distributor_id: null },
          { distributor_id: { $exists: false } }
        ];
      }
      const categoryExists = await CategoryModel.findOne(categoryFilter);
      if (!categoryExists) {
        const newCat = await CategoryModel.create({
          categoryName: category,
          categoryDescription: `Category created automatically for product: ${name}`,
          distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
        });
        const io = req.app.get('io');
        if (io) io.emit('category:added', newCat);
      }

      // ── Emit to ALL connected clients ──
      const io = req.app.get('io');
      if (io) io.emit('product:updated', existingProduct);

      return res.status(200).json({ message: 'Product stock updated successfully!', product: existingProduct });
    }

    const product = await Product.create({
      name,
      category,
      supplier: finalSupplier,
      price,
      stock,
      minThreshold,
      addedBySupplier: isSupplier,
      distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
    });

    // ── Check if Category exists, if not, create it automatically! ──
    const CategoryModel = require('../models/Category');
    const categoryFilter = {
      categoryName: { $regex: new RegExp("^" + category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
    };
    if (req.user?.role === 'admin') {
      categoryFilter.$or = [
        { distributor_id: req.user.id },
        { distributor_id: null },
        { distributor_id: { $exists: false } }
      ];
    }
    const categoryExists = await CategoryModel.findOne(categoryFilter);
    if (!categoryExists) {
      const newCat = await CategoryModel.create({
        categoryName: category,
        categoryDescription: `Category created automatically for product: ${name}`,
        distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
      });
      const io = req.app.get('io');
      if (io) io.emit('category:added', newCat);
    }

    // ── Emit to ALL connected clients ──
    const io = req.app.get('io');
    if (io) io.emit('product:added', product);

    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Enforce ownership: suppliers can only update their own products, and admins can only update their own products
    if (req.user?.role === 'supplier') {
      if (!product.addedBySupplier || product.supplier !== req.user.name) {
        return res.status(403).json({ message: 'Access denied: You can only update your own products.' });
      }
    } else if (req.user?.role === 'admin') {
      if (product.distributor_id && product.distributor_id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: You can only update your own products.' });
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    // ── Check if Category exists on update, if not, create it automatically! ──
    if (req.body.category) {
      const CategoryModel = require('../models/Category');
      const categoryFilter = {
        categoryName: { $regex: new RegExp("^" + req.body.category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      };
      if (req.user?.role === 'admin') {
        categoryFilter.$or = [
          { distributor_id: req.user.id },
          { distributor_id: null },
          { distributor_id: { $exists: false } }
        ];
      }
      const categoryExists = await CategoryModel.findOne(categoryFilter);
      if (!categoryExists) {
        const newCat = await CategoryModel.create({
          categoryName: req.body.category,
          categoryDescription: `Category created automatically for product update: ${updated.name}`,
          distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
        });
        const io = req.app.get('io');
        if (io) io.emit('category:added', newCat);
      }
    }

    // ── Emit update to all clients ──
    const io = req.app.get('io');
    if (io) io.emit('product:updated', updated);

    res.json({ message: 'Product updated successfully!', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Enforce ownership: suppliers can only delete their own products, and admins can only delete their own products
    if (req.user?.role === 'supplier') {
      if (!product.addedBySupplier || product.supplier !== req.user.name) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own products.' });
      }
    } else if (req.user?.role === 'admin') {
      if (product.distributor_id && product.distributor_id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own products.' });
      }
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    // ── Emit delete to all clients ──
    const io = req.app.get('io');
    io.emit('product:deleted', { _id: req.params.id });

    res.json({ message: 'Product deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };