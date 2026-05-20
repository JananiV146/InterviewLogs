import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Send a Message (creates a conversation if one doesn't exist)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !text || text.trim() === '') {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    // Try to find an existing conversation containing both participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If it doesn't exist, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create the message
    const message = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      text: text.trim(),
    });

    // Update conversation last_message
    conversation.last_message = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Retrieve all conversations for the authenticated user
export const listConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email')
      .populate({
        path: 'last_message',
        populate: { path: 'sender_id', select: 'name' }
      })
      .sort({ updated_at: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ message: 'Server error listing conversations' });
  }
};

// Retrieve all messages inside a conversation thread
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Check if user is participant of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Retrieve messages
    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ created_at: 1 });

    // Mark messages sent by the other user as read
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        is_read: false,
      },
      { $set: { is_read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(500).json({ message: 'Server error loading messages' });
  }
};
