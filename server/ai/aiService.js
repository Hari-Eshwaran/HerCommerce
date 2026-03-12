const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

/**
 * Helper function to call OpenRouter API
 */
async function callOpenRouter(systemPrompt, userPrompt, maxTokens = 500) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'HerCommerce AI Service'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * AI Service for generating business insights
 * Falls back to rule-based suggestions if OpenRouter API is not configured
 */

// Pricing suggestions
exports.getPricingSuggestion = async (data) => {
  const { productName, cost, targetMargin, category, competitorPrices } = data;
  
  const aiResponse = await callOpenRouter(
    "You are a business pricing expert helping women entrepreneurs with small home businesses. Provide practical, actionable pricing advice.",
    `Suggest optimal pricing for:
    Product: ${productName}
    Cost: ₹${cost}
    Target Margin: ${targetMargin}%
    Category: ${category || 'General'}
    ${competitorPrices ? `Competitor prices: ${competitorPrices}` : ''}
    
    Provide pricing strategy with budget, standard, and premium options.`
  );

  if (aiResponse) {
    return aiResponse;
  }
  
  // Fallback calculation
  const costNum = parseFloat(cost) || 100;
  const marginNum = parseFloat(targetMargin) || 30;
  const basePrice = costNum / (1 - marginNum / 100);
  
  return {
    budget: Math.round(costNum * 1.3),
    standard: Math.round(basePrice),
    premium: Math.round(basePrice * 1.2),
    recommendation: `Based on your cost of ₹${costNum} and target margin of ${marginNum}%, we recommend a selling price of ₹${Math.round(basePrice)}`
  };
};

// Generate product descriptions
exports.generateDescription = async (data) => {
  const { productName, category, keywords } = data;
  
  const aiResponse = await callOpenRouter(
    "You are a marketing copywriter for small home businesses. Write engaging, warm product descriptions that highlight the handmade/homemade quality.",
    `Write product descriptions for:
    Product: ${productName}
    Category: ${category}
    Keywords: ${keywords || 'handmade, quality, love'}
    
    Provide:
    1. English description (2-3 sentences)
    2. Hindi description (2-3 sentences)
    3. WhatsApp promotional message
    4. Instagram caption with hashtags`,
    600
  );

  if (aiResponse) {
    return aiResponse;
  }
  
  // Fallback templates
  return {
    english: `Discover our beautiful ${productName}, crafted with love and attention to detail. ${keywords ? `Features: ${keywords}.` : ''} Perfect for those who appreciate quality handmade products.`,
    hindi: `हमारे खूबसूरत ${productName} की खोज करें, जिसे प्यार और ध्यान से बनाया गया है। गुणवत्ता वाले हस्तनिर्मित उत्पादों की सराहना करने वालों के लिए एकदम सही।`,
    whatsapp: `🌟 *${productName}* 🌟\n✨ Handcrafted with love\n💝 Perfect for gifting\n📦 Home delivery available\n💬 DM to order!`,
    instagram: `✨ Introducing our ${productName}! ✨\n\nHandcrafted with attention to every detail. #handmade #homemade #supportlocal #${category?.toLowerCase().replace(/\s+/g, '') || 'smallbusiness'}`
  };
};

// Marketing ideas
exports.getMarketingIdeas = async (data) => {
  const { businessType, targetAudience, platform, budget } = data;
  
  const aiResponse = await callOpenRouter(
    "You are a marketing consultant for women-owned home businesses in India. Provide practical, low-cost marketing strategies.",
    `Suggest marketing strategies for:
    Business Type: ${businessType}
    Target Audience: ${targetAudience}
    Primary Platform: ${platform}
    Budget: ${budget || 'Limited'}
    
    Provide 5 actionable marketing ideas with implementation steps.`,
    700
  );

  if (aiResponse) {
    return aiResponse;
  }
  
  // Fallback suggestions
  const platformStrategies = {
    whatsapp: [
      'Post 3-4 status updates daily showing your work process',
      'Create broadcast lists for different customer segments',
      'Share customer testimonials (with permission)',
      'Run limited-time flash sales',
      'Create a WhatsApp Business catalog'
    ],
    instagram: [
      'Post behind-the-scenes content and reels',
      'Use location tags and relevant hashtags',
      'Collaborate with local influencers',
      'Run giveaway contests',
      'Share customer stories and reviews'
    ],
    local: [
      'Partner with local shops for display',
      'Attend community events and fairs',
      'Distribute flyers in nearby areas',
      'Offer referral discounts',
      'Join local women entrepreneur groups'
    ]
  };
  
  return {
    strategies: platformStrategies[platform] || platformStrategies.whatsapp,
    contentCalendar: {
      monday: 'New product showcase',
      wednesday: 'Customer testimonial',
      friday: 'Special offer/discount',
      sunday: 'Behind-the-scenes'
    }
  };
};

// Demand forecast
exports.getDemandForecast = async (data) => {
  const { productId, historicalData, seasonality } = data;
  
  // Simple forecasting logic (in production, use ML models)
  const baselineOrders = 30;
  const seasonalMultipliers = {
    'Jan': 0.8, 'Feb': 0.9, 'Mar': 1.2, 'Apr': 1.1,
    'May': 1.3, 'Jun': 0.9, 'Jul': 0.8, 'Aug': 1.0,
    'Sep': 1.1, 'Oct': 1.4, 'Nov': 1.5, 'Dec': 1.2
  };
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  const forecast = [];
  for (let i = 0; i < 3; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const month = months[monthIndex];
    const predicted = Math.round(baselineOrders * seasonalMultipliers[month]);
    forecast.push({
      month,
      predictedOrders: predicted,
      confidence: 0.75 - (i * 0.1)
    });
  }
  
  return {
    forecast,
    recommendations: [
      'Stock up on popular items before festival season',
      'Consider hiring temporary help for peak months',
      'Prepare marketing campaigns in advance'
    ]
  };
};

// Chat/Business assistant
exports.chat = async (message, context = {}) => {
  const aiResponse = await callOpenRouter(
    `You are a helpful business assistant for women running small home businesses in India. 
    Focus areas: tailoring, baking, handicrafts, homemade food, beauty services.
    Provide practical, actionable advice. Be encouraging and supportive.
    Keep responses concise but helpful.`,
    message,
    400
  );

  if (aiResponse) {
    return aiResponse;
  }
  
  // Fallback responses based on keywords
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('price') || lowerMessage.includes('pricing')) {
    return "For pricing, consider: 1) Calculate your total cost (materials + time), 2) Add a profit margin of 30-50%, 3) Research competitor prices, 4) Don't undervalue your work! Your time and skill have worth.";
  }
  
  if (lowerMessage.includes('customer') || lowerMessage.includes('clients')) {
    return "To attract and retain customers: 1) Maintain quality consistently, 2) Respond promptly to inquiries, 3) Offer a loyalty program, 4) Ask for reviews and referrals, 5) Stay active on WhatsApp and social media.";
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('manage')) {
    return "For better order management: 1) Use this app to track all orders, 2) Set clear delivery timelines, 3) Send order confirmations, 4) Keep customers updated on progress, 5) Maintain a simple filing system for past orders.";
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('promote')) {
    return "Marketing tips: 1) Post daily on WhatsApp Status, 2) Share your work process (people love behind-the-scenes), 3) Ask happy customers for testimonials, 4) Partner with complementary businesses, 5) Join local women entrepreneur groups.";
  }
  
  return "I'm here to help with your home business! You can ask me about pricing strategies, customer management, marketing ideas, order tracking tips, or anything else related to growing your business. What would you like to know?";
};
