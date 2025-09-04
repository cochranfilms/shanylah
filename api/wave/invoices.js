// Mock Wave Invoices API
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const invoices = [
        {
          id: '1001',
          invoiceNumber: 'INV-1001',
          customerName: 'Acme Corp',
          total: 1500.0,
          currency: 'USD',
          status: 'sent',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString()
        },
        {
          id: '1002',
          invoiceNumber: 'INV-1002',
          customerName: 'Globex',
          total: 750.0,
          currency: 'USD',
          status: 'paid',
          createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '1003',
          invoiceNumber: 'INV-1003',
          customerName: 'Initech',
          total: 980.0,
          currency: 'USD',
          status: 'overdue',
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          dueDate: new Date(Date.now() - 86400000 * 1).toISOString()
        }
      ];
      return res.status(200).json({ invoices });
    }

    if (req.method === 'POST') {
      const { customer = {}, currency = 'USD', items = [] } = req.body || {};
      const total = (items || []).reduce((sum, item) => {
        const qty = Number(item?.quantity || 0);
        const price = Number(item?.unitPrice || 0);
        return sum + qty * price;
      }, 0);

      const id = String(Date.now());
      const invoice = {
        id,
        invoiceNumber: `INV-${id.slice(-6)}`,
        customerName: customer?.name || 'Unnamed',
        total: Number(total.toFixed(2)),
        currency,
        status: 'draft',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
      };
      return res.status(201).json({ success: true, invoice });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wave Invoices API Error:', error);
    return res.status(500).json({ error: 'Failed to process invoices request', details: error.message });
  }
}


