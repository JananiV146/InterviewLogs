import Experience from '../models/Experience.js';
import User from '../models/User.js';

export const createExperience = async (req, res) => {
  try {
    const { company, role_title, difficulty, prep_tips, content, media, tags, rounds } = req.body;

    if (!company || !role_title || !difficulty) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const experience = await Experience.create({
      user_id: req.user.userId,
      company,
      role_title,
      difficulty,
      prep_tips,
      content,
      media: media || [],
      tags: tags || [],
      rounds: rounds || [],
      status: 'published',
    });

    res.status(201).json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listExperiences = async (req, res) => {
  try {
    const { company, role_title, difficulty, tag, q, search, searchType, page = 1, limit = 10 } = req.query;

    const filter = { status: 'published' };
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (role_title) filter.role_title = { $regex: role_title, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };
    if (q) {
      filter.$or = [
        { company: { $regex: q, $options: 'i' } },
        { role_title: { $regex: q, $options: 'i' } },
        { prep_tips: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }

    if (search && search.trim() !== '') {
      if (searchType === 'author') {
        const users = await User.find({ name: { $regex: search.trim(), $options: 'i' } }).select('_id');
        const userIds = users.map((u) => u._id);
        filter.user_id = { $in: userIds };
      } else {
        filter.company = { $regex: search.trim(), $options: 'i' };
      }
    }

    const skip = (page - 1) * limit;
    const experiences = await Experience.find(filter)
      .populate('user_id', 'name email profile_pic headline college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Experience.countDocuments(filter);

    res.json({ data: experiences, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExperienceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findOne({
      _id: id,
      status: 'published',
    }).populate('user_id', 'name email');

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listTags = async (req, res) => {
  try {
    const tags = await Experience.distinct('tags', { status: 'published' });
    res.json(tags.sort());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listMyExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ user_id: req.user.userId })
      .populate('user_id', 'name email profile_pic headline college')
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role_title, difficulty, prep_tips, content, media, tags, rounds } = req.body;

    const experience = await Experience.findOne({ _id: id, user_id: req.user.userId });
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    experience.company = company || experience.company;
    experience.role_title = role_title || experience.role_title;
    experience.difficulty = difficulty || experience.difficulty;
    experience.prep_tips = prep_tips !== undefined ? prep_tips : experience.prep_tips;
    experience.content = content !== undefined ? content : experience.content;
    experience.media = media !== undefined ? media : experience.media;
    experience.tags = tags || experience.tags;
    experience.rounds = rounds || experience.rounds;
    
    experience.status = 'published';

    await experience.save();

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findOneAndDelete({ _id: id, user_id: req.user.userId });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
