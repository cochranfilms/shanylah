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

    // Fetch portal/account info to expose portalId for deep links
    const acctRes = await fetch('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!acctRes.ok) throw new Error(`HubSpot account API error: ${acctRes.status}`);
    const acct = await acctRes.json();
    const portalId = acct?.portalId || acct?.portals?.[0]?.portalId || null;

    // Quick connectivity check (optional)
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return res.status(200).json({ ok: true, status: 'connected', portalId });
    } else {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

  } catch (error) {
    console.error('HubSpot API Error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to connect to HubSpot', details: error.message });
  }
}
