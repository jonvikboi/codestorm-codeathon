const axios = require('axios');

const generateCompletion = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }, // Forces strictly valid JSON
          messages: [
            {
              role: 'system',
              content: 'You are a highly analytical AI assistant. You must ALWAYS respond with strictly valid JSON format. Do not include markdown formatting, code blocks, or any extra text before or after the JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 seconds timeout
        }
      );

      console.log(`\n[GROQ REQUEST] Generating completion...`);
      console.log(`[GROQ PROMPT]\n${prompt}`);

      const resultText = response.data.choices[0].message.content;
      console.log(`[GROQ RESPONSE] Status: ${response.status}`);
      console.log(`[GROQ OUTPUT]\n${resultText}`);
      
      // Because we used json_object, it should be pure JSON, but we clean it just in case
      const cleanedText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // Find the first { or [ and last } or ] to extract JSON in case of extra text
      const firstBrace = cleanedText.search(/[\{\[]/);
      const lastBrace = cleanedText.search(/[\}\]][^}\]]*$/);
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonSubstring = cleanedText.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSubstring);
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn(`Groq API Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('Groq API Error Details:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response after multiple attempts');
      }
      
      // Exponential backoff before retrying (1s, 2s...)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

module.exports = {
  generateCompletion,
};
