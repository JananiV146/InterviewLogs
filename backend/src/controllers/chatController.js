import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the API only if the key exists to prevent crashing if it's not set yet
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const handleChat = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        message: 'AI assistant is not configured on the server. Please add GEMINI_API_KEY.' 
      });
    }

    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages format' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are an expert technical interview coach and a guide for the InterviewLog platform. Your goal is to help college students prepare for technical and behavioral interviews. Provide concise, actionable, and encouraging advice. If asked about the platform, explain that InterviewLog is an anonymous repository of real interview experiences."
    });

    // Format history for Gemini API, ensuring it starts with a 'user' message
    let historyMessages = messages.slice(0, -1);
    
    // Gemini API requires history to start with a user message. 
    // If the first message in our state is the initial model greeting, we remove it.
    if (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
      historyMessages = historyMessages.slice(1);
    }

    const history = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error communicating with AI assistant' });
  }
};
