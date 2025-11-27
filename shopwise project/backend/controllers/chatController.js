import ChatSession from '../models/ChatSession.js';
import { generateChatResponse } from '../config/huggingface.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create new chat session
// @route   POST /api/chat/session
// @access  Public
export const createChatSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.user?._id || null;

    const session = await ChatSession.create({
      sessionId,
      userId,
      messages: [],
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    console.log('✅ Chat session created:', sessionId);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: 'Chat session created',
      },
    });
  } catch (error) {
    console.error('❌ Create session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send message and get AI response
// @route   POST /api/chat/message
// @access  Public
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    console.log('\n📨 ========== NEW CHAT MESSAGE ==========');
    console.log('Session ID:', sessionId);
    console.log('Message:', message);

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required',
      });
    }

    // Find or create session
    let session = await ChatSession.findOne({ sessionId });
    
    if (!session) {
      console.log('Creating new session for:', sessionId);
      const userId = req.user?._id || null;
      session = await ChatSession.create({
        sessionId,
        userId,
        messages: [],
      });
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build conversation history for Gemini (last 10 messages)
    const conversationHistory = session.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Check if asking about products
    const isProductQuery = /recommend|suggest|find|looking for|need|want|buy|show me|product/i.test(message);
    
    let aiResponse;
    
    if (isProductQuery) {
      console.log('🛍️ Product query detected');
      
      try {
        const products = await Product.find().limit(20);
        console.log('📦 Found', products.length, 'products in database');
        
        if (products.length > 0) {
          const recResponse = await generateProductRecommendations(message, products);
          aiResponse = recResponse.recommendations || recResponse.message;
        } else {
          // No products in database
          aiResponse = "I'd love to help you find products! However, our product catalog is currently being updated. Please browse our Products page or contact support@shopwise.com for assistance.";
        }
      } catch (productError) {
        console.error('❌ Product query error:', productError);
        aiResponse = "I'm having trouble accessing our product catalog right now. Please check our Products page or try again later.";
      }
    } else {
      console.log('💬 General chat query');
      const response = await generateChatResponse(message, conversationHistory);
      
      console.log('🔍 Gemini Response Details:');
      console.log('Success:', response.success);
      console.log('Has message:', !!response.message);
      console.log('Error:', response.error);
      
      aiResponse = response.message;
    }

    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await session.save();

    console.log('✅ Response sent successfully');
    console.log('========================================\n');

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date(),
      },
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message,
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Public
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: session.messages,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Close chat session
// @route   PUT /api/chat/close/:sessionId
// @access  Public
export const closeChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Chat session closed',
    });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's chat sessions (for logged in users)
// @route   GET /api/chat/my-sessions
// @access  Private
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};