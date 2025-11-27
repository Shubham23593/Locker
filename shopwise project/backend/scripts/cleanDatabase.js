import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    rl.question('⚠️  This will delete ALL data. Are you sure? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        
        console.log('🗑️  Database cleaned successfully');
      } else {
        console.log('❌ Operation cancelled');
      }
      
      mongoose.connection.close();
      rl.close();
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanDatabase();