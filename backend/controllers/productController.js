const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const products = await Product.find({
      name: { $regex: search, $options: 'i' }
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addProduct = async (req, res) => {
  const { name, category, supplier, price, stock, minThreshold } = req.body;
  try {
    const product = await Product.create({ name, category, supplier, price, stock, minThreshold });

    // ── Check if Category exists, if not, create it automatically! ──
    const CategoryModel = require('../models/Category');
    const categoryExists = await CategoryModel.findOne({ categoryName: category });
    if (!categoryExists) {
      const newCat = await CategoryModel.create({
        categoryName: category,
        categoryDescription: `Category created automatically for product: ${name}`
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
    const updated = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    // ── Check if Category exists on update, if not, create it automatically! ──
    if (req.body.category) {
      const CategoryModel = require('../models/Category');
      const categoryExists = await CategoryModel.findOne({ categoryName: req.body.category });
      if (!categoryExists) {
        const newCat = await CategoryModel.create({
          categoryName: req.body.category,
          categoryDescription: `Category created automatically for product update: ${updated.name}`
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