import mongoose from 'mongoose';

const authTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp_hash: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

authTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AuthToken', authTokenSchema);
