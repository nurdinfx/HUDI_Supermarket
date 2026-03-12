// Fix existing Google Image links in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const extractImageUrl = (url) => {
  if (!url) return url;
  try {
    if (url.includes('google.com/imgres')) {
      const urlObj = new URL(url);
      const imgurl = urlObj.searchParams.get('imgurl');
      if (imgurl) return imgurl;
    }
  } catch (e) {
    console.error('Error parsing URL:', url);
  }
  return url;
};

const fixData = async () => {
  console.log('Fixing products...');
  const products = await Product.find({});
  for (const product of products) {
    let changed = false;
    
    // Fix images array
    if (product.images && product.images.length > 0) {
      const newImages = product.images.map(img => {
        const fixed = extractImageUrl(img);
        if (fixed !== img) changed = true;
        return fixed;
      });
      if (changed) {
        product.images = newImages;
      }
    }

    // Fix single image string (if it still exists in old documents)
    if (product.image && typeof product.image === 'string') {
       const fixed = extractImageUrl(product.image);
       if (fixed !== product.image) {
           product.image = fixed;
           changed = true;
       }
    }

    if (changed) {
      await product.save();
      console.log(`Updated product: ${product.name}`);
    }
  }

  console.log('Fixing categories...');
  const categories = await Category.find({});
  for (const category of categories) {
    let changed = false;
    if (category.icon && typeof category.icon === 'string') {
       const fixed = extractImageUrl(category.icon);
       if (fixed !== category.icon) {
           category.icon = fixed;
           changed = true;
       }
    }
    if (category.image && typeof category.image === 'string') {
       const fixed = extractImageUrl(category.image);
       if (fixed !== category.image) {
           category.image = fixed;
           changed = true;
       }
    }
    if (changed) {
      await category.save();
      console.log(`Updated category: ${category.name}`);
    }
  }

  console.log('Done.');
  process.exit();
};

fixData();
