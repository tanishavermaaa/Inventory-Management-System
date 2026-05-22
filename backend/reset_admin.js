const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, password: String, role: String, isDeleted: Boolean
  }, { timestamps: true }));

  const admin = await User.findOne({ email: 'era@gmail.com' });
  if (admin) {
    const hashed = await bcrypt.hash('admin12345678', 10);
    admin.password = hashed;
    await admin.save();
    console.log('Successfully reset password for', admin.email);
  } else {
    console.log('Admin not found!');
  }
  mongoose.disconnect();
}).catch(console.error);
