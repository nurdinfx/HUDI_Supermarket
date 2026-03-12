import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config({ path: './.env' });

const checkProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const id = '69b2676670ce7ec6913bf8f1';
    const product = await Product.findById(id);
    if (product) {
      console.log('PRODUCT_FOUND:', product.name);
    } else {
      console.log('PRODUCT_NOT_FOUND');
      // Let's also list all products to see if any exist
      const count = await Product.countDocuments();
      console.log('TOTAL_PRODUCTS:', count);
      const samples = await Product.find().limit(3);
      console.log('SAMPLE_IDS:', samples.map(s => s._id));
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkProduct();
