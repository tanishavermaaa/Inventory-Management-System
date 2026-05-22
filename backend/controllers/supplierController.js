const Supplier = require('../models/Supplier');

const addSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address, status } = req.body;
  try {
    const exists = await Supplier.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Supplier with this email already exists' });

    const supplier = await Supplier.create({ name, contactPerson, email, phone, address, status });

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
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address, status } = req.body;
  try {
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
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('supplier:deleted', { _id: req.params.id });

    res.json({ message: 'Supplier deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addSupplier, getSuppliers, updateSupplier, deleteSupplier };
