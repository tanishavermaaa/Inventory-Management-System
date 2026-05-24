const CategoryModel = require('../models/Category');
const Product = require('../models/Product');

const addCategory = async (req, res) => {
  const { categoryName, categoryDescription } = req.body;
  try {
    const filter = {
      categoryName: { $regex: new RegExp("^" + categoryName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
    };
    if (req.user?.role === 'admin') {
      filter.$or = [
        { distributor_id: req.user.id },
        { distributor_id: null },
        { distributor_id: { $exists: false } }
      ];
    }
    const exists = await CategoryModel.findOne(filter);
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await CategoryModel.create({
      categoryName,
      categoryDescription,
      distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
    });
    res.status(201).json({ message: 'Category added successfully!', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role === 'admin') {
      filter.$or = [
        { distributor_id: req.user.id },
        { distributor_id: null },
        { distributor_id: { $exists: false } }
      ];
    }
    const categories = await CategoryModel.find(filter).sort({ createdAt: -1 });

    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const productFilter = {
        category: { $regex: new RegExp("^" + cat.categoryName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      };
      if (req.user?.role === 'admin') {
        productFilter.distributor_id = req.user.id;
        productFilter.addedBySupplier = { $ne: true };
      } else if (req.user?.role === 'supplier') {
        productFilter.addedBySupplier = true;
        productFilter.supplier = req.user.name;
      }
      
      const products = await Product.find(productFilter).select('name');
      const productNames = [...new Set(products.map(p => p.name))]; // Unique names
      const catObj = cat.toObject();
      catObj.productCount = productNames.length;
      catObj.productNames = productNames;
      return catObj;
    }));

    // Return only categories which have at least one product in stock
    const activeCategories = categoriesWithCount.filter(cat => cat.productCount > 0);

    // Deduplicate activeCategories by categoryName (case-insensitive)
    const seen = new Set();
    const uniqueCategories = [];
    for (const cat of activeCategories) {
      const normalizedName = cat.categoryName.trim().toLowerCase();
      if (!seen.has(normalizedName)) {
        seen.add(normalizedName);
        uniqueCategories.push(cat);
      } else {
        // If we already saw it, keep the one that has distributor_id (so the admin owns it)
        const existingIdx = uniqueCategories.findIndex(c => c.categoryName.trim().toLowerCase() === normalizedName);
        if (existingIdx !== -1 && !uniqueCategories[existingIdx].distributor_id && cat.distributor_id) {
          uniqueCategories[existingIdx] = cat;
        }
      }
    }

    res.json(uniqueCategories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const { categoryName, categoryDescription } = req.body;
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (req.user?.role === 'admin' && category.distributor_id && category.distributor_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own categories.' });
    }

    const oldCategoryName = category.categoryName;

    // Check if new category name already exists (if name is changed)
    if (categoryName && categoryName.trim().toLowerCase() !== category.categoryName.trim().toLowerCase()) {
      const existsFilter = {
        categoryName: { $regex: new RegExp("^" + categoryName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      };
      if (req.user?.role === 'admin') {
        existsFilter.distributor_id = req.user.id;
      }
      const exists = await CategoryModel.findOne(existsFilter);
      if (exists) return res.status(400).json({ message: 'Category name already exists' });
    }

    const updated = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      { categoryName, categoryDescription },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });

    // If the category name was changed, update all products matching the old category name!
    if (categoryName && categoryName !== oldCategoryName) {
      const productFilter = {
        category: { $regex: new RegExp("^" + oldCategoryName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      };
      if (req.user?.role === 'admin') {
        productFilter.distributor_id = req.user.id;
        productFilter.addedBySupplier = { $ne: true };
      } else if (req.user?.role === 'supplier') {
        productFilter.addedBySupplier = true;
        productFilter.supplier = req.user.name;
      }
      
      // Update them
      await Product.updateMany(productFilter, { $set: { category: categoryName } });
      
      // Emit product:updated socket event for each updated product to sync real-time UI
      const io = req.app.get('io');
      if (io) {
        const updatedProducts = await Product.find(productFilter);
        updatedProducts.forEach(p => io.emit('product:updated', p));
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('category:updated', updated);

    res.json({ message: 'Category Updated successfully!', category: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (req.user?.role === 'admin' && category.distributor_id && category.distributor_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own categories.' });
    }

    await CategoryModel.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('category:deleted', { _id: req.params.id });

    res.json({ message: 'Category Deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addCategory, getCategories, updateCategory, deleteCategory };