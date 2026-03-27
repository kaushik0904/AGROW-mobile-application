const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
const authRoutes = require('./modules/auth/auth.routes');
const cropRoutes = require('./modules/crop/crop.routes');
const postRoutes = require('./modules/post/post.routes');
const userRoutes = require('./modules/user/user.routes');
const orderRoutes = require('./modules/order/order.routes');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agrow API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
