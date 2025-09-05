// Wave Invoices API (GraphQL)
export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 'no-store'); } catch (_) {}
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
      const url = (()=>{ try{ return new URL(req.url, 'http://local'); }catch(_){ return null; } })();
      const debug = url?.searchParams?.get('debug');
      const pageSize = Number(process.env.WAVE_PAGE_SIZE || 50);
      const query = `
        query Invoices($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            invoices(page: $page, pageSize: $pageSize) {
              pageInfo { currentPage totalPages totalCount }
              edges { node {
                id
                invoiceNumber
                status
                createdAt
                invoiceDate
                dueDate
                amountDue { value currency { code } }
                total { value currency { code } }
                customer { id name }
              } }
            }
          }
        }
      `;

      let page = 1; const all = []; let lastPageInfo = null;
      while (true) {
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { businessId, page, pageSize } }),
          signal: controller.signal
        });
        const json = await r.json();
        if (json.errors) return res.status(500).json({ error: 'Wave GraphQL error', details: json.errors });
        const slice = json.data?.business?.invoices;
        const edges = slice?.edges || [];
        const parseMoney = (v) => {
          if (v == null) return null;
          if (typeof v === 'number') return v;
          const n = parseFloat(String(v).replace(/,/g, ''));
          return Number.isFinite(n) ? n : null;
        };
        all.push(...edges.map(e => {
          const amountDueValue = parseMoney((e.node.amountDue && (e.node.amountDue.value ?? e.node.amountDue?.amount)) ?? null);
          const totalValue = parseMoney((e.node.total && (e.node.total.value ?? e.node.total?.amount)) ?? null);
          const currencyCode = e.node.total?.currency?.code || e.node.amountDue?.currency?.code;
          return {
            id: e.node.id,
            invoiceNumber: e.node.invoiceNumber,
            status: (e.node.status || '').toLowerCase(),
            createdAt: e.node.createdAt,
            invoiceDate: e.node.invoiceDate,
            dueDate: e.node.dueDate,
            // Store both amounts; UI will choose best to display
            amountDue: amountDueValue,
            total: totalValue,
            currency: currencyCode,
            customerName: e.node.customer?.name,
            customer: e.node.customer
          };
        }));
        const pageInfo = slice?.pageInfo; lastPageInfo = pageInfo || lastPageInfo;
        if (!pageInfo || pageInfo.currentPage >= pageInfo.totalPages) break;
        page += 1;
      }
      if (debug) return res.status(200).json({ invoices: all, pageInfo: lastPageInfo });
      return res.status(200).json({ invoices: all });
    }

    if (req.method === 'POST') {
      const { customer = {}, currency = 'USD', items = [] } = req.body || {};

      // Ensure we have a customerId; if not, create the customer first
      let customerId = customer.id;
      if (!customerId) {
        const customerMutation = `
          mutation CreateCustomer($input: CustomerCreateInput!) {
            customerCreate(input: $input) { didSucceed inputErrors { message field } customer { id name email } }
          }
        `;
        const customerInput = {
          businessId,
          name: customer.name || 'New Customer',
          email: customer.email || null,
          address: {
            city: customer.city || undefined,
            line1: customer.address || undefined
          }
        };
        const cr = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: customerMutation, variables: { input: customerInput } }),
          signal: controller.signal
        });
        const cjson = await cr.json();
        if (cjson.errors || !cjson.data?.customerCreate?.didSucceed) {
          return res.status(500).json({ error: 'Wave create customer failed', details: cjson.errors || cjson.data?.customerCreate?.inputErrors });
        }
        customerId = cjson.data.customerCreate.customer.id;
      }

      const invoiceMutation = `
        mutation CreateInvoice($input: InvoiceCreateInput!) {
          invoiceCreate(input: $input) { didSucceed inputErrors { message field } invoice { id invoiceNumber } }
        }
      `;
      const lineItems = (items || []).map(it => ({
        description: it.description,
        unitPrice: { value: Number(it.unitPrice || 0), currency: currency },
        quantity: Number(it.quantity || 1)
      }));
      const input = {
        businessId,
        customerId,
        currency: { code: currency },
        items: lineItems
      };
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: invoiceMutation, variables: { input } }),
        signal: controller.signal
      });
      const json = await r.json();
      if (json.errors || !json.data?.invoiceCreate?.didSucceed) {
        return res.status(500).json({ error: 'Wave create invoice failed', details: json.errors || json.data?.invoiceCreate?.inputErrors, request: input });
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


