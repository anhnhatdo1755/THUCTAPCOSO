require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// SQL Server config
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || '123456',
  server: process.env.DB_SERVER || 'NHATANH\\QLBH',
  database: process.env.DB_NAME || 'qlbh',
  options: { encrypt: true, trustServerCertificate: true }
};

// Connect to SQL Server
sql.connect(dbConfig).catch(err => console.error('DB Connection Error:', err));

// JWT Middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

// Helper: Pagination, Filtering, Sorting
function buildQuery(base, req, allowedFilters = [], allowedSorts = []) {
  let where = [];
  let params = [];
  if (base.includes('Products')) {
    where.push('status = @status');
    params.push({ name: 'status', type: sql.VarChar, value: 'active' });
  }
  allowedFilters.forEach(f => {
    if (req.query[f]) {
      where.push(`${f} LIKE @${f}`);
      params.push({ name: f, type: sql.VarChar, value: `%${req.query[f]}%` });
    }
  });
  let query = base;
  if (where.length) {
    if (/\bWHERE\b/i.test(base)) {
      query += ' AND ' + where.join(' AND ');
    } else {
      query += ' WHERE ' + where.join(' AND ');
    }
  }
  if (req.query.sort && allowedSorts.includes(req.query.sort)) {
    query += ` ORDER BY ${req.query.sort} ${req.query.order === 'desc' ? 'DESC' : 'ASC'}`;
  } else {
    query += ' ORDER BY id ASC';
  }
  const limit = parseInt(req.query.limit) || 9;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
  params.push({ name: 'offset', type: sql.Int, value: offset });
  params.push({ name: 'limit', type: sql.Int, value: limit });
  return { query, params };
}

// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, passWord, phone } = req.body;
  console.log('Register request:', { name, email, phone }); // Debug log
  
  // Kiểm tra các trường bắt buộc
  if (!name || !email || !passWord) {
    console.log('Missing fields'); // Debug log
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const checkEmail = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (checkEmail.recordset.length > 0) {
      console.log('Email already exists'); // Debug log
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Mã hóa mật khẩu
    const hash = await bcrypt.hash(passWord, 10);

    // Thêm user mới và lấy id
    const userResult = await sql.query`
      INSERT INTO Users (name, email, passWord, phone, role, status)
      OUTPUT INSERTED.id
      VALUES (${name}, ${email}, ${hash}, ${phone}, 'customer', 'active')
    `;
    const userId = userResult.recordset[0].id;

    // Tạo giỏ hàng cho user mới
    await sql.query`
      INSERT INTO Cart (totalPrice, Usersid)
      VALUES (0, ${userId})
    `;
    console.log('User and cart inserted successfully'); // Debug log
    
    res.json({ message: 'Register success' });
  } catch (err) {
    console.error('Register error:', err); // Debug log
    res.status(500).json({ message: 'Register failed', error: err.message });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, passWord } = req.body;
  try {
    const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'User not found' });
    const match = await bcrypt.compare(passWord, user.passWord);
    if (!match) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// AUTH: Logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    // Trong trường hợp này, chúng ta chỉ cần trả về thành công
    // vì việc xóa token được thực hiện ở phía client
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

// USERS: List users (admin only, with pagination/filter/search/sort)
app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
  const { query, params } = buildQuery('SELECT * FROM Users', req, ['name', 'email', 'role'], ['name', 'email', 'role']);
  try {
    const request = new sql.Request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Get users failed', error: err.message });
  }
});

// PRODUCTS: List products (public, with pagination/filter/search/sort)
app.get('/api/products', async (req, res) => {
  const { query, params } = buildQuery('SELECT * FROM Products', req, 
    ['name', 'brand', 'color', 'size', 'collection'], 
    ['id', 'name', 'price', 'brand', 'stock']);
  try {
    const request = new sql.Request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Get products failed', error: err.message });
  }
});

// PRODUCTS: Get product detail (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Products WHERE id = ${req.params.id} AND status = 'active'`;
    if (!result.recordset[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Get product failed', error: err.message });
  }
});

// PRODUCTS: Add product (admin only, with image upload)
app.post('/api/products', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  const { name, price, color, size, brand, collection, stock, Categoryid } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    await sql.query`INSERT INTO Products (name, price, color, size, brand, collection, image, stock, status, Categoryid) 
                    VALUES (${name}, ${price}, ${color}, ${size}, ${brand}, ${collection}, ${image}, ${stock}, 'active', ${Categoryid})`;
    res.json({ message: 'Product added' });
  } catch (err) {
    res.status(500).json({ message: 'Add product failed', error: err.message });
  }
});

