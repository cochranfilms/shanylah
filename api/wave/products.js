// Wave Products API (GraphQL products are "products" graph type)
export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 'no-store'); } catch (_) {}
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.WAVE_API_TOKEN || process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }
  const endpoint = process.env.WAVE_API_URL || 'https://gql.waveapps.com/graphql/public';
  const pageSize = Number(process.env.WAVE_PAGE_SIZE || 50);
  const query = `
    query Products($businessId: ID!, $page: Int!, $pageSize: Int!){
      business(id: $businessId) {
        products(page: $page, pageSize: $pageSize){
          pageInfo { currentPage totalPages totalCount }
          edges { node { id name unitPrice { value currency { code } } description } }
        }
      }
    }
  `;
  try {
    let page = 1; const all = [];
    while (true) {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { businessId, page, pageSize } })
      });
      const json = await r.json();
      if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
      const slice = json.data?.business?.products;
      const edges = slice?.edges || [];
      all.push(...edges.map(e => ({
        id: e.node.id,
        name: e.node.name,
        unitPrice: e.node.unitPrice?.value,
        currency: e.node.unitPrice?.currency?.code,
        description: e.node.description
      })));
      const pageInfo = slice?.pageInfo;
      if (!pageInfo || pageInfo.currentPage >= pageInfo.totalPages) break;
      page += 1;
    }
    return res.status(200).json({ products: all });
  } catch (e) {
    return res.status(500).json({ error: 'Wave request failed', details: e.message });
  }
}


