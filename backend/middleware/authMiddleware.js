// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token, access denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password');
//     if (!user) return res.status(401).json({ message: 'User not found' });
//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = authMiddleware;

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if user was deleted by admin
    if (user.isDeleted) {
      return res.status(403).json({
        message: 'Your account has been deleted by admin.',
        code: 'ACCOUNT_DELETED'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const supplierMiddleware = (req, res, next) => {
  if (req.user?.role !== 'supplier') {
    return res.status(403).json({ message: 'Supplier access required' });
  }
  next();
};

const supplierOrAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'supplier') {
    return res.status(403).json({ message: 'Admin or Supplier access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, supplierMiddleware, supplierOrAdminMiddleware };