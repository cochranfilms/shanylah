// HubSpot Companies API
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
      // Fetch companies
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=20&properties=name,domain,industry,type,phone,address,city,state,zip', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend
      const companies = data.results.map(company => ({
        id: company.id,
        name: company.properties.name || 'Unnamed Company',
        domain: company.properties.domain || '',
        industry: company.properties.industry || '',
        type: company.properties.type || 'Company',
        phone: company.properties.phone || '',
        address: company.properties.address || '',
        city: company.properties.city || '',
        state: company.properties.state || '',
        zip: company.properties.zip || '',
        createdAt: company.createdAt
      }));

      return res.status(200).json({ companies });

    } else if (req.method === 'POST') {
      // Create new company
      const { name, domain, industry, type, phone, address, city, state, zip } = req.body;

      const companyData = {
        properties: {
          name: name,
          domain: domain,
          industry: industry,
          type: type || 'Company',
          phone: phone,
          address: address,
          city: city,
          state: state,
          zip: zip
        }
      };

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
        method: 'POST',
        headers,
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newCompany = await response.json();
      return res.status(201).json({ 
        success: true, 
        company: newCompany,
        message: 'Company created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Companies API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process companies request',
      details: error.message 
    });
  }
}
