const CategoryModel = require('../models/Category');

const addCategory = async (req, res) => {
  const { categoryName, categoryDescription } = req.body;
  try {
    const exists = await CategoryModel.findOne({ categoryName });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await CategoryModel.create({ categoryName, categoryDescription });
    res.status(201).json({ message: 'Category added successfully!', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  const { categoryName, categoryDescription } = req.body;
  try {
    const updated = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      { categoryName, categoryDescription },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('category:updated', updated);

    res.json({ message: 'Category Updated successfully!', category: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('category:deleted', { _id: req.params.id });

    res.json({ message: 'Category Deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addCategory, getCategories, updateCategory, deleteCategory };