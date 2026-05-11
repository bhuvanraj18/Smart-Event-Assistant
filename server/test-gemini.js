import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gemini API...\n');
console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Not found');
console.log('Model:', process.env.GEMINI_MODEL || 'models/gemini-2.5-flash');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'models/gemini-2.5-flash' });

async function test() {
  try {
    console.log('\nSending test message...');
    const result = await model.generateContent('Hello, how are you?');
    const response = await result.response;
    const text = response.text();
    console.log('\n✅ Success! Response:');
    console.log(text.substring(0, 200));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:');
    console.error(error);
  }
}

test();
