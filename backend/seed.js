import mongoose from 'mongoose';
import 'dotenv/config.js';
import User from './src/models/User.js';
import Experience from './src/models/Experience.js';

const sampleExperiences = [
  {
    company: 'Google',
    role_title: 'Software Engineer Intern',
    difficulty: 'hard',
    prep_tips: 'Focus on LeetCode medium-hard problems. Study system design basics. Practice mock interviews.',
    tags: ['dsa', 'system-design', 'internship'],
    rounds: [
      {
        round_order: 1,
        round_type: 'phone',
        summary: '45-minute phone screen with LeetCode-style problem',
        questions: [
          {
            question_text: 'Longest substring without repeating characters',
            question_type: 'dsa',
            answer_brief: 'Use sliding window with hash map. Time: O(n), Space: O(min(m,n)) where m is charset size',
          },
        ],
      },
      {
        round_order: 2,
        round_type: 'onsite',
        summary: 'Full-day with 4 interviews: 2 coding, 1 system design, 1 behavioral',
        questions: [
          {
            question_text: 'Design a URL shortener',
            question_type: 'system',
            answer_brief: 'Discuss DB schema, hashing, cache layers, QPS, availability.',
          },
          {
            question_text: 'Tell me about a time you overcame a technical challenge',
            question_type: 'behavioral',
            answer_brief: 'Use STAR method: Situation, Task, Action, Result.',
          },
        ],
      },
    ],
  },
  {
    company: 'Microsoft',
    role_title: 'Software Engineer',
    difficulty: 'medium',
    prep_tips: 'Practice graph problems and strings. Microsoft loves trees and linked lists. Be ready to optimize.',
    tags: ['dsa', 'tree', 'string'],
    rounds: [
      {
        round_order: 1,
        round_type: 'phone',
        summary: 'One coding problem, 45 minutes',
        questions: [
          {
            question_text: 'Binary tree level order traversal',
            question_type: 'dsa',
            answer_brief: 'Use BFS with queue. Return list of lists. Time: O(n), Space: O(w) where w is max width.',
          },
        ],
      },
      {
        round_order: 2,
        round_type: 'onsite',
        summary: '2 coding rounds + lunch + manager round',
        questions: [
          {
            question_text: 'Serialize and deserialize binary tree',
            question_type: 'dsa',
            answer_brief: 'Use pre-order traversal with null markers. Handle encoding/decoding.',
          },
        ],
      },
    ],
  },
  {
    company: 'Amazon',
    role_title: 'Junior Developer',
    difficulty: 'easy',
    prep_tips: 'Focus on arrays, strings, and basic tree problems. Amazon asks many variant questions on known topics.',
    tags: ['array', 'string', 'internship'],
    rounds: [
      {
        round_order: 1,
        round_type: 'phone',
        summary: '30-minute phone screen',
        questions: [
          {
            question_text: 'Two sum problem',
            question_type: 'dsa',
            answer_brief: 'Use hash map to achieve O(n) time. Store difference or complement.',
          },
        ],
      },
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a sample user
    await User.deleteMany({});
    console.log('Cleared existing users');

    const sampleUser = await User.create({
      email: 'student@college.edu',
      password: 'password123',
      name: 'John Doe',
      college: 'Sample College',
      role: 'student',
    });

    console.log('Created sample user: student@college.edu (password: password123)');

    await Experience.deleteMany({});
    console.log('Cleared existing experiences');

    const createdExps = await Experience.insertMany(
      sampleExperiences.map((exp) => ({
        ...exp,
        user_id: sampleUser._id,
        status: 'published',
        is_anonymous: true,
      }))
    );

    console.log(`✅ Seeded ${createdExps.length} sample experiences`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
