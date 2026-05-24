// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//   productName: { type: String, required: true },
//   category:    { type: String, required: true },
//   price:       { type: Number, required: true },
//   quantity:    { type: Number, required: true, default: 1 },
//   totalPrice:  { type: Number, required: true },
//   orderedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   orderedByName: { type: String, required: true },
//   status:      { type: String, default: 'Pending', enum: ['Pending','Approved','Rejected'] },
// }, { timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:   { type: String, required: true },
  category:      { type: String, required: true },
  price:         { type: Number, required: true },
  quantity:      { type: Number, required: true, default: 1 },
  totalPrice:    { type: Number, required: true },
  orderedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderedByName: { type: String, required: true },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
  },
  distributor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);