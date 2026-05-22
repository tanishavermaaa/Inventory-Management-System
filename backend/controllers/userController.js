const User  = require('../models/User');
const bcrypt = require('bcryptjs');

// GET all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// MAKE ADMIN
const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'User is already an admin' });

    user.role = 'admin';
    await user.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('user:updated', { _id: user._id, role: 'admin' });

    res.json({ message: `${user.name} is now an admin!`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// REMOVE ADMIN
const removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Can't remove own admin role if they are the only admin
    if (user._id.toString() === req.user._id.toString()) {
      const otherAdmins = await User.countDocuments({
        role: 'admin',
        isDeleted: false,
        _id: { $ne: req.user._id }
      });

      if (otherAdmins === 0) {
        return res.status(400).json({
          message: 'You must assign another admin before removing your own admin privileges.'
        });
      }
    }

    user.role = 'user';
    await user.save();
    res.json({ message: `${user.name}'s admin role removed.`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Admin self-deletion check
    if (targetUser._id.toString() === req.user._id.toString()) {
      const otherAdmins = await User.countDocuments({
        role: 'admin',
        isDeleted: false,
        _id: { $ne: req.user._id }
      });

      if (otherAdmins === 0) {
        return res.status(400).json({
          message: 'You must assign another admin before deleting your account.',
          code: 'LAST_ADMIN'
        });
      }
    }

    // Soft delete — mark as deleted so JWT check catches them
    targetUser.isDeleted = true;
    await targetUser.save();

    // Emit socket to notify the deleted user
    const io = req.app.get('io');
    if (io) io.emit(`user:deleted:${targetUser._id}`, {
      message: 'Your account has been deleted by admin.'
    });

    res.json({ message: `${targetUser.name} has been deleted.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CHANGE current user password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE current user profile
const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully!', 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers, makeAdmin, removeAdmin, deleteUser, getProfile, changePassword, updateProfile };