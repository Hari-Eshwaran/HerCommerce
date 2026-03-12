const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an assistant helping a small home business owner answer customer questions about products, prices, delivery, and services.

You should be friendly, helpful, and concise. Provide accurate information based on the context given. If you don't have specific information, politely ask for clarification or suggest the customer contact the business owner directly.

Focus on:
- Product prices and descriptions
- Delivery times and options
- Order status updates
- Available business services
- General business inquiries`;

/**
 * Send a message to the chatbot and get a response
 * @param {string} userMessage - The user's question or message
 * @param {Array} conversationHistory - Previous messages for context (optional)
 * @param {Object} businessContext - Additional context about products, orders, etc. (optional)
 * @returns {Promise<Object>} - The chatbot response
 */
async function chat(userMessage, conversationHistory = [], businessContext = null) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add business context if provided
    if (businessContext) {
      const contextMessage = `Current business context:\n${JSON.stringify(businessContext, null, 2)}`;
      messages.push({ role: 'system', content: contextMessage });
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'google/gemini-2.0-flash-001',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'HerCommerce Chatbot'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    return {
      success: true,
      data: {
        message: assistantMessage,
        role: 'assistant',
        usage: response.data.usage || null
      }
    };

  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get response from chatbot'
    };
  }
}

/**
 * Generate a response for common customer queries with business data
 * @param {string} queryType - Type of query (price, delivery, status, services)
 * @param {Object} data - Relevant data for the query
 * @returns {Promise<Object>} - The chatbot response
 */
async function generateContextualResponse(queryType, data) {
  const prompts = {
    price: `Customer is asking about product pricing. Here's the product info: ${JSON.stringify(data)}. Provide a friendly response about the price.`,
    delivery: `Customer is asking about delivery. Here's the order/delivery info: ${JSON.stringify(data)}. Explain the delivery details clearly.`,
    status: `Customer is asking about their order status. Here's the order info: ${JSON.stringify(data)}. Provide a clear status update.`,
    services: `Customer is asking about available services. Here's the business services: ${JSON.stringify(data)}. Describe the services helpfully.`
  };

  const userMessage = prompts[queryType] || `Customer query: ${JSON.stringify(data)}`;
  
  return await chat(userMessage);
}

/**
 * Simple question answering without conversation history
 * @param {string} question - The customer's question
 * @returns {Promise<Object>} - The chatbot response
 */
async function askQuestion(question) {
  return await chat(question);
}

module.exports = {
  chat,
  generateContextualResponse,
  askQuestion
};
