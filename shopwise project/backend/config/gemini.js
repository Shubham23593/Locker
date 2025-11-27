import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env');
  console.error('📁 Current directory:', process.cwd());
  console.error('📄 Looking for .env file in:', process.cwd() + '/.env');
  throw new Error('Gemini API key is required');
}

console.log('✅ Gemini API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',  // ✅ Updated model name
});

// System prompt
const SYSTEM_PROMPT = `You are ShopWise AI Assistant - a helpful customer support chatbot for ShopWise e-commerce platform.

CAPABILITIES:
- Help customers find products
- Answer questions about orders, shipping, returns
- Provide shopping advice
- Assist with account issues

SHOPWISE INFO:
- Free shipping over ₹500
- 7-day return policy
- Payment: COD, Card, UPI, Razorpay
- Categories: Electronics, Fashion, Home & Kitchen, Beauty, Sports, Books, Toys, Automotive
- Support: support@shopwise.com (9 AM - 6 PM IST)

GUIDELINES:
- Be friendly and concise (2-3 sentences)
- Use emojis occasionally 😊
- If unsure, direct to support
- Never invent order/product details

Respond naturally and helpfully.`;

export const generateChatResponse = async (userMessage, conversationHistory = []) => {
  try {
    console.log('\n🤖 ========== GEMINI API CALL ==========');
    console.log('📝 User Message:', userMessage);
    console.log('📜 History Length:', conversationHistory.length);

    // Build conversation with system prompt
    let fullPrompt = `${SYSTEM_PROMPT}\n\n`;
    
    // Add conversation history (last 10 messages only)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        fullPrompt += `Customer: ${msg.parts[0].text}\n`;
      } else if (msg.role === 'model') {
        fullPrompt += `Assistant: ${msg.parts[0].text}\n`;
      }
    });
    
    // Add current message
    fullPrompt += `\nCustomer: ${userMessage}\nAssistant:`;

    console.log('📤 Sending to Gemini...');

    // Make API call
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Response:', text.substring(0, 100) + '...');
    console.log('========================================\n');

    return {
      success: true,
      message: text.trim(),
      timestamp: new Date(),
    };

  } catch (error) {
    console.error('\n❌ ========== GEMINI ERROR ==========');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Details:', error);
    console.error('=====================================\n');

    // Specific error handling
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return {
        success: false,
        message: "Sorry, I'm having authentication issues. Please contact support@shopwise.com",
        error: 'Invalid API Key',
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return {
        success: false,
        message: "I'm experiencing high traffic right now. Please try again in a moment.",
        error: 'Rate limit exceeded',
      };
    }

    if (error.message?.includes('SAFETY')) {
      return {
        success: false,
        message: "I apologize, but I need to rephrase my response. Can you ask your question differently?",
        error: 'Content filtered by safety settings',
      };
    }

    // Generic fallback
    return {
      success: false,
      message: "I'm having trouble connecting right now. Please try again or contact support@shopwise.com",
      error: error.message,
    };
  }
};

// Product recommendations
export const generateProductRecommendations = async (query, products) => {
  try {
    console.log('🛍️ Generating product recommendations for:', query);

    const productList = products.slice(0, 10).map(p => 
      `- ${p.name} (${p.category}) - ₹${p.price} - ${p.brand}`
    ).join('\n');

    const prompt = `You are a ShopWise product recommendation expert.

Customer query: "${query}"

Available products:
${productList}

Recommend 3-5 products that best match the query. For each recommendation:
1. Product name
2. Brief reason (one sentence)
3. Price

Keep it concise and helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Recommendations generated');

    return {
      success: true,
      recommendations: text.trim(),
    };

  } catch (error) {
    console.error('❌ Product recommendation error:', error);
    return {
      success: false,
      message: 'Unable to generate recommendations. Browse our products page!',
    };
  }
};

export default { generateChatResponse, generateProductRecommendations };