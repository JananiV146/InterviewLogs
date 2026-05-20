import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question_text: String,
  question_type: String, // dsa, system, behavioral, other
  answer_brief: String,
});

const roundSchema = new mongoose.Schema({
  round_order: Number,
  round_type: String, // phone, onsite, oa, hr, other
  summary: String,
  questions: [questionSchema],
});

const experienceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    is_anonymous: {
      type: Boolean,
      default: false,
    },
    company: {
      type: String,
      required: true,
    },
    role_title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    prep_tips: String,
    content: String,
    media: [String],
    status: {
      type: String,
      enum: ['published', 'pending', 'rejected'],
      default: 'published',
    },
    rounds: [roundSchema],
    tags: [String],
  },
  { timestamps: true }
);

experienceSchema.index({ company: 1, role_title: 1, difficulty: 1 });
experienceSchema.index({ tags: 1 });
experienceSchema.index({ status: 1 });
experienceSchema.index({ createdAt: -1 });

export default mongoose.model('Experience', experienceSchema);
