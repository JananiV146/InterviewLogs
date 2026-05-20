import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    headline: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profile_pic: {
      type: String,
      default: '',
    },
    github_url: {
      type: String,
      default: '',
    },
    linkedin_url: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
