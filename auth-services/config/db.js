import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    let dbUri = process.env.MONGO_URI;

    mongoose.set('strictQuery', false);

    if (!dbUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    //Replace the PASSWORD keyword in the URI with the real password
    if (dbUri.includes('PASSWORD')) {
      const dbPassWord = process.env.DB_PASSWORD;
      if (!dbPassWord) {
        throw new Error('DB_PASSWORD is not defined in environment variables');
      }
      dbUri = dbUri.replace('PASSWORD', dbPassWord);
    }

    console.log('✅ Full DB connection string');

    const conn = await mongoose.connect(dbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err); // Hiện lỗi chi tiết ở đây
    throw err;
  }
};
export default connectDB;
