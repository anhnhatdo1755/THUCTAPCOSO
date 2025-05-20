const sql = require('mssql');
const config = require('../config/database');

class User {
    static async findByEmail(email) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('email', sql.VarChar, email)
                .query('SELECT * FROM Users WHERE email = @email');
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async create(userData) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('name', sql.NVarChar, userData.name)
                .input('email', sql.VarChar, userData.email)
                .input('passWord', sql.VarChar, userData.passWord)
                .input('phone', sql.VarChar, userData.phone)
                .input('role', sql.VarChar, userData.role || 'customer')
                .input('status', sql.VarChar, userData.status || 'active')
                .query('INSERT INTO Users (name, email, passWord, phone, role, status) VALUES (@name, @email, @passWord, @phone, @role, @status); SELECT SCOPE_IDENTITY() AS id');
            return result.recordset[0].id;
        } catch (err) {
            throw err;
        }
    }

    static async createCart(userId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('Usersid', sql.Int, userId)
                .query('INSERT INTO Cart (totalPrice, Usersid) VALUES (0, @Usersid); SELECT SCOPE_IDENTITY() AS id');
            return result.recordset[0].id;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = User; 