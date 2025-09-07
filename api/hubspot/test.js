// Simple HubSpot API test endpoint
export default async function handler(req, res) {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  
  if (!hubspotApiKey) {
    return res.status(500).json({ 
      error: 'HubSpot API key not configured',
      message: 'Please set HUBSPOT_API_KEY in Vercel environment variables',
      hasKey: false
    });
  }

  const headers = {
    'Authorization': `Bearer ${hubspotApiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // Test with a simple API call
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers,
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return res.status(500).json({
        error: 'HubSpot API test failed',
        status: response.status,
        statusText: response.statusText,
        response: responseData,
        hasKey: true,
        keyPrefix: hubspotApiKey.substring(0, 10) + '...'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'HubSpot API connection successful',
      hasKey: true,
      keyPrefix: hubspotApiKey.substring(0, 10) + '...',
      response: responseData
    });

  } catch (error) {
    console.error('HubSpot API Test Error:', error);
    return res.status(500).json({
      error: 'HubSpot API test failed',
      details: error.message,
      hasKey: true,
      keyPrefix: hubspotApiKey.substring(0, 10) + '...'
    });
  }
}
