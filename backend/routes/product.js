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
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/',       getProducts);
router.post('/add',   authMiddleware, adminMiddleware, addProduct);
router.put('/:id',    authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;