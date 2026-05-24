// const express    = require('express');
// const mongoose   = require('mongoose');
// const cors       = require('cors');
// const http       = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config();

// const authRoutes     = require('./routes/auth');
// const categoryRoutes = require('./routes/category');
// const productRoutes  = require('./routes/product');
// const orderRoutes    = require('./routes/order');

// const app    = express();
// const server = http.createServer(app);  // ← wrap app in http server

// const io = new Server(server, {
//   cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
// });

// // Make io accessible in controllers
// app.set('io', io);

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => res.send('✅ Inventory API Running'));

// app.use('/api/auth',       authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products',   productRoutes);
// app.use('/api/orders',     orderRoutes);

// io.on('connection', (socket) => {
//   console.log('🔌 Client connected:', socket.id);
//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });
// });

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ DB Error:', err));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const productRoutes  = require('./routes/product');
const orderRoutes    = require('./routes/order');
const userRoutes     = require('./routes/user');
const supplierRoutes = require('./routes/supplier');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('✅ Inventory API Running'));

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/suppliers',  supplierRoutes);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Disconnected:', socket.id));
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    try {
      const User = require('./models/User');
      const Product = require('./models/Product');
      const suppliers = await User.find({ role: 'supplier' });
      const names = suppliers.map(s => s.name);
      await Product.updateMany(
        { supplier: { $in: names }, addedBySupplier: { $ne: true } },
        { $set: { addedBySupplier: true } }
      );
    } catch (migErr) {
      console.error('Startup migration error:', migErr);
    }
  })
  .catch(err => console.error('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));