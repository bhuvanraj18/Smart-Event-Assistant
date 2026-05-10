import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// Routes
// 1. Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Event Assistant API is running' });
});

// 2. Chatbot Endpoint
app.post('/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    
    // We can use generic text model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Simplistic text request for minimal MVP
    const chat = model.startChat({
        history: history || [],
        generationConfig: {
            maxOutputTokens: 500,
        },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// 3. Budget Planner Endpoint
app.post('/budget', async (req, res) => {
  try {
    const { budget, eventType, guestCount } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Act as an expert event planner. The user wants to plan a ${eventType} for ${guestCount} guests with a budget of $${budget}. 
    Provide a concise, categorized budget breakdown and 3 creative ideas to save money. 
    Format your response as a JSON array where each object has: "category", "allocatedAmount", "percentage", and "tips".`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.json({ breakdown: JSON.parse(jsonStr) });
  } catch (error) {
    console.error("Budget API Error:", error);
    res.status(500).json({ error: "Failed to generate budget plan" });
  }
});

// MongoDB connection (optional, only if MONGODB_URI is set)
if(process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.log('Skipping MongoDB connection: MONGODB_URI not provided.');
}

export default app;
