// const express = require('express');
// const router = express.Router();
// // const authMiddleware = require('../middleware/authMiddleware');
// const {
//   addCategory, getCategories, updateCategory, deleteCategory
// } = require('../controllers/categoryController');

// router.post('/add',addCategory);
// router.get('/',getCategories);
// router.put('/:id', updateCategory);
// router.delete('/:id',deleteCategory);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/add',  addCategory);
router.get('/',      getCategories);
router.put('/:id',   updateCategory);
router.delete('/:id',deleteCategory);

module.exports = router;