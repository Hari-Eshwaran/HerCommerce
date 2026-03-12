const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

const VISION_PROMPT = `Analyze this product image and generate a catalog entry for a small home business.

Provide the following details in JSON format:
- name: A clear, marketable product name
- description: A compelling 2-3 sentence description highlighting key features and appeal
- price: Suggested selling price in INR (just the number, no currency symbol)
- category: One of these categories: Tailoring, Baking, Handicrafts, Food, Beauty, Clothing, Accessories, Home Decor, Other

Respond ONLY with valid JSON in this exact format:
{
  "name": "",
  "description": "",
  "price": "",
  "category": ""
}`;

/**
 * Analyze a product image and generate catalog entry
 * @param {string} imageData - Base64 encoded image data or image URL
 * @param {string} imageType - MIME type (e.g., 'image/jpeg', 'image/png') - required for base64
 * @returns {Promise<Object>} - Product catalog entry
 */
async function analyzeProductImage(imageData, imageType = 'image/jpeg') {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'OPENROUTER_API_KEY is not configured'
    };
  }

  try {
    // Determine if imageData is URL or base64
    const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');
    
    const imageContent = isUrl
      ? { type: 'image_url', image_url: { url: imageData } }
      : { type: 'image_url', image_url: { url: `data:${imageType};base64,${imageData}` } };

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: VISION_PROMPT },
              imageContent
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'HerCommerce Product Vision'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Failed to parse product data from response'
      };
    }

    const productData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: {
        name: productData.name || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        category: productData.category || 'Other'
      }
    };

  } catch (error) {
    console.error('Product Vision error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to analyze image'
    };
  }
}

/**
 * Analyze multiple product images
 * @param {Array} images - Array of { data, type } objects
 * @returns {Promise<Array>} - Array of product catalog entries
 */
async function analyzeMultipleImages(images) {
  const results = [];
  
  for (const image of images) {
    const result = await analyzeProductImage(image.data, image.type);
    results.push(result);
  }
  
  return results;
}

module.exports = {
  analyzeProductImage,
  analyzeMultipleImages
};
