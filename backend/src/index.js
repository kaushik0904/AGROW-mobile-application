const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { initCronJobs } = require('./core/cron/hub-check');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Attach io to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

const port = process.env.PORT || 3000;

app.use(cors());
const authRoutes = require('./modules/auth/auth.routes');
const cropRoutes = require('./modules/crop/crop.routes');
const postRoutes = require('./modules/post/post.routes');
const userRoutes = require('./modules/user/user.routes');
const orderRoutes = require('./modules/order/order.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const hubRoutes = require('./modules/hub/hub.routes');
const paymentRoutes = require('./modules/payment/payment.routes');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agrow API is running' });
});

initCronJobs();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
