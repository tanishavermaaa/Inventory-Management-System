// const express = require('express');
// const router = express.Router();
// const {
//   getProducts, addProduct, updateProduct, deleteProduct
// } = require('../controllers/productController');

// router.get('/',        getProducts);
// router.post('/add',    addProduct);
// router.put('/:id',     updateProduct);
// router.delete('/:id',  deleteProduct);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware, supplierOrAdminMiddleware } = require('../middleware/authMiddleware');

router.get('/',       authMiddleware, getProducts);
router.post('/add',   authMiddleware, supplierOrAdminMiddleware, addProduct);
router.put('/:id',    authMiddleware, supplierOrAdminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, supplierOrAdminMiddleware, deleteProduct);

module.exports = router;