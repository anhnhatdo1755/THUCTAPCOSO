const sql = require('mssql');
const config = require('../config/database');

class Product {
    static async findAll() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM Products');
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
                .query('SELECT * FROM Products WHERE id = @id');
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async create(productData) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('name', sql.NVarChar, productData.name)
                .input('price', sql.Decimal, productData.price)
                .input('color', sql.VarChar, productData.color)
                .input('size', sql.VarChar, productData.size)
                .input('brand', sql.VarChar, productData.brand)
                .input('collection', sql.VarChar, productData.collection)
                .input('image', sql.VarChar, productData.image)
                .input('stock', sql.Int, productData.stock)
                .input('status', sql.VarChar, productData.status)
                .input('Categoryid', sql.Int, productData.Categoryid)
                .query('INSERT INTO Products (name, price, color, size, brand, collection, image, stock, status, Categoryid) VALUES (@name, @price, @color, @size, @brand, @collection, @image, @stock, @status, @Categoryid); SELECT SCOPE_IDENTITY() AS id');
            return result.recordset[0].id;
        } catch (err) {
            throw err;
        }
    }

    static async update(id, productData) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, productData.name)
                .input('price', sql.Decimal, productData.price)
                .input('color', sql.VarChar, productData.color)
                .input('size', sql.VarChar, productData.size)
                .input('brand', sql.VarChar, productData.brand)
                .input('collection', sql.VarChar, productData.collection)
                .input('image', sql.VarChar, productData.image)
                .input('stock', sql.Int, productData.stock)
                .input('status', sql.VarChar, productData.status)
                .input('Categoryid', sql.Int, productData.Categoryid)
                .query('UPDATE Products SET name = @name, price = @price, color = @color, size = @size, brand = @brand, collection = @collection, image = @image, stock = @stock, status = @status, Categoryid = @Categoryid WHERE id = @id');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async delete(id) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('UPDATE Products SET status = ? WHERE id = @id', ['inactive']);
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Product; 