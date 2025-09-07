export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const hasToken = Boolean(process.env.WAVE_API_TOKEN);
  const hasBusinessId = Boolean(process.env.WAVE_BUSINESS_ID);
  return res.status(200).json({ ok: hasToken && hasBusinessId, hasToken, hasBusinessId });
}


