// HubSpot Quotes API
export default async function handler(req, res) {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  
  if (!hubspotApiKey) {
    return res.status(500).json({ 
      error: 'HubSpot API key not configured. Please set HUBSPOT_API_KEY in Vercel environment variables.' 
    });
  }

  const headers = {
    'Authorization': `Bearer ${hubspotApiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      // Fetch quotes
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/quotes?limit=20&properties=hs_title,hs_amount,hs_quote_status,hs_quote_due_date,hs_quote_number', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend
      const quotes = data.results.map(quote => ({
        id: quote.id,
        title: quote.properties.hs_title || 'Untitled Quote',
        amount: quote.properties.hs_amount || '0',
        status: quote.properties.hs_quote_status || 'draft',
        dueDate: quote.properties.hs_quote_due_date || '',
        quoteNumber: quote.properties.hs_quote_number || '',
        createdAt: quote.createdAt
      }));

      return res.status(200).json({ quotes });

    } else if (req.method === 'POST') {
      // Create new quote
      const { title, amount, status, dueDate, associatedContact } = req.body;

      const quoteData = {
        properties: {
          hs_title: title,
          hs_amount: amount,
          hs_quote_status: status || 'draft',
          hs_quote_due_date: dueDate
        }
      };

      // Add associated contact if provided
      if (associatedContact) {
        quoteData.associations = [{
          to: { id: associatedContact },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Quote association
        }];
      }

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/quotes', {
        method: 'POST',
        headers,
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newQuote = await response.json();
      return res.status(201).json({ 
        success: true, 
        quote: newQuote,
        message: 'Quote created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Quotes API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process quotes request',
      details: error.message 
    });
  }
}
