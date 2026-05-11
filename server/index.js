// ========================================
// EVENT GENIE AI - CHATBOT BACKEND
// Node.js + Express.js + Groq AI API
// ========================================

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
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app preview/production URL
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
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
// GROQ AI CONFIGURATION
// ========================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || '5000'}`);
console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ LOADED' : '❌ NOT SET'}`);
console.log(`   API_KEY Length: ${process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : '0'} characters`);
console.log(`   GROQ_MODEL: ${DEFAULT_MODEL}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is not set in .env file');
} else {
  console.log('✅ Groq AI configured successfully\n');
}

// EVENT GENIE SYSTEM PROMPT
const EVENT_GENIE_SYSTEM_PROMPT = `You are Event Genie AI, a smart event management assistant. Help users with event planning, decoration ideas, budget suggestions, venue recommendations, catering ideas, guest management, schedules, and vendor suggestions. Reply professionally and briefly. If the question is unrelated to events, politely refuse.`;

// ========================================
// Groq API Helper
// ========================================

async function callGroq(messages, { maxTokens = 500, temperature = 0.7 } = {}) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

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
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data || [];

    console.log(`✅ Available models: ${models.length}`);
    models.slice(0, 10).forEach(m => console.log(`   - ${m.id}`));

    res.status(200).json({
      count: models.length,
      models: models.map(m => ({
        name: m.id,
        displayName: m.id,
        ownedBy: m.owned_by,
      })),
    });

  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    res.status(500).json({ error: error.message });
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
    aiProvider: 'Groq',
    aiModel: DEFAULT_MODEL,
    apiKeyLoaded: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
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
    const { message } = req.body;
    console.log(`📝 User message: "${message}"`);

    // Validation
    if (!message || typeof message !== 'string') {
      console.error('❌ Validation Error: Invalid message format');
      return res.status(400).json({ error: 'Invalid request. Please provide a "message" field.' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ Error: GROQ_API_KEY is not configured');
      return res.status(500).json({ reply: 'AI service temporarily unavailable. API key not configured.' });
    }

    console.log(`🤖 Using Groq model: ${DEFAULT_MODEL}`);

    // Build messages array with system prompt
    const messages = [
      { role: 'system', content: EVENT_GENIE_SYSTEM_PROMPT },
      { role: 'user', content: message },
    ];

    // Retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let reply = '';
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`⏳ Attempt ${attempt}/${MAX_RETRIES}: Sending to Groq API...`);
        reply = await callGroq(messages);
        console.log(`✅ Response received (${reply.length} chars)`);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        const isRateLimit = err.message?.includes('429') || err.message?.includes('rate');
        if (isRateLimit && attempt < MAX_RETRIES) {
          const waitMs = Math.pow(2, attempt) * 1000;
          console.warn(`⏱️  Rate limited (attempt ${attempt}). Retrying in ${waitMs / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        } else {
          console.error(`❌ Failed (attempt ${attempt}):`, err.message);
          throw err;
        }
      }
    }

    console.log(`✅ Groq Response: "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);

    res.status(200).json({
      reply,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Response sent to frontend\n');

  } catch (error) {
    console.error('\n❌ ERROR in /api/chat:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);

    if (error.message.includes('401') || error.message.includes('API key')) {
      return res.status(500).json({ reply: 'AI service temporarily unavailable. Please check API key.' });
    }
    if (error.message.includes('429') || error.message.includes('rate')) {
      return res.status(429).json({ reply: 'Rate limit exceeded. Please try again in a few moments.' });
    }

    return res.status(500).json({ reply: 'AI service temporarily unavailable. Please try again later.' });
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
      return res.status(400).json({ error: 'Please provide budget, eventType, and guestCount' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ Error: GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not initialized' });
    }

    const budgetPrompt = `Act as an expert event planner. The user wants to plan a ${eventType} for ${guestCount} guests with a budget of $${budget}. 
    Provide a concise, categorized budget breakdown and 3 creative ideas to save money. 
    Format your response as a JSON array where each object has: "category", "allocatedAmount", "percentage", and "tips".
    Return ONLY the JSON array, no markdown formatting.`;

    console.log('⏳ Generating budget breakdown from Groq...');

    const messages = [
      { role: 'system', content: 'You are an expert event planner. Respond only with valid JSON arrays.' },
      { role: 'user', content: budgetPrompt },
    ];

    const text = await callGroq(messages, { maxTokens: 1000, temperature: 0.5 });

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
        breakdown,
      });
      console.log('✅ Budget plan saved to MongoDB');
    } catch (dbErr) {
      console.error('⚠️ Could not save to DB:', dbErr.message);
    }

    res.status(200).json({
      breakdown,
      savedPlanId: savedPlan ? savedPlan._id : null,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Budget breakdown sent to frontend\n');

  } catch (error) {
    console.error('❌ Budget API Error:', error.message);
    res.status(500).json({ error: 'Failed to generate budget plan' });
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
    method: req.method,
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
