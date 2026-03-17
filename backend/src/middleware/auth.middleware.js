const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expect format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user payload from token to request
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
