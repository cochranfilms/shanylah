// HubSpot Contacts API
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
      // Fetch contacts
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=20&properties=firstname,lastname,email,company,phone,hs_lead_status', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend
      const contacts = data.results.map(contact => ({
        id: contact.id,
        firstName: contact.properties.firstname || '',
        lastName: contact.properties.lastname || '',
        email: contact.properties.email || '',
        company: contact.properties.company || '',
        phone: contact.properties.phone || '',
        leadStatus: contact.properties.hs_lead_status || 'new'
      }));

      return res.status(200).json({ contacts });

    } else if (req.method === 'POST') {
      // Create new contact
      const { firstName, lastName, email, phone, company, leadSource, notes } = req.body;

      const contactData = {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          company: company,
          hs_analytics_source: leadSource || 'website',
          hs_lead_status: 'NEW'
        }
      };

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newContact = await response.json();
      return res.status(201).json({ 
        success: true, 
        contact: newContact,
        message: 'Contact created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Contacts API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process contacts request',
      details: error.message 
    });
  }
}
