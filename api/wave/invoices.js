// Wave Invoices API (GraphQL)
export default async function handler(req, res) {
  const token = process.env.WAVE_API_TOKEN;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!token || !businessId) {
    return res.status(500).json({ error: 'Missing WAVE_API_TOKEN or WAVE_BUSINESS_ID' });
  }

  const endpoint = 'https://gql.waveapps.com/graphql/public';

  try {
    if (req.method === 'GET') {
      const query = `
        query Invoices($businessId: ID!, $page: Int) {
          invoices(businessId: $businessId, page: $page) {
            pageInfo { currentPage totalPages }
            edges { node {
              id
              invoiceNumber
              status
              createdAt
              dueAt
              currency { code }
              customer { id name }
              total { value }
            } }
          }
        }
      `;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { businessId } })
      });
      const json = await r.json();
      if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
      const invoices = (json.data?.invoices?.edges || []).map(e => ({
        id: e.node.id,
        invoiceNumber: e.node.invoiceNumber,
        customerName: e.node.customer?.name,
        total: e.node.total?.value,
        currency: e.node.currency?.code,
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
        body: JSON.stringify({ query: mutation, variables: { input } })
      });
      const json = await r.json();
      if (json.errors || !json.data?.invoiceCreate?.didSucceed) {
        return res.status(500).json({ error: 'Wave create invoice failed', details: json.errors || json.data?.invoiceCreate?.inputErrors });
      }
      return res.status(201).json({ success: true, invoice: json.data.invoiceCreate.invoice });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wave Invoices API Error:', error);
    return res.status(500).json({ error: 'Failed to process invoices request', details: error.message });
  }
}


