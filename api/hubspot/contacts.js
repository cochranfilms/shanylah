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
      // Cursor-paginated fetch using HubSpot search API, sorted by recent created date
      const url = (()=>{ try{ return new URL(req.url, 'http://local'); }catch(_){ return null; } })();
      const apiLimit = Math.min(1000, Math.max(1, Number(url?.searchParams?.get('limit') || 300))); // total desired
      const pageSize = Math.min(100, Math.max(1, Number(url?.searchParams?.get('pageSize') || 100))); // per page
      let after = url?.searchParams?.get('after') || undefined;
      const contacts = [];
      const props = ['firstname','lastname','email','company','phone','hs_lead_status','createdate'];

      while (contacts.length < apiLimit) {
        const body = {
          sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
          properties: props,
          limit: Math.min(pageSize, apiLimit - contacts.length),
          after
        };
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          throw new Error(`HubSpot API error: ${response.status}`);
        }
        const data = await response.json();
        (data.results || []).forEach(contact => {
          contacts.push({
            id: contact.id,
            firstName: contact.properties?.firstname || '',
            lastName: contact.properties?.lastname || '',
            email: contact.properties?.email || '',
            company: contact.properties?.company || '',
            phone: contact.properties?.phone || '',
            leadStatus: contact.properties?.hs_lead_status || 'new',
            createdAt: contact.properties?.createdate
          });
        });
        after = data.paging?.next?.after;
        if (!after) break;
      }

      return res.status(200).json({ contacts, nextAfter: after });

    } else if (req.method === 'POST') {
      // Create new contact
      const { firstName, lastName, email, phone, company, leadSource, notes } = req.body;

      // Map frontend lead source values to HubSpot values
      const leadSourceMap = {
        'website': 'DIRECT_TRAFFIC',
        'referral': 'REFERRALS',
        'social_media': 'SOCIAL_MEDIA',
        'google': 'ORGANIC_SEARCH',
        'linkedin': 'SOCIAL_MEDIA',
        'email': 'EMAIL_MARKETING',
        'phone': 'OFFLINE',
        'other': 'OTHER_CAMPAIGNS'
      };

      const mappedLeadSource = leadSourceMap[leadSource] || 'DIRECT_TRAFFIC';

      const contactData = {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          company: company,
          hs_analytics_source: mappedLeadSource,
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
