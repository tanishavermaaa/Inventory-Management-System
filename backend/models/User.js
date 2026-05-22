// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },

//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },

//   password: {
//     type: String,
//     required: true
//   },

//   role: {
//     type: String,
//     enum: ['admin', 'user'],
//     default: 'user'
//   }

// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'user'], default: 'user' },
  isDeleted: { type: Boolean, default: false },   // ← NEW: soft delete flag
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);