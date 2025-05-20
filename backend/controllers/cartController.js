const Cart = require('../models/Cart');

class CartController {
    static async getCart(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const cartItems = await Cart.findByUserId(userId);
            res.json({ products: cartItems });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async addToCart(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const { Productsid, quantity } = req.body;

            if (!Productsid || !quantity) {
                return res.status(400).json({ message: 'Thiếu thông tin sản phẩm hoặc số lượng' });
            }

            const result = await Cart.addItem(userId, Productsid, quantity);
            res.json({ message: 'Thêm vào giỏ hàng thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async updateCartItem(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const { cartProductId } = req.params;
            const { quantity } = req.body;
            const result = await Cart.updateItemByCartProductId(userId, cartProductId, quantity);
            if (result === 0) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }
            res.json({ message: 'Cập nhật giỏ hàng thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async removeFromCart(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const { productId } = req.params;
            const cartProductId = productId;
            const result = await Cart.removeItemByCartProductId(userId, cartProductId);
            if (result === 0) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }
            res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async clearCart(req, res) {
        try {
            const userId = req.user.userId;
            await Cart.clearCart(userId);
            res.json({ message: 'Xóa giỏ hàng thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}

module.exports = CartController; 