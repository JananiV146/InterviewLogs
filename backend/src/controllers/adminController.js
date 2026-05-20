import Experience from '../models/Experience.js';
import ModerationLog from '../models/ModerationLog.js';

export const listPendingExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ status: 'pending' }).sort({ created_at: 1 });
    res.json(experiences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByIdAndUpdate(
      id,
      { status: 'published' },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    await ModerationLog.create({
      experience_id: id,
      admin_id: req.user.userId,
      action: 'approve',
    });

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const experience = await Experience.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    await ModerationLog.create({
      experience_id: id,
      admin_id: req.user.userId,
      action: 'reject',
      reason: reason || '',
    });

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
