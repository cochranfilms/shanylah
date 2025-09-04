// HubSpot API status check
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    
    if (!hubspotApiKey) {
      return res.status(500).json({ ok: false, error: 'HUBSPOT_API_KEY not configured' });
    }

    // Test HubSpot connection by fetching account info
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return res.status(200).json({ ok: true, status: 'connected' });
    } else {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

  } catch (error) {
    console.error('HubSpot API Error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to connect to HubSpot', details: error.message });
  }
}
