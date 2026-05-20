import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validateCollegeEmail } from '../utils/auth.js';

export const signup = async (req, res) => {
  try {
    const { email, password, name, college } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password,
      name,
      college: college || null,
    });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      access_token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        college: user.college,
        headline: user.headline,
        bio: user.bio,
        profile_pic: user.profile_pic,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      access_token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        college: user.college,
        headline: user.headline,
        bio: user.bio,
        profile_pic: user.profile_pic,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('access_token');
  res.json({ message: 'Logged out' });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, college, headline, bio, profile_pic, github_url, linkedin_url } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      user.email = email.toLowerCase();
    }

    user.name = name || user.name;
    user.college = college !== undefined ? college : user.college;
    user.headline = headline !== undefined ? headline : user.headline;
    user.bio = bio !== undefined ? bio : user.bio;
    user.profile_pic = profile_pic !== undefined ? profile_pic : user.profile_pic;
    user.github_url = github_url !== undefined ? github_url : user.github_url;
    user.linkedin_url = linkedin_url !== undefined ? linkedin_url : user.linkedin_url;

    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Profile updated successfully',
      access_token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        college: user.college,
        headline: user.headline,
        bio: user.bio,
        profile_pic: user.profile_pic,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
