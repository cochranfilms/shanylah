// Wave Customers API (GraphQL)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.WAVE_API_TOKEN || process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }

  const endpoint = process.env.WAVE_API_URL || 'https://gql.waveapps.com/graphql/public';
  const controller = new AbortController();
  const timeoutMs = Number(process.env.WAVE_TIMEOUT_MS || 20000);
  const timeout = setTimeout(() => { try { controller.abort(); } catch (_) {} }, timeoutMs);
  req.on('aborted', () => { try { controller.abort(); } catch (_) {} });
  req.on('close', () => { try { controller.abort(); } catch (_) {} });
  const query = `
    query Customers($businessId: ID!, $page: Int) {
      business(id: $businessId) {
        customers(page: $page) {
          pageInfo { currentPage totalPages }
          edges { node { id name email } }
        }
      }
    }
  `;
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { businessId } }),
      signal: controller.signal
    });
    const json = await r.json();
    if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
    const edges = json.data?.business?.customers?.edges || [];
    const customers = edges.map(e => ({ id: e.node.id, name: e.node.name, email: e.node.email }));
    return res.status(200).json({ customers });
  } catch (e) {
    if (e?.name === 'AbortError' || e?.code === 'ABORT_ERR') {
      if (!res.headersSent) return res.status(499).json({ error: 'Request aborted by client or timeout' });
      return;
    }
    return res.status(500).json({ error: 'Wave request failed', details: e.message });
  } finally {
    clearTimeout(timeout);
  }
}


