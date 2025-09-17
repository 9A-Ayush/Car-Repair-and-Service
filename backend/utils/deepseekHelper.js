import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-b75d4f55ded24df6b6d970e3114accd0';
const DEEPSEEK_API_URL = 'https://api.deepseek.ai/v1/completions';

export const getAIResponse = async (userMessage, context = []) => {
  try {
    // Enhanced system prompt with car service specific knowledge
    const systemPrompt = `
      You are Revvy, an expert car service assistant for Car Cure. 
      
      About Car Cure:
      - We offer oil changes, brake service, tire rotation, full car inspection, and general maintenance
      - Our operating hours are Monday-Friday 8AM-6PM, Saturday 9AM-4PM, closed on Sunday
      - We are located at 123 Auto Lane, Cartown, CT 12345
      - Contact: (555) 123-4567, email: service@carcure.com
      
      Car Knowledge:
      - Provide accurate information about car maintenance, common issues, and service intervals
      - Explain car problems in simple terms and recommend appropriate services
      - Suggest maintenance based on mileage, age, and symptoms described
      
      Booking Process:
      - Guide users through booking a service appointment
      - Ask for service type, date, time, contact information
      - Be helpful and professional at all times
      
      Always maintain a friendly, helpful tone and provide concise, accurate information.
    `;

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...context,
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: 'deepseek-chat',
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Deepseek API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Deepseek API Error:', error.response?.data || error.message);
    return 'I apologize, but I am having trouble processing your request. How else can I assist you?';
  }
};