const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

const ORDER_EXTRACTION_PROMPT = `You are an order extraction assistant for a small home business in India.

Extract order information from the following text (which may be in Tamil, Hindi, or English).

Extract these details:
- customer: Customer name (transliterate Tamil/Hindi names to English)
- product: Product or service being ordered (translate to English)
- deliveryDate: Delivery date/day mentioned (translate to English day name or date)
- quantity: Quantity if mentioned (default to 1 if not specified)

Common Tamil words:
- ஆர்டர் = order
- ப்ளவுஸ் = blouse
- சேலை = saree
- கேக் = cake
- வெள்ளிக்கிழமை = Friday
- சனிக்கிழமை = Saturday
- ஞாயிற்றுக்கிழமை = Sunday
- திங்கள் = Monday
- செவ்வாய் = Tuesday
- புதன் = Wednesday
- வியாழன் = Thursday
- நாளை = tomorrow
- இன்று = today
- அடுத்த வாரம் = next week

Respond ONLY with valid JSON in this exact format:
{
  "customer": "",
  "product": "",
  "deliveryDate": "",
  "quantity": 1
}

If any field cannot be determined, use null for that field.`;

/**
 * Extract order details from voice-transcribed text
 * @param {string} text - Transcribed speech text (Tamil/Hindi/English)
 * @returns {Promise<Object>} - Extracted order details
 */
async function extractOrderFromText(text) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'OPENROUTER_API_KEY is not configured'
    };
  }

  if (!text || text.trim() === '') {
    return {
      success: false,
      error: 'No text provided for extraction'
    };
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: ORDER_EXTRACTION_PROMPT },
          { role: 'user', content: `Extract order from: "${text}"` }
        ],
        temperature: 0.2,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'HerCommerce Voice Order'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Failed to parse order data from response'
      };
    }

    const orderData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: {
        customer: orderData.customer || null,
        product: orderData.product || null,
        deliveryDate: orderData.deliveryDate || null,
        quantity: orderData.quantity || 1
      },
      originalText: text
    };

  } catch (error) {
    console.error('Voice Order extraction error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to extract order details'
    };
  }
}

module.exports = {
  extractOrderFromText
};
