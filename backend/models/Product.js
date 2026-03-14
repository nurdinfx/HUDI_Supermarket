import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Admin who created it
  name: { type: String, required: true },
  images: [{ type: String, required: true }],
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  price: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 }, // Discount percentage
  countInStock: { type: Number, required: true, default: 0 },
  variants: [
    {
      sizeLabel: { type: String, required: true },
      color: { type: String, required: true },
      stock: { type: Number, required: true, default: 0 }
    }
  ],
  ratings: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
