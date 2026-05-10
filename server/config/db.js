import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connection = await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  });

  console.log(`✅ MongoDB connected: ${connection.connection.host}`);
  return connection;
};

export default connectDB;
