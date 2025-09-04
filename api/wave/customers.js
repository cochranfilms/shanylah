// Mock Wave Customers API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const customers = [
    { id: 'c1', name: 'Acme Corp', email: 'ap@acme.com', city: 'Atlanta' },
    { id: 'c2', name: 'Globex', email: 'billing@globex.com', city: 'Savannah' },
    { id: 'c3', name: 'Initech', email: 'accounts@initech.com', city: 'Augusta' }
  ];

  return res.status(200).json({ customers });
}


