import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndex = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Show current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection. indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}`);
    });

    // Drop the problematic index
    console.log('\n🗑️  Attempting to drop productId_1 index...');
    try {
      await collection.dropIndex('productId_1');
      console.log('✅ Successfully dropped productId_1 index! ');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index productId_1 does not exist (already deleted)');
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    console.log('\n📋 Remaining indexes:');
    const remainingIndexes = await collection.indexes();
    remainingIndexes. forEach(index => {
      console.log(`   - ${index. name}`);
    });

    console.log('\n✅ Done!  You can now add products.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error. message);
    process.exit(1);
  }
};

fixIndex();