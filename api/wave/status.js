export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 'no-store'); } catch (_) {}
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.WAVE_API_TOKEN || process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ ok: false, error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }

  const endpoint = process.env.WAVE_API_URL || 'https://gql.waveapps.com/graphql/public';
  const query = `query WaveStatus($id: ID!) { business(id: $id) { id name isClassicInvoicing } }`;
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { id: businessId } })
    });
    const json = await r.json();
    if (json.errors) {
      return res.status(500).json({ ok: false, error: 'Wave GraphQL error', details: json.errors });
    }
    const business = json.data?.business;
    return res.status(200).json({ ok: true, business });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Wave request failed', details: e.message });
  }
}


