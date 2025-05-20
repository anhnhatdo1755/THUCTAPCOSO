const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    static async register(req, res) {
        try {
            const { email, passWord, name, phone } = req.body;

            // Kiểm tra email đã tồn tại
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(passWord, 10);

            // Tạo user mới
            const userId = await User.create({
                email,
                passWord: hashedPassword,
                name,
                phone
            });

            // Tạo giỏ hàng cho user
            await User.createCart(userId);

            res.status(201).json({ message: 'Đăng ký thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, passWord } = req.body;

            // Tìm user theo email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
            }

            // Kiểm tra mật khẩu
            const isValidPassword = await bcrypt.compare(passWord, user.passWord);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
            }

            // Tạo token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Đăng nhập thành công',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    static async logout(req, res) {
        try {
            // Trong trường hợp này, client sẽ xóa token
            res.json({ message: 'Đăng xuất thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}

module.exports = AuthController; 