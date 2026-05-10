import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Venue', 'Catering', 'Photography', 'Decor', 'Entertainment', 'Other'] },
  description: { type: String },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  contactEmail: { type: String }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
