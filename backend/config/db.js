import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://rajputkaransingh74888:test123@cluster0.oy0rg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Hardcoded MongoDB URI

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle errors
    conn.connection.on('error', (err) => console.error('❌ MongoDB Connection Error:', err));
    conn.connection.on('disconnected', () => console.log('⚠️ MongoDB Disconnected'));
    conn.connection.on('reconnected', () => console.log('🔄 MongoDB Reconnected'));

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await conn.connection.close();
      console.log('🛑 MongoDB Connection Closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('🛠️ Steps to Fix:');
    console.error('1️⃣ Ensure MongoDB is running on your machine');
    console.error('2️⃣ Verify the connection string is correct');
    console.error('3️⃣ Make sure MongoDB is running on port 27017');
    process.exit(1);
  }
};

export default connectDB;
