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
                .input('status', sql.VarChar, 'inactive')
                .query('UPDATE Products SET status = @status WHERE id = @id');
            return result.rowsAffected[0];
        } catch (err) {
            throw err;
        }
    }

    static async countAll() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query('SELECT COUNT(*) as total FROM Products');
            return result.recordset[0].total;
        } catch (err) {
            throw err;
        }
    }

    static async findPaginated(offset, limit, filters = {}) {
        try {
            const pool = await sql.connect(config);
            let query = 'SELECT * FROM Products WHERE 1=1';
            if (!filters.status) filters.status = 'active';
            if (filters.size) query += ` AND size = @size`;
            if (filters.color) query += ` AND color = @color`;
            if (filters.minPrice) query += ` AND price >= @minPrice`;
            if (filters.maxPrice) query += ` AND price <= @maxPrice`;
            if (filters.brand) {
                const brands = filters.brand.split(',').map(b => `'${b}'`).join(',');
                query += ` AND brand IN (${brands})`;
            }
            if (filters.collection) {
                const collections = filters.collection.split(',').map(c => `'${c.toLowerCase()}'`).join(',');
                query += ` AND collection IS NOT NULL AND LOWER(collection) IN (${collections})`;
            }
            if (filters.status) query += ` AND LOWER(status) = LOWER(@status)`;
            if (filters.category) {
                const ids = filters.category.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
                if (ids.length > 0) {
                    query += ` AND Categoryid IN (${ids.join(',')})`;
                }
            }
            if (filters.name) {
                query += ` AND LOWER(name) LIKE @name`;
            }
            query += ' ORDER BY id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

            const request = pool.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit);
            if (filters.size) request.input('size', sql.VarChar, filters.size);
            if (filters.color) request.input('color', sql.VarChar, filters.color);
            if (filters.minPrice) request.input('minPrice', sql.Decimal, filters.minPrice);
            if (filters.maxPrice) request.input('maxPrice', sql.Decimal, filters.maxPrice);
            if (filters.status) request.input('status', sql.VarChar, filters.status);
            if (filters.name) request.input('name', sql.VarChar, `%${filters.name.toLowerCase()}%`);

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Product;