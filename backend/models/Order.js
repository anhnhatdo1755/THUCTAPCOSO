const sql = require('mssql');
const config = require('../config/database');

class Order {
    static async create(userId, orderData) {
        try {
            const pool = await sql.connect(config);
            const transaction = pool.transaction();
            await transaction.begin();

            try {
                // Tạo đơn hàng
                const orderResult = await transaction.request()
                    .input('totalPrice', sql.Decimal, orderData.totalPrice)
                    .input('shippingFee', sql.Decimal, orderData.shippingFee)
                    .input('status', sql.VarChar, 'pending')
                    .input('paymentMethod', sql.VarChar, orderData.paymentMethod)
                    .input('address', sql.NVarChar, orderData.address)
                    .input('Usersid', sql.Int, userId)
                    .input('Cartid', sql.Int, orderData.Cartid)
                    .input('name', sql.NVarChar, orderData.name)
                    .input('phone', sql.VarChar, orderData.phone)
                    .input('email', sql.VarChar, orderData.email)
                    .input('city', sql.NVarChar, orderData.city)
                    .query(`
                        INSERT INTO checkOut (totalPrice, shippingFee, status, paymentMethod, address, date, Usersid, Cartid, name, phone, email, city)
                        VALUES (@totalPrice, @shippingFee, @status, @paymentMethod, @address, GETDATE(), @Usersid, @Cartid, @name, @phone, @email, @city);
                        SELECT SCOPE_IDENTITY() AS id
                    `);
                const checkOutId = orderResult.recordset[0].id;

                // Thêm chi tiết đơn hàng
                for (const item of orderData.items) {
                    await transaction.request()
                        .input('quantity', sql.Int, item.quantity)
                        .input('checkOutPrice', sql.Decimal, item.price)
                        .input('Productsid', sql.Int, item.productId)
                        .input('checkOutid', sql.Int, checkOutId)
                        .query(`
                            INSERT INTO productsCheckOut (quantity, checkOutPrice, Productsid, checkOutid)
                            VALUES (@quantity, @checkOutPrice, @Productsid, @checkOutid)
                        `);

                    // Cập nhật tồn kho
                    await transaction.request()
                        .input('Productsid', sql.Int, item.productId)
                        .input('quantity', sql.Int, item.quantity)
                        .query(`
                            UPDATE Products 
                            SET stock = stock - @quantity 
                            WHERE id = @Productsid
                        `);
                }

                // Xóa sản phẩm khỏi giỏ hàng
                await transaction.request()
                    .input('Cartid', sql.Int, orderData.Cartid)
                    .query('DELETE FROM cartProduct WHERE Cartid = @Cartid');

                await transaction.commit();
                return checkOutId;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw err;
        }
    }

    static async findAll(offset = 0, limit = 10, status = null) {
        try {
            const pool = await sql.connect(config);
            let query = `SELECT c.*, u.name as userName, u.email
                    FROM checkOut c
                    JOIN Users u ON c.Usersid = u.id`;
            if (status && status !== 'all') {
                query += ` WHERE LOWER(c.status) = LOWER(@status)`;
            }
            query += ` ORDER BY c.date DESC
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
            const request = pool.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit);
            if (status && status !== 'all') request.input('status', sql.VarChar, status);
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async findByUserId(userId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query(`
                    SELECT c.*, u.name as userName, u.email
                    FROM checkOut c
                    JOIN Users u ON c.Usersid = u.id
                    WHERE c.Usersid = @Usersid
                    ORDER BY c.date DESC
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async findById(id) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT c.*, u.name as userName, u.email, u.phone,
                           pco.id as productCheckOutId, pco.quantity, pco.checkOutPrice, pco.Productsid,
                           p.name as productName, p.image
                    FROM checkOut c
                    JOIN Users u ON c.Usersid = u.id
                    JOIN productsCheckOut pco ON c.id = pco.checkOutid
                    JOIN Products p ON pco.Productsid = p.id
                    WHERE c.id = @id
                `);
            const rows = result.recordset;
            if (!rows.length) return null;
            // Lấy thông tin đơn hàng từ dòng đầu tiên
            const order = {
                id: rows[0].id,
                date: rows[0].date,
                status: rows[0].status,
                totalPrice: rows[0].totalPrice,
                shippingFee: rows[0].shippingFee,
                paymentMethod: rows[0].paymentMethod,
                address: rows[0].address,
                city: rows[0].city,
                name: rows[0].name,
                email: rows[0].email,
                phone: rows[0].phone,
                products: rows.map(r => ({
                    id: r.productCheckOutId,
                    productId: r.Productsid,
                    productName: r.productName,
                    image: r.image,
                    quantity: r.quantity,
                    checkOutPrice: r.checkOutPrice
                }))
            };
            return order;
        } catch (err) {
            throw err;
        }
    }

    static async updateStatus(id, status) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.VarChar, status)
                .query('UPDATE checkOut SET status = @status WHERE id = @id');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async countAll() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query('SELECT COUNT(*) as total FROM checkOut');
            return result.recordset[0].total;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Order; 