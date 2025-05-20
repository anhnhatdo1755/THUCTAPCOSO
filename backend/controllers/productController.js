const Product = require('../models/Product');

class ProductController {
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.json(products);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            res.json(product);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async createProduct(req, res) {
        try {
            const productData = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                image: req.body.image,
                stock: req.body.stock
            };

            const productId = await Product.create(productData);
            res.status(201).json({ message: 'Tạo sản phẩm thành công', productId });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            const productData = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                image: req.body.image,
                stock: req.body.stock
            };

            const result = await Product.update(req.params.id, productData);
            if (result === 0) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            res.json({ message: 'Cập nhật sản phẩm thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const result = await Product.delete(req.params.id);
            if (result === 0) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            res.json({ message: 'Xóa sản phẩm thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}

module.exports = ProductController; 