// PRODUCTS: Update product (admin only)
app.put('/api/products/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  const { name, price, color, size, brand, collection, stock, Categoryid, status } = req.body;
  const image = req.file ? req.file.path : null;
  const id = req.params.id;
  try {
    const check = await sql.query`SELECT * FROM Products WHERE id = ${id} AND status = 'active'`;
    if (!check.recordset[0]) return res.status(404).json({ message: 'Product not found' });
    let setStr = 'name=@name, price=@price, color=@color, size=@size, brand=@brand, collection=@collection, stock=@stock, Categoryid=@Categoryid';
    if (image) setStr += ', image=@image';
    if (status) setStr += ', status=@status';
    const request = new sql.Request()
      .input('name', sql.VarChar, name)
      .input('price', sql.Int, price)
      .input('color', sql.VarChar, color)
      .input('size', sql.VarChar, size)
      .input('brand', sql.VarChar, brand)
      .input('collection', sql.VarChar, collection)
      .input('stock', sql.Int, stock)
      .input('Categoryid', sql.Int, Categoryid)
      .input('id', sql.Int, id);
    if (image) request.input('image', sql.VarChar, image);
    if (status) request.input('status', sql.VarChar, status);
    await request.query(`UPDATE Products SET ${setStr} WHERE id=@id`);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: 'Update product failed', error: err.message });
  }
});

// PRODUCTS: Delete product (admin only)
app.delete('/api/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await sql.query`UPDATE Products SET status = 'inactive' WHERE id = ${req.params.id}`;
    res.json({ message: 'Product set to inactive' });
  } catch (err) {
    res.status(500).json({ message: 'Delete product failed', error: err.message });
  }
});

// CART: Get user's cart
app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const cart = await sql.query`SELECT * FROM Cart WHERE Usersid = ${req.user.id}`;
    if (!cart.recordset[0]) return res.json({ products: [] });
    const cartId = cart.recordset[0].id;
    const products = await sql.query`
      SELECT cp.id as cartProductId, p.*, cp.quantity 
      FROM cartProduct cp 
      JOIN Products p ON cp.Productsid = p.id 
      WHERE cp.Cartid = ${cartId} AND p.status = 'active'`;
    const productsWithId = products.recordset.map(item => ({ ...item, id: item.cartProductId }));
    res.json({ cartId, products: productsWithId });
  } catch (err) {
    res.status(500).json({ message: 'Get cart failed', error: err.message });
  }
});

// CART: Add product to cart
app.post('/api/cart', verifyToken, async (req, res) => {
  const { Productsid, quantity } = req.body;
  try {
    const prod = await sql.query`SELECT * FROM Products WHERE id = ${Productsid} AND status = 'active'`;
    if (!prod.recordset[0]) return res.status(404).json({ message: 'Product not found or inactive' });
    let cart = await sql.query`SELECT * FROM Cart WHERE Usersid = ${req.user.id}`;
    let cartId;
    if (!cart.recordset[0]) {
      const result = await sql.query`INSERT INTO Cart (totalPrice, Usersid) OUTPUT INSERTED.id VALUES (0, ${req.user.id})`;
      cartId = result.recordset[0].id;
    } else {
      cartId = cart.recordset[0].id;
    }
    const exist = await sql.query`SELECT * FROM cartProduct WHERE Cartid = ${cartId} AND Productsid = ${Productsid}`;
    if (exist.recordset[0]) {
      await sql.query`UPDATE cartProduct SET quantity = quantity + ${quantity} WHERE id = ${exist.recordset[0].id}`;
    } else {
      await sql.query`INSERT INTO cartProduct (quantity, Productsid, Cartid) VALUES (${quantity}, ${Productsid}, ${cartId})`;
    }
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Add to cart failed', error: err.message });
  }
});

// CART: Remove product from cart
app.delete('/api/cart/:cartProductId', verifyToken, async (req, res) => {
  try {
    await sql.query`DELETE FROM cartProduct WHERE id = ${req.params.cartProductId}`;
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Remove from cart failed', error: err.message });
  }
});

