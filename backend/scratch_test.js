import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      systemInstruction: "You are an expert technical interview coach."
    });
    
    const messages = [
      { role: 'model', content: "Hi! I'm your InterviewLog AI assistant. Ask me anything about interview prep or how to use the platform!" },
      { role: 'user', content: 'Hi' }
    ];

    let historyMessages = messages.slice(0, -1);
    if (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
      historyMessages = historyMessages.slice(1);
    }

    const history = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    console.log("History:", JSON.stringify(history, null, 2));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("ERROR:", error);
    console.error(error.stack);
  }
}

test();
