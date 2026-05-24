const Supplier = require('../models/Supplier');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const addSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address, status } = req.body;
  try {
    const filter = { email };
    if (req.user?.role === 'admin') {
      filter.distributor_id = req.user.id;
    }
    const exists = await Supplier.findOne(filter);
    if (exists) return res.status(400).json({ message: 'Supplier with this email already exists' });

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      status,
      distributor_id: req.user?.role === 'admin' ? req.user.id : undefined
    });

    // Also auto-create a User account with role 'supplier' if it doesn't exist yet
    const userExists = await User.findOne({ email });
    if (!userExists) {
      const hashed = await bcrypt.hash('supplier12345678', 10);
      await User.create({
        name,
        email,
        password: hashed,
        role: 'supplier',
        isDeleted: false
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('supplier:added', supplier);

    res.status(201).json({ message: 'Supplier added successfully!', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role === 'admin') {
      filter.distributor_id = req.user.id;
    }
    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address, status } = req.body;
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    if (req.user?.role === 'admin' && supplier.distributor_id && supplier.distributor_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own suppliers.' });
    }

    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contactPerson, email, phone, address, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('supplier:updated', updated);

    res.json({ message: 'Supplier updated successfully!', supplier: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    if (req.user?.role === 'admin' && supplier.distributor_id && supplier.distributor_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own suppliers.' });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('supplier:deleted', { _id: req.params.id });

    res.json({ message: 'Supplier deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addSupplier, getSuppliers, updateSupplier, deleteSupplier };