// CART: Update quantity of product in cart
app.put('/api/cart/:cartProductId', verifyToken, async (req, res) => {
  const cartProductId = req.params.cartProductId;
  const { quantity } = req.body; // quantity: số lượng muốn tăng/giảm (có thể là +1 hoặc -1)
  try {
    // Lấy cartProduct
    const cartProduct = await sql.query`SELECT * FROM cartProduct WHERE id = ${cartProductId}`;
    if (!cartProduct.recordset[0]) return res.status(404).json({ message: 'Cart product not found' });
    // Kiểm tra quyền sở hữu cart
    const cart = await sql.query`SELECT * FROM Cart WHERE id = ${cartProduct.recordset[0].Cartid}`;
    if (!cart.recordset[0] || cart.recordset[0].Usersid !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Lấy số lượng tồn kho của sản phẩm
    const product = await sql.query`SELECT stock FROM Products WHERE id = ${cartProduct.recordset[0].Productsid}`;
    if (!product.recordset[0]) return res.status(404).json({ message: 'Product not found' });
    const stock = product.recordset[0].stock;
    // Tính số lượng mới
    let newQuantity = cartProduct.recordset[0].quantity + Number(quantity);
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > stock) return res.status(400).json({ message: 'Số lượng vượt quá tồn kho!' });
    await sql.query`UPDATE cartProduct SET quantity = ${newQuantity} WHERE id = ${cartProductId}`;
    res.json({ message: 'Quantity updated', newQuantity });
  } catch (err) {
    res.status(500).json({ message: 'Update quantity failed', error: err.message });
  }
});

