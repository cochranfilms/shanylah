// HubSpot Leads API
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
      // Fetch leads (using contacts with lead status)
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=20&properties=firstname,lastname,email,company,phone,hs_lead_status,hs_lead_score,hs_lead_source', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend - filter for leads
      const leads = data.results
        .filter(contact => contact.properties.hs_lead_status === 'new' || 
                          contact.properties.hs_lead_status === 'qualified' || 
                          contact.properties.hs_lead_status === 'unqualified')
        .map(contact => ({
          id: contact.id,
          firstName: contact.properties.firstname || '',
          lastName: contact.properties.lastname || '',
          email: contact.properties.email || '',
          company: contact.properties.company || '',
          phone: contact.properties.phone || '',
          status: contact.properties.hs_lead_status || 'new',
          score: contact.properties.hs_lead_score || 0,
          source: contact.properties.hs_lead_source || '',
          createdAt: contact.createdAt
        }));

      return res.status(200).json({ leads });

    } else if (req.method === 'POST') {
      // Create new lead
      const { firstName, lastName, email, company, phone, source, score } = req.body;

      const leadData = {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: email,
          company: company,
          phone: phone,
          hs_lead_source: source,
          hs_lead_score: score || 0,
          hs_lead_status: 'new'
        }
      };

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newLead = await response.json();
      return res.status(201).json({ 
        success: true, 
        lead: newLead,
        message: 'Lead created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Leads API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process leads request',
      details: error.message 
    });
  }
}
