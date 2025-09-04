// HubSpot Deals API
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
      // Fetch deals
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=20&properties=dealname,amount,dealstage,closedate,hs_lead_status', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend
      const deals = data.results.map(deal => ({
        id: deal.id,
        dealName: deal.properties.dealname || 'Untitled Deal',
        amount: deal.properties.amount || '0',
        dealStage: deal.properties.dealstage || 'appointmentscheduled',
        closeDate: deal.properties.closedate || '',
        leadStatus: deal.properties.hs_lead_status || 'new'
      }));

      return res.status(200).json({ deals });

    } else if (req.method === 'POST') {
      // Create new deal
      const { dealName, amount, dealStage, closeDate, associatedContact } = req.body;

      const dealData = {
        properties: {
          dealname: dealName,
          amount: amount,
          dealstage: dealStage || 'appointmentscheduled',
          closedate: closeDate,
          hs_lead_status: 'new'
        }
      };

      // Add associated contact if provided
      if (associatedContact) {
        dealData.associations = [{
          to: { id: associatedContact },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal association
        }];
      }

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers,
        body: JSON.stringify(dealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newDeal = await response.json();
      return res.status(201).json({ 
        success: true, 
        deal: newDeal,
        message: 'Deal created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Deals API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process deals request',
      details: error.message 
    });
  }
}
