const Product = require('../models/Product');
const { processProductData, processProductsData } = require('../utils/productUtils');

class ProductController {
    static async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            const offset = (page - 1) * limit;

            // Lấy filter từ query
            const filters = {
                size: req.query.size || '',
                color: req.query.color || '',
                minPrice: req.query.minPrice || '',
                maxPrice: req.query.maxPrice || '',
                brand: req.query.brand || '',
                collection: req.query.collection || '',
                category: req.query.category || '',
                name: req.query.name || '', // Bổ sung dòng này để truyền filter name xuống model
                status: req.query.status || 'active' // Mặc định chỉ lấy sản phẩm active
            };

            // Lấy tổng số sản phẩm
            const total = await Product.countAll();

            // Lấy sản phẩm phân trang có filter
            const products = await Product.findPaginated(offset, limit, filters);

            res.set('X-Total-Count', total); // Gửi tổng số sản phẩm qua header
            res.json(processProductsData(products));
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message, products: [] });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            res.json(processProductData(product));
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async createProduct(req, res) {
        try {
            const productData = {
                name: req.body.name,
                price: req.body.price,
                color: req.body.color,
                size: req.body.size,
                brand: req.body.brand,
                collection: req.body.collection,
                image: req.file ? req.file.path : null,
                stock: req.body.stock,
                status: req.body.status,
                Categoryid: req.body.Categoryid
            };

            const productId = await Product.create(productData);
            res.status(201).json({ message: 'Tạo sản phẩm thành công', productId });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            // Lấy sản phẩm cũ
            const oldProduct = await Product.findById(req.params.id);

            const productData = {
                name: req.body.name,
                price: req.body.price,
                color: req.body.color,
                size: req.body.size,
                brand: req.body.brand,
                collection: req.body.collection,
                image: req.file ? req.file.path : oldProduct.image, // Giữ nguyên ảnh cũ nếu không upload mới
                stock: req.body.stock,
                status: req.body.status,
                Categoryid: req.body.Categoryid
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

    static async getProductsByCollection(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            const offset = (page - 1) * limit;
            const collection = req.query.collection ? req.query.collection.toLowerCase() : '';
            const filters = { collection, status: 'active' };
            const total = await Product.countAll();
            const products = await Product.findPaginated(offset, limit, filters);
            res.json({ products: processProductsData(products), total });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message, products: [] });
        }
    }

    static async getRelatedProducts(req, res) {
        try {
            const productId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;
            const offset = (page - 1) * limit;

            // Lấy sản phẩm hiện tại để biết brand và category
            const currentProduct = await Product.findById(productId);
            if (!currentProduct) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }

            // Lấy sản phẩm liên quan (cùng brand hoặc cùng category, loại trừ sản phẩm hiện tại)
            // Lấy tất cả sản phẩm cùng brand
            let filtersBrand = { brand: currentProduct.brand, status: 'active' };
            let filtersCategory = { Categoryid: currentProduct.Categoryid, status: 'active' };
            const productsBrand = await Product.findPaginated(0, 100, filtersBrand);
            const productsCategory = await Product.findPaginated(0, 100, filtersCategory);
            // Gộp, loại trừ trùng và loại trừ chính nó
            let allRelated = [...productsBrand, ...productsCategory].filter(p => p.id !== currentProduct.id);
            // Loại trùng
            const seen = new Set();
            allRelated = allRelated.filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id); return true;
            });
            // Phân trang
            const total = allRelated.length;
            const products = allRelated.slice(offset, offset + limit);
            res.json({ products: processProductsData(products), total });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message, products: [] });
        }
    }
}

module.exports = ProductController;