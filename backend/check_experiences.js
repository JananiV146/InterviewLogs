import 'dotenv/config.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Experience from './src/models/Experience.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const experiences = await Experience.find();
  console.log(`Found ${experiences.length} experiences:\n`);
  for (const exp of experiences) {
    console.log(`ID: ${exp._id}`);
    console.log(`Company: ${exp.company}`);
    console.log(`Role: ${exp.role_title}`);
    console.log(`Status: ${exp.status}`);
    console.log(`User ID: ${exp.user_id}`);
    console.log(`Is Anonymous: ${exp.is_anonymous}`);
    console.log('-------------------');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
