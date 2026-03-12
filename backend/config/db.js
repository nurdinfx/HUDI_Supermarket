import mongoose from 'mongoose';

const connectDB = async () => {
  // Longer timeouts for reliable Atlas connections
  const options = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Atlas Connection Error: ${error.message}`);
    console.log('Attempting to connect to local MongoDB...');
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/hudi_supermarket', options);
      console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error(`Local MongoDB Error: ${localError.message}`);
      console.warn('⚠️  Backend running WITHOUT database - all data calls will fail!');
      console.warn('Fix: Add your IP to MongoDB Atlas Network Access whitelist.');
    }
  }
};

export default connectDB;
