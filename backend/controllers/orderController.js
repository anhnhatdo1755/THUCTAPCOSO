const Order = require('../models/Order');
const Cart = require('../models/Cart');

class OrderController {
    static async createOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { shippingAddress, items, totalAmount } = req.body;

            const orderData = {
                shippingAddress,
                items,
                totalAmount
            };

            const orderId = await Order.create(userId, orderData);
            res.status(201).json({ message: 'Đặt hàng thành công', orderId });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async getAllOrders(req, res) {
        try {
            const orders = await Order.findAll();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            const orders = await Order.findByUserId(userId);
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async getOrderById(req, res) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }
            res.json(order);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            const result = await Order.updateStatus(req.params.id, status);
            if (result === 0) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }
            res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}

module.exports = OrderController; 