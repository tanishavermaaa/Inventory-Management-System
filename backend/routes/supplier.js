const express = require('express');
const router  = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { addSupplier, getSuppliers, updateSupplier, deleteSupplier } = require('../controllers/supplierController');

// All supplier endpoints are protected and admin-only
router.post('/add',   authMiddleware, adminMiddleware, addSupplier);
router.get('/',       authMiddleware, adminMiddleware, getSuppliers);
router.put('/:id',    authMiddleware, adminMiddleware, updateSupplier);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSupplier);

module.exports = router;
