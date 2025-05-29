const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/collection', ProductController.getProductsByCollection);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.get('/related/:id', ProductController.getRelatedProducts);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), ProductController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), ProductController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, ProductController.deleteProduct);

module.exports = router; 