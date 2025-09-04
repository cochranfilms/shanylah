// Wave Invoices API (GraphQL)
export default async function handler(req, res) {
  const token = process.env.WAVE_API_TOKEN || process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }

  const endpoint = process.env.WAVE_API_URL || 'https://gql.waveapps.com/graphql/public';
  const controller = new AbortController();
  const timeoutMs = Number(process.env.WAVE_TIMEOUT_MS || 20000);
  const timeout = setTimeout(() => {
    try { controller.abort(); } catch (_) {}
  }, timeoutMs);
  req.on('aborted', () => { try { controller.abort(); } catch (_) {} });
  req.on('close', () => { try { controller.abort(); } catch (_) {} });

  try {
    if (req.method === 'GET') {
      const query = `
        query Invoices($businessId: ID!, $page: Int) {
          business(id: $businessId) {
            invoices(page: $page) {
              pageInfo { currentPage totalPages }
              edges { node {
                id
                invoiceNumber
                status
                createdAt
                dueAt
              } }
            }
          }
        }
      `;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { businessId } }),
        signal: controller.signal
      });
      const json = await r.json();
      if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
      const edges = json.data?.business?.invoices?.edges || [];
      const invoices = edges.map(e => ({
        id: e.node.id,
        invoiceNumber: e.node.invoiceNumber,
        status: (e.node.status || '').toLowerCase(),
        createdAt: e.node.createdAt,
        dueDate: e.node.dueAt
      }));
      return res.status(200).json({ invoices });
    }

    if (req.method === 'POST') {
      const { customer = {}, currency = 'USD', items = [] } = req.body || {};
      const mutation = `
        mutation CreateInvoice($input: InvoiceCreateInput!) {
          invoiceCreate(input: $input) { didSucceed inputErrors { message } invoice { id invoiceNumber } }
        }
      `;
      const lineItems = (items || []).map(it => ({
        description: it.description,
        unitPrice: { value: Number(it.unitPrice || 0), currency: currency },
        quantity: Number(it.quantity || 1)
      }));
      const input = {
        businessId,
        customerId: customer.id,
        currency: { code: currency },
        items: lineItems
      };
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation, variables: { input } }),
        signal: controller.signal
      });
      const json = await r.json();
      if (json.errors || !json.data?.invoiceCreate?.didSucceed) {
        return res.status(500).json({ error: 'Wave create invoice failed', details: json.errors || json.data?.invoiceCreate?.inputErrors });
      }
      return res.status(201).json({ success: true, invoice: json.data.invoiceCreate.invoice });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') {
      if (!res.headersSent) return res.status(499).json({ error: 'Request aborted by client or timeout' });
      return;
    }
    console.error('Wave Invoices API Error:', error);
    return res.status(500).json({ error: 'Failed to process invoices request', details: error.message });
  } finally {
    clearTimeout(timeout);
  }
}


