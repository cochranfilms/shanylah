// Vercel API route for ChatGPT integration
// File: /api/chatgpt.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Vercel environment variables.' 
      });
    }

    // Create the system prompt for Cochran Films context
    const systemPrompt = `You are an AI assistant helping Shanylah Sainvil, a new assistant at Cochran Films LLC. 

Cochran Films is a full-stack media powerhouse specializing in:
- High-end video production, branding, web development
- Content strategy and on-site photo printing
- AI-driven systems through Marketing Mousetrap Agency
- Course Creator Academy and CCA Critiques

Shanylah's role includes:
- Email sorting and response
- Scheduling via Calendly
- Managing client info and pipeline in HubSpot
- Internal file organization (Google Drive)
- Weekly check-ins with Cody

Key tools: HubSpot, Calendly, Gmail, LinkedIn, Google Drive, Trello, Wave
Brand values: Trust, Loyalty, Innovation, Family, Professionalism

Provide helpful, professional responses about procedures, tools, and best practices. Be encouraging and supportive.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated.';

    return res.status(200).json({ 
      response: aiResponse,
      usage: data.usage 
    });

  } catch (error) {
    console.error('ChatGPT API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
