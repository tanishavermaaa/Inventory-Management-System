require('dotenv').config();
const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, password: String, role: String, isDeleted: Boolean
  }, { timestamps: true }));

  const result = await User.deleteMany({});
  console.log('Deleted', result.deletedCount, 'users');
  console.log('Database is clean. You can now register fresh.');
  await mongoose.disconnect();
}

reset().catch(e => console.error(e));
