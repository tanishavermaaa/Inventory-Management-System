const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, password: String, role: String, isDeleted: Boolean
  }, { timestamps: true }));

  const supplier = await User.findOne({ email: 'supplier@gmail.com' });
  if (supplier) {
    const hashed = await bcrypt.hash('supplier12345678', 10);
    supplier.password = hashed;
    supplier.role = 'supplier';
    supplier.isDeleted = false;
    await supplier.save();
    console.log('Successfully reset supplier password for', supplier.email);
  } else {
    const hashed = await bcrypt.hash('supplier12345678', 10);
    await User.create({
      name: 'HP Group',
      email: 'supplier@gmail.com',
      password: hashed,
      role: 'supplier',
      isDeleted: false
    });
    console.log('Successfully seeded default supplier user: supplier@gmail.com');
  }
  mongoose.disconnect();
}).catch(console.error);
