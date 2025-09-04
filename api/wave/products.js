// Wave Products API (GraphQL products are "products" graph type)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.WAVE_API_TOKEN;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }
  const endpoint = 'https://gql.waveapps.com/graphql/public';
  const query = `
    query Products($businessId: ID!, $page: Int){
      business(id: $businessId) {
        products(page: $page){
          edges { node { id name unitPrice { value currency { code } } description } }
        }
      }
    }
  `;
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { businessId } })
    });
    const json = await r.json();
    if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
    const edges = json.data?.business?.products?.edges || [];
    const products = edges.map(e => ({
      id: e.node.id,
      name: e.node.name,
      unitPrice: e.node.unitPrice?.value,
      currency: e.node.unitPrice?.currency?.code,
      description: e.node.description
    }));
    return res.status(200).json({ products });
  } catch (e) {
    return res.status(500).json({ error: 'Wave request failed', details: e.message });
  }
}


