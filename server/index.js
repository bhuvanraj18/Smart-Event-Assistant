// ========================================
// EVENT GENIE AI - CHATBOT BACKEND
// Node.js + Express.js + Google Gemini API
// ======================================== 

import { GoogleGenerativeAI } from '@google/generative-ai';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import connectDB from './config/db.js';
import BudgetPlan from './models/BudgetPlan.js';
import Vendor from './models/Vendor.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

console.log('\n========================================');
console.log('🚀 EVENT GENIE AI - BACKEND STARTUP');
console.log('========================================\n');

// Initialize Express app
const app = express();

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON Parser Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.path}`);
  next();
});

// Error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Parse Error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

app.use('/api/auth', authRoutes);

// ========================================
// GEMINI AI INITIALIZATION & DEBUGGING
// ========================================

const DEFAULT_GEMINI_MODEL = 'models/gemini-2.5-flash';

console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || '5000'}`);
console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ LOADED' : '❌ NOT SET'}`);
console.log(`   API_KEY Length: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : '0'} characters`);
console.log(`   GEMINI_MODEL: ${process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);

// Initialize Gemini AI
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in .env file');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Google Generative AI initialized successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
  console.error('   Make sure GEMINI_API_KEY is set in your .env file\n');
}

// EVENT GENIE SYSTEM PROMPT
const EVENT_GENIE_SYSTEM_PROMPT = `You are Event Genie AI, a smart event management assistant. Help users with event planning, decoration ideas, budget suggestions, venue recommendations, catering ideas, guest management, schedules, and vendor suggestions. Reply professionally and briefly. If the question is unrelated to events, politely refuse.`;

// ========================================
// API ENDPOINTS
// ========================================

/**
 * Diagnostic: List Available Models
 * GET /api/models
 */
app.get('/api/models', async (req, res) => {
  console.log('📡 [GET] /api/models - Listing available models');

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured'
      });
    }

    // Use REST API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models || [];

    console.log(`✅ Available models: ${models.length}`);
    models.slice(0, 10).forEach(m => console.log(`   - ${m.displayName} (${m.name})`));

    res.status(200).json({
      count: models.length,
      models: models.map(m => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description
      }))
    });

  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Health Check Endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  console.log('📡 [GET] /api/health - Health check requested');
  res.status(200).json({
    status: 'ok',
    message: 'Event Genie API is running',
    geminiInitialized: !!genAI,
    apiKeyLoaded: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

/**
 * Main Chatbot Endpoint
 * POST /api/chat
 * Request body: { "message": "user message" }
 * Response: { "reply": "AI generated response" }
 */
app.post('/api/chat', async (req, res) => {
  console.log('\n========================================');
  console.log('📬 [POST] /api/chat - New message received');
  console.log('========================================');

  try {
    // Extract message from request body
    const { message } = req.body;

    console.log(`📝 User message: "${message}"`);

    // Validation: Check if message exists
    if (!message || typeof message !== 'string') {
      console.error('❌ Validation Error: Invalid message format');
      return res.status(400).json({
        error: 'Invalid request. Please provide a "message" field.'
      });
    }

    // Validation: Check if Gemini is initialized
    if (!genAI) {
      console.error('❌ Error: Gemini AI not initialized');
      return res.status(500).json({
        error: 'AI service not initialized'
      });
    }

    // Validation: Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Error: GEMINI_API_KEY is not configured');
      return res.status(500).json({
        reply: 'AI service temporarily unavailable. API key not configured.'
      });
    }

    console.log('🤖 Initializing Gemini model: ' + (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL));

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL });

    console.log('💬 Creating chat session with system prompt');

    // Create chat session with system prompt
    const chat = model.startChat({
      systemInstruction: {
        parts: [{ text: EVENT_GENIE_SYSTEM_PROMPT }]
      },
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    console.log('⏳ Sending message to Gemini API...');

    // Send user message and get response
    let result;
    try {
      result = await chat.sendMessage(message);
      console.log('📨 sendMessage() completed');
    } catch (sendErr) {
      console.error('❌ sendMessage() failed:', sendErr.message);
      throw sendErr;
    }

    let response;
    try {
      response = await result.response;
      console.log('📨 result.response completed');
    } catch (respErr) {
      console.error('❌ result.response failed:', respErr.message);
      throw respErr;
    }

    let reply;
    try {
      reply = response.text();
      console.log(`✅ response.text() completed (${reply.length} chars)`);
    } catch (textErr) {
      console.error('❌ response.text() failed:', textErr.message);
      throw textErr;
    }

    console.log(`✅ Gemini Response received (${reply.length} characters):`);
    console.log(`   "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);

    // Return success response
    res.status(200).json({
      reply: reply,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Response sent to frontend\n');

  } catch (error) {
    // Error Handling with detailed logging
    console.error('\n❌ ERROR in /api/chat:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Full Error: ${JSON.stringify(error, null, 2)}`);
    console.error(`   Stack: ${error.stack}\n`);

    // Handle specific error types
    if (error.message.includes('API key') || error.message.includes('401')) {
      console.error('🔑 Issue: Invalid or incorrect API key');
      return res.status(500).json({
        reply: 'AI service temporarily unavailable. Please check API key configuration.'
      });
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      console.error('⏱️  Issue: Rate limit exceeded');
      return res.status(429).json({
        reply: 'Rate limit exceeded. Please try again in a few moments.'
      });
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
      console.error('🌐 Issue: Network connection failed');
      return res.status(500).json({
        reply: 'Network connection failed. Please check your internet connection.'
      });
    }

    // Generic error response
    return res.status(500).json({
      reply: 'AI service temporarily unavailable. Please try again later.'
    });
  }
});

/**
 * Vendor Directory Endpoints
 * GET /api/vendors
 * POST /api/vendors
 */
app.get('/api/vendors', async (req, res) => {
  console.log('📡 [GET] /api/vendors - Fetching vendors');
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json({ vendors });
  } catch (error) {
    console.error('❌ Vendor API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.post('/api/vendors', async (req, res) => {
  console.log('📡 [POST] /api/vendors - Creating new vendor');
  try {
    const newVendor = await Vendor.create(req.body);
    res.status(201).json({ vendor: newVendor });
  } catch (error) {
    console.error('❌ Vendor API Error:', error.message);
    res.status(400).json({ error: 'Failed to create vendor' });
  }
});

/**
 * Budget Planner Endpoint
 * POST /api/budget
 * Request body: { "budget": 5000, "eventType": "wedding", "guestCount": 100 }
 */
app.post('/api/budget', async (req, res) => {
  console.log('\n📊 [POST] /api/budget - Budget request received');

  try {
    const { budget, eventType, guestCount } = req.body;

    console.log(`   Event Type: ${eventType}, Budget: $${budget}, Guests: ${guestCount}`);

    // Validation
    if (!budget || !eventType || !guestCount) {
      console.error('❌ Validation Error: Missing required fields');
      return res.status(400).json({
        error: 'Please provide budget, eventType, and guestCount'
      });
    }

    if (!genAI) {
      console.error('❌ Error: Gemini AI not initialized');
      return res.status(500).json({
        error: 'AI service not initialized'
      });
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL });

    const budgetPrompt = `Act as an expert event planner. The user wants to plan a ${eventType} for ${guestCount} guests with a budget of $${budget}. 
    Provide a concise, categorized budget breakdown and 3 creative ideas to save money. 
    Format your response as a JSON array where each object has: "category", "allocatedAmount", "percentage", and "tips".`;

    console.log('⏳ Generating budget breakdown from Gemini...');

    const result = await model.generateContent(budgetPrompt);
    const response = await result.response;
    const text = response.text();

    console.log(`✅ Budget response received (${text.length} characters)`);

    // Parse JSON response
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const breakdown = JSON.parse(jsonStr);

    // Save to MongoDB
    let savedPlan = null;
    try {
      savedPlan = await BudgetPlan.create({
        eventType,
        guestCount,
        totalBudget: budget,
        breakdown
      });
      console.log('✅ Budget plan saved to MongoDB');
    } catch (dbErr) {
      console.error('⚠️ Could not save to DB (perhaps MongoDB is not connected):', dbErr.message);
    }

    res.status(200).json({
      breakdown: breakdown,
      savedPlanId: savedPlan ? savedPlan._id : null,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Budget breakdown sent to frontend\n');

  } catch (error) {
    console.error('❌ Budget API Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate budget plan'
    });
  }
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  console.log(`⚠️  [${req.method}] ${req.path} - Route not found`);
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ========================================
// SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('⚠️  MONGO_URI is not configured. Auth routes will not be functional until MongoDB is connected.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`✅ Server listening on port ${PORT}`);
    console.log('========================================');
    console.log(`\n📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
    console.log(`📊 Budget endpoint: POST http://localhost:${PORT}/api/budget`);
    console.log(`🔐 Auth endpoint: POST http://localhost:${PORT}/api/auth/login\n`);
    console.log('Ready to accept requests...\n');
  });
};

startServer();

export default app;
