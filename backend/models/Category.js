import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  icon: { type: String } // Emoji or icon class
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
