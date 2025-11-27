import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@shopwise.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Test User',
    email: 'test@shopwise.com',
    password: 'test123',
    role: 'user'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'john123',
    role: 'user'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Successfully seeded users');
    console.log('\n📝 Login credentials:');
    users.forEach(u => {
      console.log(`   ${u.email} / ${u.password} (${u.role})`);
    });

    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();