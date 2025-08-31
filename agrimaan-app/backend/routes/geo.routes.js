const express = require('express');
const router = express.Router();

// GET /api/geo/suggest?query=melbourne
router.get('/geo/suggest', async (req, res) => {
  try {
    const q = (req.query.query || '').toString().trim();
    if (!q) return res.json([]);

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');

    const r = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'agrimaan-app (contact: admin@agrimaan.local)'
      }
    });
    if (!r.ok) throw new Error(`Upstream ${r.status}`);

    const data = await r.json();

    const results = (data || []).map((d) => ({
      id: d.place_id,
      name:
        d.display_name?.split(',')?.slice(0, 2)?.join(', ') ??
        d.name ??
        d.display_name ??
        'Unknown',
      displayName: d.display_name,
      lat: Number(d.lat),
      lng: Number(d.lon),
      type: d.type,
      countryCode: d.address?.country_code?.toUpperCase() || null,
    }));

    res.json(results);
  } catch (e) {
    console.error('geo/suggest error', e);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
