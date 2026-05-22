const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  category:     { type: String, required: true },
  supplier:     { type: String, required: true },
  price:        { type: Number, required: true },
  stock:        { type: Number, required: true, default: 0 },
  minThreshold: { type: Number, required: true, default: 25 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

productSchema.virtual('stockStatusColor').get(function() {
  const threshold = this.minThreshold != null ? this.minThreshold : 25;
  if (this.stock <= threshold) return '#dc3545'; // Red
  if (this.stock <= 80) return '#ffc107'; // Yellow
  return '#198754'; // Green
});

module.exports = mongoose.model('Product', productSchema);