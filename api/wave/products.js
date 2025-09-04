// Mock Wave Products API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const products = [
    { id: 'p1', name: 'Video Shoot (Half Day)', unitPrice: 750, description: 'Up to 4 hours on-site' },
    { id: 'p2', name: 'Video Editing (per day)', unitPrice: 500, description: 'Editing, color, basic sound' },
    { id: 'p3', name: 'Brand Strategy Session', unitPrice: 350, description: '90-minute consult + plan' }
  ];

  return res.status(200).json({ products });
}


