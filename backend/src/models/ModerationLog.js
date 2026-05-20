import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    experience_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experience',
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['approve', 'reject', 'flag'],
      required: true,
    },
    reason: String,
  },
  { timestamps: true }
);

export default mongoose.model('ModerationLog', moderationLogSchema);
