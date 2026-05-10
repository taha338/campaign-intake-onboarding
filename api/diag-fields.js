// Temporary diagnostic — returns custom fields for the campaign intake list.
export default async function handler(req, res) {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = req.query.list || '901113726567';
  if (!token) return res.status(500).json({ error: 'no token' });
  const r = await fetch(`https://api.clickup.com/api/v2/list/${listId}/field`, {
    headers: { Authorization: token, Accept: 'application/json' },
  });
  const data = await r.json();
  const fields = (data.fields || []).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    required: f.required,
    type_config: f.type_config,
  }));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ list: listId, count: fields.length, fields });
}