// CHECKOUT: Create checkout (cho cả admin và customer)
app.post('/api/checkout', verifyToken, async (req, res) => {
  const { shippingFee, paymentMethod, address, name, phone, email, city } = req.body;
  
  try {
    // 1. Kiểm tra giỏ hàng của user
    const cart = await sql.query`
      SELECT * FROM Cart 
      WHERE Usersid = ${req.user.id}
    `;
    
    if (!cart.recordset[0]) {
      return res.status(400).json({ message: 'No cart found' });
    }

    const cartId = cart.recordset[0].id;

    // 2. Lấy sản phẩm trong giỏ hàng
    const cartProducts = await sql.query`
      SELECT cp.*, p.price, p.stock, p.status
      FROM cartProduct cp
      JOIN Products p ON cp.Productsid = p.id
      WHERE cp.Cartid = ${cartId}
    `;

    if (!cartProducts.recordset.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 3. Kiểm tra tồn kho và tính tổng tiền
    let totalPrice = 0;
    for (const item of cartProducts.recordset) {
      // Kiểm tra sản phẩm còn active không
      if (item.status !== 'active') {
        return res.status(400).json({ 
          message: `Product ${item.Productsid} is no longer available` 
        });
      }

      // Kiểm tra số lượng tồn kho
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.Productsid}. Available: ${item.stock}` 
        });
      }

      totalPrice += item.price * item.quantity;
    }

    // 4. Bắt đầu transaction
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // 5. Tạo đơn hàng
      const result = await transaction.request().query`
        INSERT INTO checkOut (
          totalPrice, 
          shippingFee, 
          status, 
          paymentMethod, 
          address, 
          date, 
          Usersid,
          Cartid,
          name,
          phone,
          email,
          city
        ) 
        OUTPUT INSERTED.id 
        VALUES (
          ${totalPrice}, 
          ${shippingFee}, 
          'pending', 
          ${paymentMethod}, 
          ${address}, 
          GETDATE(), 
          ${req.user.id},
          ${cartId},
          ${name},
          ${phone},
          ${email},
          ${city}
        )
      `;

      const checkOutId = result.recordset[0].id;

      // 6. Thêm chi tiết sản phẩm và cập nhật tồn kho
      for (const item of cartProducts.recordset) {
        // Thêm vào productsCheckOut
        await transaction.request().query`
          INSERT INTO productsCheckOut (
            quantity, 
            checkOutPrice, 
            Productsid, 
            checkOutid
          ) 
          VALUES (
            ${item.quantity}, 
            ${item.price}, 
            ${item.Productsid}, 
            ${checkOutId}
          )
        `;

        // Cập nhật tồn kho
        await transaction.request().query`
          UPDATE Products 
          SET stock = stock - ${item.quantity}
          WHERE id = ${item.Productsid}
        `;

        // Xóa sản phẩm khỏi giỏ hàng
        await transaction.request().query`
          DELETE FROM cartProduct 
          WHERE id = ${item.id}
        `;
      }

      // 7. Cập nhật tổng tiền giỏ hàng
      await transaction.request().query`
        UPDATE Cart 
        SET totalPrice = 0 
        WHERE id = ${cartId}
      `;

      await transaction.commit();

      res.json({ 
        message: 'Checkout successful',
        checkOutId,
        totalPrice: totalPrice + shippingFee
      });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
});

// CHECKOUT: List checkouts (admin: all, customer: own, with pagination/filter/search/sort)
app.get('/api/checkout', verifyToken, async (req, res) => {
  let base = 'SELECT * FROM checkOut';
  let allowedFilters = ['status', 'paymentMethod', 'address'];
  let allowedSorts = ['date', 'totalPrice', 'status'];
  if (req.user.role !== 'admin') {
    base += ' WHERE Usersid = @Usersid';
    allowedFilters = allowedFilters.filter(f => f !== 'Usersid');
  }
  const { query, params } = buildQuery(base, req, allowedFilters, allowedSorts);
  if (req.user.role !== 'admin') params.push({ name: 'Usersid', type: sql.Int, value: req.user.id });
  try {
    const request = new sql.Request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Get checkouts failed', error: err.message });
  }
});

// CHECKOUT: Update status (admin only)
app.put('/api/checkout/:id', verifyToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await sql.query`UPDATE checkOut SET status = ${status} WHERE id = ${req.params.id}`;
    res.json({ message: 'Checkout status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Update checkout failed', error: err.message });
  }
});

// USERS: Add user (admin only)
app.post('/api/users', verifyToken, isAdmin, async (req, res) => {
  const { name, email, passWord, role } = req.body;
  
  // Kiểm tra các trường bắt buộc
  if (!name || !email || !passWord || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const checkEmail = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Mã hóa mật khẩu
    const hash = await bcrypt.hash(passWord, 10);

    // Thêm user mới
    await sql.query`INSERT INTO Users (name, email, passWord, role, status) 
                   VALUES (${name}, ${email}, ${hash}, ${role}, 'active')`;
    
    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Create user failed', error: err.message });
  }
});

// USERS: Update user (admin only)
app.put('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, email, passWord, role, status } = req.body;
  const id = req.params.id;
  try {
    let setStr = [];
    let request = new sql.Request().input('id', sql.Int, id);
    if (name) { setStr.push('name=@name'); request.input('name', sql.VarChar, name); }
    if (email) { setStr.push('email=@email'); request.input('email', sql.VarChar, email); }
    if (role) { setStr.push('role=@role'); request.input('role', sql.VarChar, role); }
    if (status) { setStr.push('status=@status'); request.input('status', sql.VarChar, status); }
    if (passWord) {
      const hash = await bcrypt.hash(passWord, 10);
      setStr.push('passWord=@passWord');
      request.input('passWord', sql.VarChar, hash);
    }
    if (!setStr.length) return res.status(400).json({ message: 'No fields to update' });
    await request.query(`UPDATE Users SET ${setStr.join(', ')} WHERE id=@id`);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Update user failed', error: err.message });
  }
});

// USERS: Delete user (admin only)
app.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await sql.query`UPDATE Users SET status = 'inactive' WHERE id = ${req.params.id}`;
    res.json({ message: 'User set to inactive' });
  } catch (err) {
    res.status(500).json({ message: 'Delete user failed', error: err.message });
  }
});

// CHECKOUT: Cancel checkout (cho cả admin và customer)
app.put('/api/checkout/:id/cancel', verifyToken, async (req, res) => {
  try {
    // 1. Kiểm tra đơn hàng
    const checkout = await sql.query`
      SELECT * FROM checkOut 
      WHERE id = ${req.params.id}
    `;
    
    if (!checkout.recordset[0]) {
      return res.status(404).json({ message: 'Checkout not found' });
    }

    // 2. Kiểm tra quyền hủy đơn
    const isAdmin = req.user.role === 'admin';
    const isOwner = checkout.recordset[0].Usersid === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // 3. Kiểm tra trạng thái đơn hàng
    const currentStatus = checkout.recordset[0].status;
    if (currentStatus === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    if (currentStatus === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed order' });
    }

    // 4. Kiểm tra thời gian hủy đơn (nếu là customer)
    if (!isAdmin) {
      const orderDate = new Date(checkout.recordset[0].date);
      const now = new Date();
      const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
      
      // Không cho phép hủy đơn sau 24h
      if (hoursDiff > 24) {
        return res.status(400).json({ 
          message: 'Cannot cancel order after 24 hours. Please contact admin for support.' 
        });
      }
    }

    // 5. Bắt đầu transaction
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // 6. Lấy danh sách sản phẩm
      const products = await transaction.request().query`
        SELECT * FROM productsCheckOut 
        WHERE checkOutid = ${req.params.id}
      `;

      // 7. Hoàn trả số lượng tồn kho
      for (const product of products.recordset) {
        await transaction.request().query`
          UPDATE Products 
          SET stock = stock + ${product.quantity}
          WHERE id = ${product.Productsid}
        `;
      }

      // 8. Cập nhật trạng thái đơn hàng
      await transaction.request().query`
        UPDATE checkOut 
        SET status = 'cancelled'
        WHERE id = ${req.params.id}
      `;

      await transaction.commit();

      res.json({ message: 'Order cancelled successfully' });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    res.status(500).json({ message: 'Cancel order failed', error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log('Server running on port', PORT));
