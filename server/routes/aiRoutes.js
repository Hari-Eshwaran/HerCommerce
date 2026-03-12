const express = require('express');
const router = express.Router();
const aiService = require('../ai/aiService');
const chatbotService = require('../ai/chatbotService');
const productVisionService = require('../ai/productVisionService');
const voiceOrderService = require('../ai/voiceOrderService');

// POST pricing suggestion
router.post('/pricing', async (req, res) => {
  try {
    const suggestion = await aiService.getPricingSuggestion(req.body);
    res.json({ success: true, suggestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST generate description
router.post('/description', async (req, res) => {
  try {
    const description = await aiService.generateDescription(req.body);
    res.json({ success: true, description });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST marketing ideas
router.post('/marketing', async (req, res) => {
  try {
    const ideas = await aiService.getMarketingIdeas(req.body);
    res.json({ success: true, ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST demand forecast
router.post('/demand', async (req, res) => {
  try {
    const forecast = await aiService.getDemandForecast(req.body);
    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const reply = await aiService.chat(message);
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST chatbot - Gemini-powered customer support chatbot
router.post('/chatbot', async (req, res) => {
  try {
    const { message, conversationHistory, businessContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    const result = await chatbotService.chat(message, conversationHistory, businessContext);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST chatbot contextual response
router.post('/chatbot/contextual', async (req, res) => {
  try {
    const { queryType, data } = req.body;
    
    if (!queryType || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'queryType and data are required' 
      });
    }
    
    const result = await chatbotService.generateContextualResponse(queryType, data);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST analyze product image - convert image to catalog entry
router.post('/product-vision', async (req, res) => {
  try {
    const { image, imageType } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image data is required (base64 or URL)' 
      });
    }
    
    const result = await productVisionService.analyzeProductImage(image, imageType);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST voice order - extract order details from Tamil/Hindi/English speech text
router.post('/voice-order', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transcribed text is required' 
      });
    }
    
    const result = await voiceOrderService.extractOrderFromText(text);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
