import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    const adminEmail = 'admin@hudi.com';
    const adminPassword = 'admin123';

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log('Admin user already exists. Updating password...');
      user.password = adminPassword;
      await user.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new Admin user...');
      user = await User.create({
        name: 'Hudi Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully.');
    }

    console.log('-----------------------------------');
    console.log('Login Email: ' + adminEmail);
    console.log('Login PW:    ' + adminPassword);
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
