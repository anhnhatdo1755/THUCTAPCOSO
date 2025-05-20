const sql = require('mssql');
const config = require('../config/database');

class Cart {
    static async findByUserId(userId) {
        try {
            const pool = await sql.connect(config);
            // Lấy cartId từ bảng Cart
            const cartResult = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cartResult.recordset[0]) return [];
            const cartId = cartResult.recordset[0].id;
            // Lấy sản phẩm trong giỏ
            const result = await pool.request()
                .input('Cartid', sql.Int, cartId)
                .query('SELECT cp.*, p.name, p.price, p.image FROM cartProduct cp JOIN Products p ON cp.Productsid = p.id WHERE cp.Cartid = @Cartid');
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async addItem(userId, productId, quantity) {
        try {
            const pool = await sql.connect(config);
            // Lấy cartId
            const cartResult = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            let cartId;
            if (!cartResult.recordset[0]) {
                // Nếu chưa có cart thì tạo mới
                const newCart = await pool.request()
                    .input('Usersid', sql.Int, userId)
                    .query('INSERT INTO Cart (totalPrice, Usersid) VALUES (0, @Usersid); SELECT SCOPE_IDENTITY() AS id');
                cartId = newCart.recordset[0].id;
            } else {
                cartId = cartResult.recordset[0].id;
            }
            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const exist = await pool.request()
                .input('Cartid', sql.Int, cartId)
                .input('Productsid', sql.Int, productId)
                .query('SELECT * FROM cartProduct WHERE Cartid = @Cartid AND Productsid = @Productsid');
            if (exist.recordset.length > 0) {
                await pool.request()
                    .input('Cartid', sql.Int, cartId)
                    .input('Productsid', sql.Int, productId)
                    .input('quantity', sql.Int, quantity)
                    .query('UPDATE cartProduct SET quantity = quantity + @quantity WHERE Cartid = @Cartid AND Productsid = @Productsid');
            } else {
                await pool.request()
                    .input('Cartid', sql.Int, cartId)
                    .input('Productsid', sql.Int, productId)
                    .input('quantity', sql.Int, quantity)
                    .query('INSERT INTO cartProduct (Cartid, Productsid, quantity) VALUES (@Cartid, @Productsid, @quantity)');
            }
            return true;
        } catch (err) {
            throw err;
        }
    }

    static async updateItem(userId, productId, quantity) {
        try {
            const pool = await sql.connect(config);
            // Lấy cartId
            const cartResult = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cartResult.recordset[0]) return 0;
            const cartId = cartResult.recordset[0].id;
            const result = await pool.request()
                .input('Cartid', sql.Int, cartId)
                .input('Productsid', sql.Int, productId)
                .input('quantity', sql.Int, quantity)
                .query('UPDATE cartProduct SET quantity = @quantity WHERE Cartid = @Cartid AND Productsid = @Productsid');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async removeItem(userId, productId) {
        try {
            const pool = await sql.connect(config);
            // Lấy cartId
            const cartResult = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cartResult.recordset[0]) return 0;
            const cartId = cartResult.recordset[0].id;
            const result = await pool.request()
                .input('Cartid', sql.Int, cartId)
                .input('Productsid', sql.Int, productId)
                .query('DELETE FROM cartProduct WHERE Cartid = @Cartid AND Productsid = @Productsid');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async clearCart(userId) {
        try {
            const pool = await sql.connect(config);
            // Lấy cartId
            const cartResult = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cartResult.recordset[0]) return 0;
            const cartId = cartResult.recordset[0].id;
            const result = await pool.request()
                .input('Cartid', sql.Int, cartId)
                .query('DELETE FROM cartProduct WHERE Cartid = @Cartid');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async removeItemByCartProductId(userId, cartProductId) {
        try {
            const pool = await sql.connect(config);
            // Kiểm tra quyền sở hữu cartProduct
            const cartProduct = await pool.request()
                .input('id', sql.Int, cartProductId)
                .query('SELECT * FROM cartProduct WHERE id = @id');
            if (!cartProduct.recordset[0]) return 0;
            // Lấy cart của user
            const cart = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cart.recordset[0] || cart.recordset[0].id !== cartProduct.recordset[0].Cartid) return 0;
            // Xóa sản phẩm khỏi cartProduct
            const result = await pool.request()
                .input('id', sql.Int, cartProductId)
                .query('DELETE FROM cartProduct WHERE id = @id');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async updateItemByCartProductId(userId, cartProductId, quantity) {
        try {
            const pool = await sql.connect(config);
            // Kiểm tra quyền sở hữu cartProduct
            const cartProduct = await pool.request()
                .input('id', sql.Int, cartProductId)
                .query('SELECT * FROM cartProduct WHERE id = @id');
            if (!cartProduct.recordset[0]) return 0;
            // Lấy cart của user
            const cart = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('SELECT * FROM Cart WHERE Usersid = @Usersid');
            if (!cart.recordset[0] || cart.recordset[0].id !== cartProduct.recordset[0].Cartid) return 0;
            // Cập nhật số lượng
            const result = await pool.request()
                .input('id', sql.Int, cartProductId)
                .input('quantity', sql.Int, quantity)
                .query('UPDATE cartProduct SET quantity = quantity + @quantity WHERE id = @id');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Cart; 