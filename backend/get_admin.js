const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, role: String, isDeleted: Boolean
  }, { timestamps: true }));
  const admin = await User.findOne({ role: 'admin', isDeleted: false });
  if (admin) {
    console.log('Admin Email:', admin.email);
  } else {
    console.log('No admin found.');
  }
  mongoose.disconnect();
}).catch(console.error);
