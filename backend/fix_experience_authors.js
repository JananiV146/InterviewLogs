import 'dotenv/config.js';
import mongoose from 'mongoose';
import Experience from './src/models/Experience.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Update Grootan Technologies post user_id to MouciSri TN's ID
  const result = await Experience.updateOne(
    { company: 'Grootan Technologies', role_title: 'ML Engineer' },
    { user_id: new mongoose.Types.ObjectId('6a0bfa9eda5faf1eec3f19d9') }
  );

  console.log('Update result:', result);

  await mongoose.disconnect();
}

run().catch(console.error);
