import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User collection
    const userCollection = mongoose.connection.collection('users');

    // Drop all existing indexes except _id
    console.log('Dropping existing indexes...');
    const indexes = await userCollection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await userCollection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }

    // Create new indexes from the schema
    console.log('Creating new indexes from schema...');
    await User.init();
    console.log('Successfully created new indexes');

    // Verify the new indexes
    const newIndexes = await userCollection.indexes();
    console.log('Current indexes:', newIndexes);

    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes(); 