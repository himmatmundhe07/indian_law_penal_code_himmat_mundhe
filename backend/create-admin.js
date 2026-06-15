const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

const seedAdmin = async () => {
  try {
    const adminEmail = 'demuofficial07@gmail.com';
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'himmat07*',
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
