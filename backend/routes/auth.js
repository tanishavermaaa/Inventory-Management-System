// const express = require('express');
// const router = express.Router();

// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const User = require('../models/User');


// // REGISTER
// router.post('/register', async (req, res) => {

//   const { name, email, password, role } = req.body;

//   try {

//     const existing = await User.findOne({ email });

//     if (existing) {
//       return res.status(400).json({
//         message: 'Email already registered'
//       });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//       role
//     });

//     res.status(201).json({
//       message: 'User registered successfully'
//     });

//   } catch (err) {

//     res.status(500).json({
//       message: 'Server error',
//       error: err.message
//     });

//   }
// });


// // LOGIN
// router.post('/login', async (req, res) => {

//   const { email, password } = req.body;

//   try {

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: 'Invalid credentials'
//       });
//     }

//     const match = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!match) {
//       return res.status(400).json({
//         message: 'Invalid credentials'
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: '1d'
//       }
//     );

//     res.json({

//       token,

//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }

//     });

//   } catch (err) {

//     res.status(500).json({
//       message: 'Server error',
//       error: err.message
//     });

//   }
// });

// module.exports = router;

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Restrict registration of new admins if an admin already exists
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin', isDeleted: false });
      if (adminExists) {
        return res.status(400).json({
          message: 'An admin already exists in the system. New admins can only be designated by the existing admin.'
        });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role: role || 'user' });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Check if any admin exists in the system
router.get('/admin-exists', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin', isDeleted: false });
    res.json({ exists: !!adminExists });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total count of admins
router.get('/admin-count', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin', isDeleted: false });
    res.json({ count: adminCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    // Specific error messages
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        message: 'Your account has been deleted by admin.',
        code: 'ACCOUNT_DELETED'
      });
    }

    console.log('--- LOGIN DEBUG ---');
    console.log('Received password:', JSON.stringify(password));
    console.log('Password length:', password ? password.length : 'undefined');
    console.log('Password type:', typeof password);
    console.log('Stored hash:', user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', match);
    if (!match) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;