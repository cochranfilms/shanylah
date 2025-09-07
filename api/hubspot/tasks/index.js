export default async function handler(req, res) {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  if (!hubspotApiKey) {
    return res.status(500).json({ error: 'HUBSPOT_API_KEY not configured' });
  }
  const headers = {
    'Authorization': `Bearer ${hubspotApiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      // HubSpot Tasks are engagements; using CRM v3 tasks endpoint equivalent (Activities API varies)
      // For demo, return empty list to avoid 404s until full implementation
      return res.status(200).json({ tasks: [] });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('HubSpot Tasks API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
}


