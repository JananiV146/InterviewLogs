import 'dotenv/config.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Experience from './src/models/Experience.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const users = await User.find();
  console.log(`Found ${users.length} users:\n`);
  for (const u of users) {
    console.log(`Name: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
